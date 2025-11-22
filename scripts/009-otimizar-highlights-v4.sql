-- Migração Otimizada de Highlights da Bíblia v4
-- Agrupa todas as marcações de um usuário por capítulo em um único registro com array JSON
-- Corrige problema de NOT NULL constraint

DO $$
BEGIN
  -- Passo 1: Adicionar coluna marcacoes se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'highlights_biblia' AND column_name = 'marcacoes'
  ) THEN
    ALTER TABLE highlights_biblia ADD COLUMN marcacoes JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Coluna marcacoes adicionada';
  END IF;

  -- Passo 2: Remover constraint NOT NULL de numero_versiculo se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'highlights_biblia' 
    AND column_name = 'numero_versiculo'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE highlights_biblia ALTER COLUMN numero_versiculo DROP NOT NULL;
    RAISE NOTICE 'Constraint NOT NULL removida de numero_versiculo';
  END IF;

  -- Passo 3: Verificar se há dados no formato antigo para migrar
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'highlights_biblia' AND column_name = 'texto_selecionado'
  ) AND EXISTS (
    SELECT 1 FROM highlights_biblia 
    WHERE texto_selecionado IS NOT NULL 
    AND (marcacoes IS NULL OR marcacoes = '[]'::jsonb)
    LIMIT 1
  ) THEN
    RAISE NOTICE 'Migrando dados do formato antigo para o novo...';
    
    -- Criar registros agrupados no novo formato
    INSERT INTO highlights_biblia (
      usuario_id,
      livro_id,
      numero_capitulo,
      numero_versiculo,
      marcacoes,
      created_at,
      updated_at
    )
    SELECT 
      usuario_id,
      livro_id,
      numero_capitulo,
      NULL as numero_versiculo, -- Agora permite NULL
      jsonb_agg(
        jsonb_build_object(
          'texto', texto_selecionado,
          'cor', cor,
          'versiculo', numero_versiculo,
          'id', gen_random_uuid()::text
        )
      ) as marcacoes,
      MIN(created_at) as created_at,
      NOW() as updated_at
    FROM highlights_biblia
    WHERE texto_selecionado IS NOT NULL
    AND id NOT IN (
      SELECT id FROM highlights_biblia WHERE marcacoes IS NOT NULL AND marcacoes != '[]'::jsonb
    )
    GROUP BY usuario_id, livro_id, numero_capitulo
    ON CONFLICT (usuario_id, livro_id, numero_capitulo) 
    DO UPDATE SET
      marcacoes = EXCLUDED.marcacoes,
      updated_at = NOW();
    
    RAISE NOTICE 'Migração de dados concluída';
    
    -- Remover registros antigos que foram migrados
    DELETE FROM highlights_biblia 
    WHERE texto_selecionado IS NOT NULL 
    AND id NOT IN (
      SELECT id FROM highlights_biblia 
      WHERE marcacoes IS NOT NULL AND marcacoes != '[]'::jsonb
    );
    
    RAISE NOTICE 'Registros antigos removidos';
  ELSE
    RAISE NOTICE 'Nenhum dado antigo encontrado para migrar';
  END IF;

  -- Passo 4: Criar índice composto se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_highlights_usuario_capitulo'
  ) THEN
    CREATE INDEX idx_highlights_usuario_capitulo 
    ON highlights_biblia(usuario_id, livro_id, numero_capitulo);
    RAISE NOTICE 'Índice idx_highlights_usuario_capitulo criado';
  END IF;

  -- Passo 5: Criar índice GIN para busca no JSONB se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_highlights_marcacoes_gin'
  ) THEN
    CREATE INDEX idx_highlights_marcacoes_gin 
    ON highlights_biblia USING GIN (marcacoes);
    RAISE NOTICE 'Índice GIN criado para marcacoes';
  END IF;

END $$;
