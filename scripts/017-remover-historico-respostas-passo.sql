-- Script para remover tabela historico_respostas_passo obsoleta
-- Esta tabela foi substituída por perguntas_reflexivas
-- Data: 2025-01-11
-- Motivo: Consolidação das perguntas reflexivas em nova estrutura (1 linha com array JSONB)

-- 1. Verificar se a tabela está vazia
DO $$
DECLARE
    row_count INT;
BEGIN
    SELECT COUNT(*) INTO row_count FROM historico_respostas_passo;
    
    IF row_count > 0 THEN
        RAISE EXCEPTION 'A tabela historico_respostas_passo não está vazia! Tem % registros. Abortando remoção.', row_count;
    ELSE
        RAISE NOTICE 'Tabela historico_respostas_passo está vazia. Prosseguindo com remoção...';
    END IF;
END $$;

-- 2. Dropar políticas RLS
DROP POLICY IF EXISTS "Discipuladores veem respostas de seus discípulos" ON historico_respostas_passo;
DROP POLICY IF EXISTS "Discípulos veem suas próprias respostas" ON historico_respostas_passo;
DROP POLICY IF EXISTS "Discípulos podem inserir suas respostas" ON historico_respostas_passo;
DROP POLICY IF EXISTS "Discípulos podem atualizar suas respostas não aprovadas" ON historico_respostas_passo;
DROP POLICY IF EXISTS "Discipuladores podem atualizar respostas de discípulos" ON historico_respostas_passo;

-- 3. Dropar triggers (se houver)
DROP TRIGGER IF EXISTS atualizar_progresso_respostas ON historico_respostas_passo;
DROP TRIGGER IF EXISTS notificar_discipulador_resposta ON historico_respostas_passo;

-- 4. Dropar tabela
DROP TABLE IF EXISTS historico_respostas_passo CASCADE;

-- 5. Confirmar remoção
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'historico_respostas_passo'
    ) THEN
        RAISE EXCEPTION 'Falha ao remover tabela historico_respostas_passo!';
    ELSE
        RAISE NOTICE '✅ Tabela historico_respostas_passo removida com sucesso!';
    END IF;
END $$;
