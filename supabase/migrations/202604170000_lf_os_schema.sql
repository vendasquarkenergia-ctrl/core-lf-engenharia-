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

-- ==============================================================================
-- FASE 2: POLÍTICAS DE SEGURANÇA E RLS (ROW LEVEL SECURITY)
-- ==============================================================================

-- 1. Habilitando RLS em todas as tabelas estruturais
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE suprimentos_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Função auxiliar para verificar role do usuário atual
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS public.app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Políticas para OBRAS
CREATE POLICY "Leitura de obras pública para autenticados" 
    ON obras FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas ADMIN pode inserir/atualizar/deletar obras" 
    ON obras FOR ALL 
    USING (auth.user_role() = 'ADMIN'::public.app_role);

-- 4. Políticas para RDO DIÁRIO
CREATE POLICY "Leitura de RDO pública para autenticados" 
    ON rdo_diario FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Eng/Mestres podem criar RDO; check de autoria" 
    ON rdo_diario FOR INSERT 
    WITH CHECK (auth.uid() = autor_id AND auth.user_role() IN ('ADMIN'::public.app_role, 'ENGENHEIRO'::public.app_role, 'MESTRE'::public.app_role));

CREATE POLICY "Autor Original ou ADMIN podem atualizar RDO" 
    ON rdo_diario FOR UPDATE 
    USING (auth.uid() = autor_id OR auth.user_role() = 'ADMIN'::public.app_role);

CREATE POLICY "Apenas ADMIN pode deletar RDO" 
    ON rdo_diario FOR DELETE 
    USING (auth.user_role() = 'ADMIN'::public.app_role);

-- 5. Políticas para SUPRIMENTOS
CREATE POLICY "Leitura de Suprimentos pública para autenticados" 
    ON suprimentos_pedidos FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Criar pedido protegido por autoria" 
    ON suprimentos_pedidos FOR INSERT 
    WITH CHECK (auth.uid() = solicitante_id AND auth.user_role() IN ('ADMIN'::public.app_role, 'ENGENHEIRO'::public.app_role, 'MESTRE'::public.app_role));

CREATE POLICY "Autor Original ou ADMIN podem atualizar pedido" 
    ON suprimentos_pedidos FOR UPDATE 
    USING (auth.uid() = solicitante_id OR auth.user_role() = 'ADMIN'::public.app_role);

CREATE POLICY "Apenas ADMIN pode deletar Suprimento" 
    ON suprimentos_pedidos FOR DELETE 
    USING (auth.user_role() = 'ADMIN'::public.app_role);

-- 6. Políticas para TIMELINE FOTOS
CREATE POLICY "Leitura de Fotos pública para autenticados" 
    ON timeline_fotos FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem adicionar Fotos" 
    ON timeline_fotos FOR INSERT 
    WITH CHECK (auth.uid() = autor_id);

CREATE POLICY "Apenas ADMIN pode deletar Fotos" 
    ON timeline_fotos FOR DELETE 
    USING (auth.user_role() = 'ADMIN'::public.app_role);

-- 7. Políticas de Audit Logs
CREATE POLICY "Apenas ADMIN pode ler Auditoria" 
    ON audit_logs FOR SELECT 
    USING (auth.user_role() = 'ADMIN'::public.app_role);

