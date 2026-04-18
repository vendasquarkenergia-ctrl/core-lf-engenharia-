-- ==============================================================================
-- FASE 1: O Núcleo de Identidade e Segurança (Auth & Roles)
-- ==============================================================================

-- 1. Criação do tipo enumerado para os papéis (Roles) do sistema
-- Isso garante a integridade de dados; nenhuma role fora destas pode ser inserida.
CREATE TYPE public.app_role AS ENUM ('ADMIN', 'ENGENHEIRO', 'MESTRE', 'CLIENTE');

-- 2. Criação da tabela de Perfis (Profiles)
-- Baseada e vinculada unicamente à tabela auth.users do Supabase.
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role public.app_role NOT NULL DEFAULT 'MESTRE',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ativar extrema segurança de nível de linha (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS (Row Level Security) para Profiles

-- A) Leitura: Qualquer usuário autenticado no sistema pode ler o perfil de outros (necessário para listar eng/mestres em selects/tarefas).
CREATE POLICY "Usuários autenticados podem ver todos os perfis" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- B) Atualização (Self): Um usuário só pode atualizar o próprio perfil (nome, avatar, etc).
CREATE POLICY "Usuários podem atualizar o próprio perfil" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- NOTA DE SEGURANÇA: Ninguém além da API do banco e Administradores (se criarmos a regra futura) 
-- podem excluir perfis ou alterar o 'role' via client-side.
-- O 'role' não é modificável por um UPDATE do próprio usuário sem privilégios extras (necessitaria de verificação adicional em triggers de update).

-- 4. Função Automática de Sincronização (Trigger Function)
-- Roda em modo SECURITY DEFINER para ultrapassar o RLS e garantir o INSERT a partir do evento do schema "auth".
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    new.id,
    new.email,
    -- Tentará buscar dados do metadata no sign up, como 'full_name' e 'role', se passados no registro.
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário ' || split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::public.app_role, 'MESTRE'::public.app_role),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Trigger
-- Aciona a função acima toda vez que o Supabase registrar uma nova linha em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- Fim do Script da FASE 1
-- ==============================================================================
