-- =========================================================================
-- CORE Enterprise: Seed Data (LF Engenharia)
-- Padrão Vale do Silício: Inserção de Dados Fictícios de Alta Fidelidade
-- =========================================================================

-- 1. GARANTINDO O PERFIL DO ADMIN ATUAL
-- Substitua 'SEU-ID-AQUI' pelo seu UUID lá da tabela auth.users se quiser linkar perfeitamente
-- (O script ignorará erros de conflito se o usuário já existir)
-- INSERT INTO public.users_profiles (id, full_name, role) 
-- VALUES ('uuid-do-auth', 'Arthur Admin', 'ADMIN') ON CONFLICT DO NOTHING;

-- Para testes genéricos sem violar a FK, vamos referenciar um usuário "Sistema" ou ignorar o created_by.
-- Mas, para os Dashboards ganharem vida, o Supabase SQL Editor precisa apenas das linhas na tabela!

-- -------------------------------------------------------------------------
-- 1. OBRAS (Mock de Projetos)
-- -------------------------------------------------------------------------
INSERT INTO public.obras (id, nome, status, orcamento_estimado, endereco, data_inicio)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Residencial Aurora', 'EM_ANDAMENTO', 2500000.00, 'Rua das Flores, 123', '2025-01-10'),
    ('22222222-2222-2222-2222-222222222222', 'Edifício Horizonte', 'EM_ANDAMENTO', 8500000.00, 'Av. Paulista, 1000', '2024-06-01'),
    ('33333333-3333-3333-3333-333333333333', 'Condomínio Vale Verde', 'PLANEJAMENTO', 1200000.00, 'Estrada do Sol, Km 15', NULL)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------------
-- 2. TAREFAS (Para a TasksPage)
-- -------------------------------------------------------------------------
INSERT INTO public.tarefas (obra_id, titulo, descricao, status, prioridade, prazo)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Solicitação de Cimento CP-II', 'Comprar 50 sacos urgentes para concretagem da laje 2', 'PENDENTE', 'ALTA', CURRENT_DATE),
    ('22222222-2222-2222-2222-222222222222', 'Correção de Planta Hidráulica', 'Revisar tubulação do shaft no 5º andar com a arquitetura', 'EM_ANDAMENTO', 'MEDIA', CURRENT_DATE + INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111111', 'Aprovação de Medição Empreiteiro', 'Conferir os rebocos feitos na torre B', 'CONCLUIDA', 'BAIXA', CURRENT_DATE - INTERVAL '1 day'),
    ('33333333-3333-3333-3333-333333333333', 'Estudo de Sondagem do Terreno', 'Aguardando laudo da empresa terceirizada', 'BLOQUEADA', 'URGENTE', CURRENT_DATE + INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------------
-- 3. FINANCEIRO (Para popular o FinanceiroDashboard e Gráficos Recharts)
-- -------------------------------------------------------------------------
INSERT INTO public.lancamentos_financeiros (obra_id, descricao, tipo, categoria, valor, data_vencimento, data_pagamento, status)
VALUES 
    -- Receitas (Entradas do Cliente)
    ('11111111-1111-1111-1111-111111111111', 'Adiantamento Cliente', 'RECEITA', 'MEDIÇÃO', 150000.00, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days', 'PAGO'),
    ('22222222-2222-2222-2222-222222222222', 'Medição Mês 05', 'RECEITA', 'MEDIÇÃO', 420000.00, CURRENT_DATE, CURRENT_DATE, 'PAGO'),
    ('22222222-2222-2222-2222-222222222222', 'Medição Mês 06', 'RECEITA', 'MEDIÇÃO', 280000.00, CURRENT_DATE + INTERVAL '30 days', NULL, 'PENDENTE'),

    -- Despesas (Custos da Obra)
    ('11111111-1111-1111-1111-111111111111', 'Concreto Usinado - Cimento&Cia', 'DESPESA', 'MATERIAL', 14500.00, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day', 'PAGO'),
    ('22222222-2222-2222-2222-222222222222', 'Folha de Pagamento - Equipe A', 'DESPESA', 'MÃO_DE_OBRA', 42000.00, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days', 'PAGO'),
    ('11111111-1111-1111-1111-111111111111', 'Locação Guindaste', 'DESPESA', 'EQUIPAMENTO', 8500.00, CURRENT_DATE + INTERVAL '2 days', NULL, 'PENDENTE'),
    ('22222222-2222-2222-2222-222222222222', 'Aço CA50 - Siderúrgica', 'DESPESA', 'MATERIAL', 22300.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days', 'PAGO'),
    ('22222222-2222-2222-2222-222222222222', 'ISS Mensal ref. Mão de obra', 'DESPESA', 'IMPOSTO', 5400.00, CURRENT_DATE + INTERVAL '5 days', NULL, 'PENDENTE'),
    ('33333333-3333-3333-3333-333333333333', 'Taxas da Prefeitura (Alvará)', 'DESPESA', 'IMPOSTO', 2100.00, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '15 days', 'PAGO')
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------------
-- 4. RDO (Exemplo de Diário Diário de Obras preenchido)
-- -------------------------------------------------------------------------
INSERT INTO public.rdo_diarios (obra_id, data_relatorio, condicao_climatica, efetivo_total, descricao_atividades, ocorrencias, status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '1 day', 'BOM', 12, 'Concretagem das vigas do segundo pavimento. Amarração das ferragens da laje.', 'Falta de cimento evitou conclusão de 10% da laje', 'ASSINADO'),
    ('22222222-2222-2222-2222-222222222222', CURRENT_DATE, 'CHUVA', 5, 'Serviços externos suspensos devido à forte chuva. Equipe remanejada para limpeza interna e organização do almoxarifado.', 'Abrasão no canteiro causada por enxurrada. Necessária reposição de brita.', 'RASCUNHO')
ON CONFLICT DO NOTHING;
