-- migration: create_audit_logs

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID, -- Relacionado a auth.users se necessário
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address TEXT
);

-- Índices para otimizar pesquisas no painel de admin
CREATE INDEX IF NOT EXISTS audit_logs_table_name_idx ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS audit_logs_record_id_idx ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS audit_logs_changed_at_idx ON public.audit_logs(changed_at);

-- Configuração de RLS (Row Level Security) - Somente admins leem, ninguém altera
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  -- Exemplo de verificação de role admin, ajuste conforme o seu schema de RBAC
  auth.jwt()->>'role' = 'admin'
);

-- Trigger Function Genérica para Auditoria
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    _user_id UUID;
    _ip_address TEXT;
BEGIN
    -- Captura o ID do usuário diretamente do contexto do Supabase Auth
    _user_id := auth.uid();
    
    -- Captura IP das headers (Se disponibilizado mapeado via postgrest) ou pode ser nulo se não estritamente necessário
    _ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';

    -- Lógica para cada tipo de operação
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by, ip_address)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, row_to_json(NEW)::JSONB, _user_id, _ip_address);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by, ip_address)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, _user_id, _ip_address);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by, ip_address)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, row_to_json(OLD)::JSONB, _user_id, _ip_address);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- INSTRUÇÕES DE USO (Rodar para cada tabela crítica)
-- ==========================================
/*
CREATE TRIGGER tarefas_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER rdo_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.rdo
FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();
*/
