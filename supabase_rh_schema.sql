-- =========================================================================
-- CORE Enterprise: Módulo RH & Pessoal
-- =========================================================================

-- 1. TABELA DE CARGOS (Hierarquia e Tipos de Vínculos)
CREATE TABLE IF NOT EXISTS public.cargos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,            -- ex: Engenheiro Civil, Pedreiro, Auxiliar...
    nivel VARCHAR(50),                     -- ex: Junior, Pleno, Senior, Especialista
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE FUNCIONÁRIOS (Corpo de Equipe)
CREATE TABLE IF NOT EXISTS public.funcionarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Opcional: Se ele tiver acesso ao sistema
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    cargo_id UUID REFERENCES public.cargos(id) ON DELETE RESTRICT,
    
    -- Status no sistema
    status VARCHAR(50) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'FERIAS', 'AFASTADO', 'DESLIGADO')),
    tipo_contratacao VARCHAR(50) DEFAULT 'CLT' CHECK (tipo_contratacao IN ('CLT', 'PJ', 'TERCEIRIZADO', 'ESTAGIO')),
    
    -- Dados Financeiros Base (Serão usados no DRE)
    salario_base DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    encargos_estimados DECIMAL(12, 2) DEFAULT 0.00, -- Ex: 40% a 80% do salário p/ CLT
    custo_total_mes DECIMAL(12, 2) GENERATED ALWAYS AS (salario_base + encargos_estimados) STORED,
    
    -- Vínculo Atual de Construção
    obra_alocada_id UUID REFERENCES public.obras(id) ON DELETE SET NULL, -- Se NULL, trabalha no Escritório HQ
    
    -- Datas
    data_admissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_bloqueio DATE, -- Data de demissão ou fim de contrato
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. POLÍTICAS DE SEGURANÇA BÁSICAS - RLS
-- =========================================================================

ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Qualquer Admin ou RH da LF Engenharia pode mexer nisso
CREATE POLICY "Permitir leitura de cargos para usuários logados" ON public.cargos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir inserção de cargos para usuários logados" ON public.cargos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir leitura de funcionarios" ON public.funcionarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Permitir CRUD de funcionários p/ todos" ON public.funcionarios FOR ALL TO authenticated USING (true);
