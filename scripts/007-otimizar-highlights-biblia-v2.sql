-- Migração para otimizar a tabela highlights_biblia
-- Ao invés de uma linha por marcação, teremos uma linha por usuário por capítulo
-- com as marcações armazenadas em um array JSONB

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
    END IF;
END $$;

-- Passo 2: Migrar dados existentes para o novo formato
-- Agrupa todas as marcações de cada usuário por capítulo
DO $$
DECLARE
    highlight_record RECORD;
    existing_record RECORD;
    new_marcacao JSONB;
    marcacoes_array JSONB;
BEGIN
    -- Para cada highlight individual existente
    FOR highlight_record IN 
        SELECT * FROM highlights_biblia 
        WHERE texto IS NOT NULL 
        ORDER BY usuario_id, numero_capitulo, created_at
    LOOP
        -- Criar objeto JSON da marcação
        new_marcacao := jsonb_build_object(
            'texto', highlight_record.texto,
            'cor', highlight_record.cor,
            'inicio', highlight_record.inicio,
            'fim', highlight_record.fim,
            'created_at', highlight_record.created_at
        );
        
        -- Verificar se já existe um registro consolidado para este usuário/capítulo
        SELECT * INTO existing_record
        FROM highlights_biblia
        WHERE usuario_id = highlight_record.usuario_id
        AND numero_capitulo = highlight_record.numero_capitulo
        AND livro_id = highlight_record.livro_id
        AND marcacoes IS NOT NULL
        AND marcacoes != '[]'::jsonb
        LIMIT 1;
        
        IF FOUND THEN
            -- Atualizar o registro existente adicionando a nova marcação
            UPDATE highlights_biblia
            SET marcacoes = marcacoes || new_marcacao,
                updated_at = NOW()
            WHERE id = existing_record.id;
        ELSE
            -- Criar novo registro consolidado
            INSERT INTO highlights_biblia (
                usuario_id,
                numero_capitulo,
                livro_id,
                marcacoes,
                created_at,
                updated_at
            ) VALUES (
                highlight_record.usuario_id,
                highlight_record.numero_capitulo,
                highlight_record.livro_id,
                jsonb_build_array(new_marcacao),
                highlight_record.created_at,
                NOW()
            );
        END IF;
    END LOOP;
END $$;

-- Passo 3: Remover registros antigos (que têm texto individual e já foram migrados)
DELETE FROM highlights_biblia 
WHERE texto IS NOT NULL 
AND EXISTS (
    SELECT 1 FROM highlights_biblia h2
    WHERE h2.usuario_id = highlights_biblia.usuario_id
    AND h2.numero_capitulo = highlights_biblia.numero_capitulo
    AND h2.livro_id = highlights_biblia.livro_id
    AND h2.marcacoes IS NOT NULL
    AND h2.marcacoes != '[]'::jsonb
    AND h2.id != highlights_biblia.id
);

-- Passo 4: Criar índices se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_highlights_usuario_capitulo_optimized'
    ) THEN
        CREATE INDEX idx_highlights_usuario_capitulo_optimized 
        ON highlights_biblia(usuario_id, numero_capitulo, livro_id);
    END IF;
END $$;

-- Passo 5: Adicionar comentário
COMMENT ON COLUMN highlights_biblia.marcacoes IS 
'Array JSONB contendo todas as marcações do usuário para este capítulo. Cada item tem: texto, cor, inicio, fim, created_at';
