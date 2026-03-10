-- =========================================================================
--  CORE Enterprise - Audit Trail System (Vale do Silício Padrão de Resiliência)
--  Descrição: Registra todo CREATE, UPDATE e DELETE de tabelas auditadas.
-- =========================================================================

-- 1. Cria a Tabela de Logs de Auditoria Global
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Captura exatamente qual conta do Supabase fez a mutação
    client_ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices pesados para suportar BIs e relatórios no futuro
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_changed_by ON public.audit_logs(changed_by);

-- 2. Cria a Função de Trigger Universal (Escrita em PL/pgSQL)
CREATE OR REPLACE FUNCTION public.core_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Permite que a trigger rode com privilégios master internamente
AS $$
DECLARE
    v_user_id UUID;
    v_client_ip TEXT;
    v_record_id TEXT;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    -- [Magia Supabase] Tenta extrair o ID do usuário do JWT (auth.uid()) e o IP da request HTTP original
    BEGIN
        v_user_id := auth.uid();
        v_client_ip := current_setting('request.headers')::json->>'x-forwarded-for';
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
        v_client_ip := 'SYSTEM/UNKNOWN';
    END;

    -- Lógica para cada tipo de transação (DML)
    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.id::TEXT;
        v_old_data := to_jsonb(OLD);
        v_new_data := NULL;
        
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by, client_ip)
        VALUES (TG_TABLE_NAME::TEXT, v_record_id, TG_OP, v_old_data, v_new_data, v_user_id, v_client_ip);
        RETURN OLD;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.id::TEXT;
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        
        -- Só registra no LOG se REALMENTE houver coisas mudadas - Reduz custos da nuvem em writes inuteis.
        IF v_old_data IS DISTINCT FROM v_new_data THEN
            INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by, client_ip)
            VALUES (TG_TABLE_NAME::TEXT, v_record_id, TG_OP, v_old_data, v_new_data, v_user_id, v_client_ip);
        END IF;
        RETURN NEW;
        
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.id::TEXT;
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW);
        
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by, client_ip)
        VALUES (TG_TABLE_NAME::TEXT, v_record_id, TG_OP, v_old_data, v_new_data, v_user_id, v_client_ip);
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- =========================================================================
-- COMO USAR (Exemplos de ativação da Trigger nas tabelas de negócios)
-- Importante: Nunca apague o RDO ou a Timeline! O log os protege.
-- =========================================================================

/* 
-- Para plugar na sua tabela de Tarefas
CREATE TRIGGER tr_audit_tasks
AFTER INSERT OR UPDATE OR DELETE ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- Para plugar na sua tabela de RDO 
CREATE TRIGGER tr_audit_rdo
AFTER INSERT OR UPDATE OR DELETE ON public.rdo_diarios
FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();

-- Para plugar no Financeiro
CREATE TRIGGER tr_audit_financeiro
AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos_financeiros
FOR EACH ROW EXECUTE FUNCTION public.core_audit_trigger();
*/
