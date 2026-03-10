-- ==========================================================================================
-- POLÍTICAS DE SEGURANÇA PARA O STORAGE (BUCKET 'avatars')
-- ==========================================================================================

-- 1. Permitir visualização pública (Leitura)
-- Como você já setou o bucket como público na interface, isso pode ser redundante, mas é boa prática.
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatars' );

-- 2. Permitir que usuários logados façam Upload (Insert) das suas próprias fotos
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1] -- Garante que joguem na pasta com seu próprio ID
);

-- 3. Permitir que usuários logados atualizem (Update) suas próprias fotos
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Permitir deleção (Delete)
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
