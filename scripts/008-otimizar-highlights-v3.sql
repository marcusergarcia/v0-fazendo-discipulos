-- Otimização da tabela highlights_biblia
-- Agrupa múltiplas marcações em uma linha por usuário por capítulo
-- Reduz de ~8.200 linhas para ~1.189 linhas por usuário

-- Passo 1: Adicionar coluna para marcações em formato JSON (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'highlights_biblia' 
        AND column_name = 'marcacoes'
    ) THEN
        ALTER TABLE highlights_biblia 
        ADD COLUMN marcacoes JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Coluna marcacoes adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna marcacoes já existe, pulando criação';
    END IF;
END $$;

-- Passo 2: Fazer backup dos dados atuais (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'highlights_biblia_backup_pre_otimizacao') THEN
        CREATE TABLE highlights_biblia_backup_pre_otimizacao AS 
        SELECT * FROM highlights_biblia;
        
        RAISE NOTICE 'Backup criado: % registros copiados', 
            (SELECT COUNT(*) FROM highlights_biblia_backup_pre_otimizacao);
    ELSE
        RAISE NOTICE 'Backup já existe, pulando criação';
    END IF;
END $$;

-- Passo 3: Criar tabela temporária com dados agrupados SOMENTE se houver dados para agrupar
DO $$
DECLARE
    total_registros INTEGER;
BEGIN
    -- Verificar se há registros com as colunas antigas
    SELECT COUNT(*) INTO total_registros 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'highlights_biblia' 
    AND column_name IN ('texto_selecionado', 'cor', 'numero_versiculo');
    
    IF total_registros > 0 THEN
        -- Criar tabela temporária com dados agrupados
        CREATE TEMP TABLE IF NOT EXISTS highlights_agrupados AS
        SELECT 
            usuario_id,
            numero_capitulo,
            livro_id,
            MIN(created_at) as created_at,
            jsonb_agg(
                jsonb_build_object(
                    'id', id,
                    'texto', texto_selecionado,
                    'cor', cor
                ) ORDER BY id
            ) as marcacoes
        FROM highlights_biblia
        WHERE texto_selecionado IS NOT NULL
        GROUP BY usuario_id, numero_capitulo, livro_id;

        RAISE NOTICE 'Dados agrupados: % registros únicos de % registros totais', 
            (SELECT COUNT(*) FROM highlights_agrupados),
            (SELECT COUNT(*) FROM highlights_biblia);

        -- Limpar tabela original
        DELETE FROM highlights_biblia WHERE texto_selecionado IS NOT NULL;

        -- Inserir dados agrupados
        INSERT INTO highlights_biblia (usuario_id, numero_capitulo, livro_id, created_at, marcacoes)
        SELECT usuario_id, numero_capitulo, livro_id, created_at, marcacoes
        FROM highlights_agrupados;

        -- Remover colunas antigas
        ALTER TABLE highlights_biblia 
            DROP COLUMN IF EXISTS texto_selecionado,
            DROP COLUMN IF EXISTS cor,
            DROP COLUMN IF EXISTS numero_versiculo;

        RAISE NOTICE 'Migração concluída com sucesso!';
    ELSE
        RAISE NOTICE 'Colunas antigas não encontradas. Tabela já está no formato otimizado.';
    END IF;
END $$;

-- Passo 4: Criar índices otimizados
DROP INDEX IF EXISTS idx_highlights_usuario_capitulo;
CREATE INDEX IF NOT EXISTS idx_highlights_usuario_capitulo 
    ON highlights_biblia(usuario_id, numero_capitulo, livro_id);

-- Passo 5: Adicionar índice GIN para queries no JSON
CREATE INDEX IF NOT EXISTS idx_highlights_marcacoes 
    ON highlights_biblia USING gin(marcacoes);

-- Estatísticas finais
DO $$
DECLARE
    total_antes INTEGER;
    total_depois INTEGER;
    reducao_percentual NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_antes FROM highlights_biblia_backup_pre_otimizacao WHERE EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'highlights_biblia_backup_pre_otimizacao'
    );
    SELECT COUNT(*) INTO total_depois FROM highlights_biblia;
    
    IF total_antes > 0 THEN
        reducao_percentual := ((total_antes - total_depois)::NUMERIC / total_antes::NUMERIC) * 100;
        
        RAISE NOTICE '=== MIGRAÇÃO CONCLUÍDA ===';
        RAISE NOTICE 'Registros antes: %', total_antes;
        RAISE NOTICE 'Registros depois: %', total_depois;
        RAISE NOTICE 'Redução: %% (% linhas economizadas)', 
            ROUND(reducao_percentual, 2), 
            (total_antes - total_depois);
    ELSE
        RAISE NOTICE 'Tabela já estava otimizada ou não havia dados para migrar.';
    END IF;
END $$;
