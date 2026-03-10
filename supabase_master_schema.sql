-- =========================================================================
-- CORE Enterprise: Master Schema (LF Engenharia)
-- Padrão Vale do Silício: Tabelas, Relacionamentos e RLS
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. OBRAS (Projetos Atuais)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cliente_id UUID REFERENCES public.users_profiles(id), -- Opcional: Qual cliente é dono
    status TEXT NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA')),
    data_inicio DATE,
    data_previsao_fim DATE,
    orcamento_estimado DECIMAL(14,2) DEFAULT 0.00,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de Obras para todos autenticados" ON public.obras FOR SELECT TO authenticated USING (true);
CREATE POLICY "Apenas ADMIN/COLAB podem modificar Obras" ON public.obras FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM users_profiles WHERE role IN ('ADMIN', 'COLABORADOR')));


-- -------------------------------------------------------------------------
-- 2. TAREFAS (Tasks Kanban)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'BLOQUEADA')),
    prioridade TEXT NOT NULL DEFAULT 'MEDIA' CHECK (prioridade IN ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE')),
    atribuido_a UUID REFERENCES public.users_profiles(id) ON DELETE SET NULL,
    prazo DATE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.users_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tarefas_obra ON public.tarefas(obra_id);
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura de Tarefas" ON public.tarefas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Modificação de Tarefas Livre para Equipe" ON public.tarefas FOR ALL TO authenticated USING (true);


-- -------------------------------------------------------------------------
-- 3. ACOMPANHAMENTO (Timeline / Fotos da Obra)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timeline_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL DEFAULT 'FOTO' CHECK (tipo IN ('FOTO', 'MARCO_CONCLUIDO', 'ALERTA', 'RELATORIO')),
    media_url TEXT, -- Arquivo armazenado no Supabase Storage
    created_by UUID REFERENCES public.users_profiles(id),
    data_evento TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_timeline_obra ON public.timeline_eventos(obra_id);
ALTER TABLE public.timeline_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura Timeline" ON public.timeline_eventos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Criação Timeline por Equipe" ON public.timeline_eventos FOR INSERT TO authenticated WITH CHECK (auth.uid() IN (SELECT id FROM users_profiles WHERE role IN ('ADMIN', 'COLABORADOR')));


-- -------------------------------------------------------------------------
-- 4. RDO (Relatório Diário de Obras)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rdo_diarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    data_relatorio DATE NOT NULL DEFAULT CURRENT_DATE,
    condicao_climatica TEXT CHECK (condicao_climatica IN ('BOM', 'CHUVA', 'IMPRATICAVEL')),
    efetivo_total INTEGER DEFAULT 0,
    descricao_atividades TEXT NOT NULL,
    ocorrencias TEXT,
    created_by UUID REFERENCES public.users_profiles(id),
    status TEXT DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'ASSINADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(obra_id, data_relatorio) -- 1 RDO por obra por dia
);

ALTER TABLE public.rdo_diarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RDO Leitura" ON public.rdo_diarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "RDO Full Access Admin/Colab" ON public.rdo_diarios FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM users_profiles WHERE role IN ('ADMIN', 'COLABORADOR')));


-- -------------------------------------------------------------------------
-- 5. FINANCEIRO (Dashboard / Entradas e Saídas / DRE)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID REFERENCES public.obras(id) ON DELETE CASCADE, -- Pode ser NULL se for custo fixo do escritório
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
    categoria TEXT NOT NULL, -- Ex: 'MATERIAL', 'MÃO_DE_OBRA', 'MEDIÇÃO', 'IMPOSTO'
    valor DECIMAL(14,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO')),
    anexo_url TEXT,
    created_by UUID REFERENCES public.users_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_financeiro_obra ON public.lancamentos_financeiros(obra_id);
CREATE INDEX idx_financeiro_tipo_status ON public.lancamentos_financeiros(tipo, status);
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
-- Regra Estrita: Apenas ADMIN vê dinheiro. (Exigência do Master Dashboard)
CREATE POLICY "Apenas ADMIN acessa Financeiro" ON public.lancamentos_financeiros FOR ALL TO authenticated USING (auth.uid() IN (SELECT id FROM users_profiles WHERE role = 'ADMIN'));


-- -------------------------------------------------------------------------
-- 6. GATILHOS DE ATUALIZAÇÂO (updated_at automático em todas)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_obras_modtime BEFORE UPDATE ON public.obras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tarefas_modtime BEFORE UPDATE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rdo_modtime BEFORE UPDATE ON public.rdo_diarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financeiro_modtime BEFORE UPDATE ON public.lancamentos_financeiros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- PARA ATIVAR O AUDIT_TRAIL (Rastro) QUE CRIAMOS MAIS CEDO NAS TABELAS CRÍTICAS
-- =========================================================================
CREATE TRIGGER tr_audit_financeiro AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos_financeiros FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();
CREATE TRIGGER tr_audit_rdo AFTER INSERT OR UPDATE OR DELETE ON public.rdo_diarios FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();
CREATE TRIGGER tr_audit_tarefas AFTER INSERT OR UPDATE OR DELETE ON public.tarefas FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();
