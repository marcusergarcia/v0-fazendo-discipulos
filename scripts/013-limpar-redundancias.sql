-- Script de Limpeza de Redundâncias e Otimização do Banco de Dados
-- Data: 2025-01-22
-- Objetivo: Remover tabelas e campos não utilizados para simplificar o sistema

-- ============================================================================
-- PARTE 1: REMOVER TABELA DE BACKUP NÃO UTILIZADA
-- ============================================================================

-- A tabela leituras_capitulos_backup foi criada durante migração e nunca mais usada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leituras_capitulos_backup') THEN
        DROP TABLE leituras_capitulos_backup CASCADE;
        RAISE NOTICE 'Tabela leituras_capitulos_backup removida com sucesso';
    ELSE
        RAISE NOTICE 'Tabela leituras_capitulos_backup não existe (já foi removida)';
    END IF;
END$$;

-- ============================================================================
-- PARTE 2: REMOVER CAMPOS REDUNDANTES DE progresso_fases
-- ============================================================================

DO $$
BEGIN
    -- Campo resposta_pergunta: As respostas já estão em historico_respostas_passo
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'progresso_fases' AND column_name = 'resposta_pergunta') THEN
        ALTER TABLE progresso_fases DROP COLUMN resposta_pergunta;
        RAISE NOTICE 'Campo resposta_pergunta removido';
    END IF;

    -- Campo resposta_missao: As respostas já estão em historico_respostas_passo
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'progresso_fases' AND column_name = 'resposta_missao') THEN
        ALTER TABLE progresso_fases DROP COLUMN resposta_missao;
        RAISE NOTICE 'Campo resposta_missao removido';
    END IF;

    -- Campo rascunho_resposta: Funcionalidade nunca implementada
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'progresso_fases' AND column_name = 'rascunho_resposta') THEN
        ALTER TABLE progresso_fases DROP COLUMN rascunho_resposta;
        RAISE NOTICE 'Campo rascunho_resposta removido';
    END IF;

    -- Campo status_validacao: Status já controlado por situacao em outras tabelas
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'progresso_fases' AND column_name = 'status_validacao') THEN
        ALTER TABLE progresso_fases DROP COLUMN status_validacao;
        RAISE NOTICE 'Campo status_validacao removido';
    END IF;
    
    RAISE NOTICE 'Limpeza de campos redundantes concluída com sucesso';
END$$;

-- ============================================================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- ============================================================================

-- Listar estrutura final da tabela progresso_fases
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'progresso_fases'
ORDER BY ordinal_position;
