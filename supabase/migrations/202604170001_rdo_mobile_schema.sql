-- migration 202604170001_rdo_mobile_schema.sql
CREATE TABLE rdo_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL, 
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    clima_str VARCHAR(255),
    status_sync VARCHAR(50) DEFAULT 'PENDENTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rdo_efetivo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rdo_id UUID REFERENCES rdo_master(id) ON DELETE CASCADE,
    funcao VARCHAR(100) NOT NULL,
    quantidade_proprio INTEGER DEFAULT 0,
    quantidade_terceiro INTEGER DEFAULT 0
);

CREATE TABLE rdo_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rdo_id UUID REFERENCES rdo_master(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    percentual_concluido INTEGER DEFAULT 0 CHECK (percentual_concluido >= 0 AND percentual_concluido <= 100)
);

CREATE TABLE rdo_midias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rdo_id UUID REFERENCES rdo_master(id) ON DELETE CASCADE,
    url_storage TEXT NOT NULL,
    geolocalizacao_foto VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE rdo_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_efetivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rdo_midias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Obra team can read and edit own RDOs" ON rdo_master 
    USING (auth.uid() = autor_id);

CREATE POLICY "Obra team can read and edit own RDOs efetivo" ON rdo_efetivo 
    USING (EXISTS (SELECT 1 FROM rdo_master WHERE id = rdo_efetivo.rdo_id AND autor_id = auth.uid()));

CREATE POLICY "Obra team can read and edit own RDOs tarefas" ON rdo_tarefas 
    USING (EXISTS (SELECT 1 FROM rdo_master WHERE id = rdo_tarefas.rdo_id AND autor_id = auth.uid()));

CREATE POLICY "Obra team can read and edit own RDOs midias" ON rdo_midias 
    USING (EXISTS (SELECT 1 FROM rdo_master WHERE id = rdo_midias.rdo_id AND autor_id = auth.uid()));
