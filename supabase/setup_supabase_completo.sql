-- ==============================================================================
-- LF OS MASTER SCHEMA (Enterprise Grade)
-- Execute este script inteiro de uma só vez no SQL Editor do Supabase.
-- ==============================================================================

-- 1. EXTENSÕES & ENUMS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criação do tipo enumerado para os papéis (Roles) do sistema
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('ADMIN', 'ENGENHEIRO', 'MESTRE', 'CLIENTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PERFIS E AUTENTICAÇÃO (Sincronização com Supabase Auth)
-- ==============================================================================

-- Tabela Atrelada diretamente aos registros de Usuário criados no Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role public.app_role NOT NULL DEFAULT 'MESTRE',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar a Parede de RLS em Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Usuarios autenticados podem ver todos os perfis" 
    ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Usuarios podem atualizar o proprio perfil" ON public.profiles;
CREATE POLICY "Usuarios podem atualizar o proprio perfil" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Função Automática de Sincronização (Trigger) de Contas Criadas!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role_val public.app_role;
  nome_val text;
BEGIN
  BEGIN
    IF new.raw_user_meta_data->>'role' IS NOT NULL AND new.raw_user_meta_data->>'role' != '' THEN
      role_val := UPPER(new.raw_user_meta_data->>'role')::public.app_role;
    ELSE
      role_val := 'MESTRE'::public.app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    role_val := 'MESTRE'::public.app_role;
  END;

  nome_val := COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário ' || split_part(COALESCE(new.email, 'novo@user.com'), '@', 1));

  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.email, 'sem_email_' || new.id || '@app.com'),
    nome_val,
    role_val,
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Forçar atrelagem do Trigger a toda conta gerada.
-- NOTA: Como você está rodando no Painel Web, o Supabase bloqueia a criação de triggers na tabela auth.users por segurança (Erro 42501).
-- Para contornar, eu deixei a função preparada. Você precisará plugar o Trigger manualmente painel: 
-- Vá em Database -> Triggers -> Create a new Trigger -> Nome: on_auth_user_created, Tabela: users (Schema auth), Evento: AFTER INSERT, Função: handle_new_user.

-- Helper function nativa (Impede Injeção do Cliente para Ler Permissão REAL)
CREATE OR REPLACE FUNCTION public.user_role() RETURNS public.app_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- 3. TABELAS DE DADOS (Core do LF OS)
-- ==============================================================================

-- A) Obras base
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    valor_investido NUMERIC(15,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Ativa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B) RDO_MASTER (A tabela real validada pela nossa auditoria do Front-end)
CREATE TABLE IF NOT EXISTS public.rdo_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL, 
    data_referencia DATE NOT NULL DEFAULT CURRENT_DATE,
    clima_str VARCHAR(255),
    status_sync VARCHAR(50) DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mídias geradas no app
CREATE TABLE IF NOT EXISTS public.rdo_midias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rdo_id UUID REFERENCES rdo_master(id) ON DELETE CASCADE,
    url_storage TEXT NOT NULL,
    geolocalizacao_foto VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suprimentos
CREATE TABLE IF NOT EXISTS public.suprimentos_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
    solicitante_id UUID NOT NULL,
    descricao TEXT NOT NULL,
    quantidade DECIMAL NOT NULL,
    unidade VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outros
CREATE TABLE IF NOT EXISTS public.timeline_fotos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obra_id UUID REFERENCES obras(id) ON DELETE CASCADE,
    autor_id UUID NOT NULL,
    url_foto TEXT NOT NULL,
    legenda TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C) Auditoria Oculta
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    tabela_afetada VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    dados_antigos JSONB,
    dados_novos JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 4. APLICAÇÃO GERAL DE ROW LEVEL SECURITY (RLS Zero Trust)
-- ==============================================================================

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rdo_midias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suprimentos_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- OBRAS: Leitura Pública, Edição Restrita ao ADMIN
DROP POLICY IF EXISTS "Leitura de Obras publica para autenticados" ON obras;
CREATE POLICY "Leitura de Obras publica para autenticados" ON obras FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Apenas ADMIN pode cadastrar Obra" ON obras;
CREATE POLICY "Apenas ADMIN pode cadastrar Obra" ON obras FOR INSERT WITH CHECK (public.user_role() = 'ADMIN'::public.app_role);

DROP POLICY IF EXISTS "Apenas ADMIN pode editar Obra" ON obras;
CREATE POLICY "Apenas ADMIN pode editar Obra" ON obras FOR UPDATE USING (public.user_role() = 'ADMIN'::public.app_role);


-- RDO: Autor Original tem controle, outros observam.
DROP POLICY IF EXISTS "Leitura RDO publica autenticado" ON rdo_master;
CREATE POLICY "Leitura RDO publica autenticado" ON rdo_master FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Insercao protegida por autoria" ON rdo_master;
CREATE POLICY "Insercao protegida por autoria" ON rdo_master FOR INSERT WITH CHECK (auth.uid() = autor_id);

DROP POLICY IF EXISTS "Criador atualiza RDO" ON rdo_master;
CREATE POLICY "Criador atualiza RDO" ON rdo_master FOR UPDATE USING (auth.uid() = autor_id OR public.user_role() = 'ADMIN'::public.app_role);


-- 5. STORAGE BUCKET E RLS DE ARQUIVOS
-- ==============================================================================

-- Insere o bucket RDO no sistema visual Storage do BD
INSERT INTO storage.buckets (id, name, public) VALUES ('rdo_midias', 'rdo_midias', true) ON CONFLICT DO NOTHING;

-- Policies de upload
DROP POLICY IF EXISTS "Fotos publicas visualizacao" ON storage.objects;
CREATE POLICY "Fotos publicas visualizacao" 
  ON storage.objects FOR SELECT USING (bucket_id = 'rdo_midias');

DROP POLICY IF EXISTS "Usuarios autenticados podem fazer upload de fotos" ON storage.objects;
CREATE POLICY "Usuarios autenticados podem fazer upload de fotos" 
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'rdo_midias' AND auth.role() = 'authenticated');


-- ==============================================================================
-- Fim do Master Script
-- Após executar isso, abra a guia "Authentication -> Users" e clique em "Add User".
-- Adicione admin.frazao@lfengenharia.com para logarmos e o Trigger cuidar do resto!
-- ==============================================================================
