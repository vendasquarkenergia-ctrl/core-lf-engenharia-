-- LF OS - Arquitetura de Banco de Dados Supabase / PostgreSQL

-- 1. BASE SCHEMA
CREATE TABLE obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cliente_id UUID,
    orcamento_total DECIMAL(15,2) NOT NULL,
    data_inicio DATE,
    prazo DATE,
    status TEXT DEFAULT 'ATV'
);

CREATE TABLE rdo_diario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL,
    data DATE NOT NULL,
    clima_manha TEXT,
    clima_tarde TEXT,
    efetivo_proprio JSONB,
    efetivo_terceiro JSONB,
    observacoes TEXT
);

CREATE TABLE suprimentos_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
    solicitante_id UUID NOT NULL,
    item TEXT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    unidade TEXT,
    status TEXT DEFAULT 'PENDENTE' -- PENDENTE, COTACAO, APROVADO, ENTREGUE
);

CREATE TABLE timeline_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL,
    url TEXT NOT NULL,
    timestamp_verificado TIMESTAMPTZ DEFAULT now(),
    coordenadas_gps TEXT
);

-- 2. AUDIT TRAIL
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID, -- Capturado automaticamente via auth.uid() no Supabase
    timestamp TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT
);

-- 3. AUDIT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB = NULL;
    new_row JSONB = NULL;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        old_row = to_jsonb(OLD);
        new_row = to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        old_row = to_jsonb(OLD);
    ELSIF (TG_OP = 'INSERT') THEN
        new_row = to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_by,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        old_row,
        new_row,
        auth.uid(),
        now()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. BIND TRIGGERS TO CRITICAL TABLES
CREATE TRIGGER rdo_diario_audit
    AFTER INSERT OR UPDATE OR DELETE ON rdo_diario
    FOR EACH ROW EXECUTE FUNCTION process_audit_log();

CREATE TRIGGER suprimentos_audit
    AFTER INSERT OR UPDATE OR DELETE ON suprimentos_pedidos
    FOR EACH ROW EXECUTE FUNCTION process_audit_log();
