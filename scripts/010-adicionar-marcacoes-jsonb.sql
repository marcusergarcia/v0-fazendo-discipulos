-- ===================================================================
-- Script 010: Adicionar coluna marcacoes JSONB à tabela highlights_biblia
-- ===================================================================
-- Objetivo: Otimizar a tabela para usar uma linha por usuário/capítulo
-- com todas as marcações em um array JSONB
-- ===================================================================

-- Passo 1: Adicionar coluna marcacoes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'highlights_biblia' 
        AND column_name = 'marcacoes'
    ) THEN
        ALTER TABLE highlights_biblia 
        ADD COLUMN marcacoes JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Coluna marcacoes adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna marcacoes já existe';
    END IF;
END $$;

-- Passo 2: Remover constraint NOT NULL de numero_versiculo se existir
DO $$ 
BEGIN
    ALTER TABLE highlights_biblia 
    ALTER COLUMN numero_versiculo DROP NOT NULL;
    
    RAISE NOTICE 'Constraint NOT NULL removida de numero_versiculo';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint NOT NULL já foi removida ou não existe';
END $$;

-- Passo 3: Remover constraint NOT NULL de texto_selecionado se existir
DO $$ 
BEGIN
    ALTER TABLE highlights_biblia 
    ALTER COLUMN texto_selecionado DROP NOT NULL;
    
    RAISE NOTICE 'Constraint NOT NULL removida de texto_selecionado';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint NOT NULL já foi removida ou não existe';
END $$;

-- Passo 4: Remover constraint NOT NULL de cor se existir
DO $$ 
BEGIN
    ALTER TABLE highlights_biblia 
    ALTER COLUMN cor DROP NOT NULL;
    
    RAISE NOTICE 'Constraint NOT NULL removida de cor';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Constraint NOT NULL já foi removida ou não existe';
END $$;

-- Passo 5: Migrar dados antigos para o novo formato
-- Agrupa todas as marcações individuais em um único registro por usuário/capítulo
DO $$
DECLARE
    registros_migrados INT := 0;
    registros_antigos INT := 0;
BEGIN
    -- Contar registros no formato antigo (que têm texto_selecionado preenchido)
    SELECT COUNT(*) INTO registros_antigos
    FROM highlights_biblia
    WHERE texto_selecionado IS NOT NULL
    AND (marcacoes IS NULL OR marcacoes = '[]'::jsonb);
    
    IF registros_antigos > 0 THEN
        RAISE NOTICE 'Encontrados % registros no formato antigo para migrar', registros_antigos;
        
        -- Criar registros consolidados para cada usuário/capítulo
        INSERT INTO highlights_biblia (usuario_id, livro_id, numero_capitulo, marcacoes, created_at)
        SELECT 
            h.usuario_id,
            h.livro_id,
            h.numero_capitulo,
            jsonb_agg(
                jsonb_build_object(
                    'texto', h.texto_selecionado,
                    'cor', h.cor,
                    'versiculo', h.numero_versiculo,
                    'criado_em', h.created_at
                )
                ORDER BY h.created_at
            ) as marcacoes,
            MIN(h.created_at) as created_at
        FROM highlights_biblia h
        WHERE h.texto_selecionado IS NOT NULL
        AND (h.marcacoes IS NULL OR h.marcacoes = '[]'::jsonb)
        GROUP BY h.usuario_id, h.livro_id, h.numero_capitulo
        ON CONFLICT DO NOTHING;
        
        GET DIAGNOSTICS registros_migrados = ROW_COUNT;
        RAISE NOTICE 'Criados % registros consolidados', registros_migrados;
        
        -- Remover registros antigos após confirmar migração
        IF registros_migrados > 0 THEN
            DELETE FROM highlights_biblia
            WHERE texto_selecionado IS NOT NULL
            AND id NOT IN (
                SELECT MAX(id)
                FROM highlights_biblia
                WHERE marcacoes IS NOT NULL AND marcacoes != '[]'::jsonb
                GROUP BY usuario_id, livro_id, numero_capitulo
            );
            
            RAISE NOTICE 'Registros antigos removidos com sucesso';
        END IF;
    ELSE
        RAISE NOTICE 'Nenhum registro antigo encontrado para migrar';
    END IF;
END $$;

-- Passo 6: Criar índice para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_highlights_usuario_capitulo 
ON highlights_biblia(usuario_id, livro_id, numero_capitulo);

RAISE NOTICE 'Migração concluída com sucesso!';
