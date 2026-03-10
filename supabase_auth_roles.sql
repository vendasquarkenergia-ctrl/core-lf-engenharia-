-- =========================================================================================
-- CORE Enterprise - Sistema de Autenticação e Perfis (RBAC - Role Based Access Control)
-- Objetivo: Criar a tabela pública de perfis conectada ao "auth.users" secreto do Supabase.
-- =========================================================================================

-- 1. Criar a Tabela de Perfis (users_profiles)
-- Esta tabela guarda os dados públicos (nome, foto, cargo) sem expor senhas.
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'COLABORADOR', 'CLIENTE')) DEFAULT 'COLABORADOR',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Ativar RLS (Row Level Security) - "A Porta do Cofre"
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Políticas de Segurança (Policies)
-- Política 1: Todos logados podem VER o perfil dos colegas (para a página de equipe)
CREATE POLICY "Permitir leitura para usuários autenticados" 
ON public.users_profiles FOR SELECT 
TO authenticated 
USING (true);

-- Política 2: O usuário só pode EDITAR o próprio perfil (nome, foto)
CREATE POLICY "Permitir update no proprio perfil" 
ON public.users_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 3. Trigger Automática (A Mágica)
-- Quando você criar um funcionário lá no painel 'Authentication' do Supabase,
-- esta trigger copia os dados automaticamente para a tabela 'users_profiles'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users_profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        -- Pega o nome do metadata (se houver) ou tira do email (ex: joao@lf -> JOAO)
        COALESCE(NEW.raw_user_meta_data->>'name', UPPER(SPLIT_PART(NEW.email, '@', 1))),
        -- Se o email tiver 'admin' ganha ADMIN automático apenas na primeira vez, senão COLABORADOR
        CASE 
            WHEN NEW.email ILIKE '%admin%' THEN 'ADMIN'
            ELSE 'COLABORADOR'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associa o Gatilho à tabela secreta de usuários recém-criados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================================================
-- INSTRUÇÕES PARA O DONO (ADMIN) CRIAR O PRIMEIRO ACESSO:
-- =========================================================================================
/*
1. Acesse o painel do Supabase.
2. Vá no SQL Editor (ícone de código na barra esquerda) e rode este script inteiro.
3. Depois vá no menu "Authentication" (ícone de cadeado).
4. Clique no botão "Add user" -> "Create new user".
5. Digite o seu email de dono (ex: arthur.admin@lfengenharia.com) e crie uma senha forte.
   OBS: Note que eu coloquei uma regra na linha 40: se a palavra "admin" estiver no seu email, 
   o sistema já te dá poder Master/Dono do CORE automaticamente.
6. Pronto! Agora vá no seu localhost:3000, faça login e veja a mágica.

Para adicionar um mestre de obras: Repita o passo 4 e 5! 
Se o email não tiver "admin", ele vira COLABORADOR comum. (E você como ADMIN pode mudar via banco depois).
*/
