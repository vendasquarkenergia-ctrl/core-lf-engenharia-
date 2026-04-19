-- migration 202604180001_storage_bucket_rdo.sql

-- Criar o bucket `rdo_midias` se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('rdo_midias', 'rdo_midias', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar RLS do Storage
-- Permitir leitura pública (para todos visualizarem as fotos no sistema)
CREATE POLICY "Fotos do RDO sao publicas para visualizacao" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'rdo_midias');

-- Permitir upload apenas para usuários logados
CREATE POLICY "Usuarios autenticados podem fazer upload de fotos" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'rdo_midias' 
    AND auth.role() = 'authenticated'
);

-- Permitir deleção/edição pelo dono (opcional, mas boa prática)
CREATE POLICY "Autor pode deletar ou atualizar sua propria foto"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'rdo_midias'
    AND auth.uid() = owner
);
