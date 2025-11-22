-- Script para adicionar coluna marcacoes em JSONB e migrar dados existentes
-- Versão simplificada sem blocos DO complexos

-- 1. Adicionar coluna marcacoes se não existir
ALTER TABLE highlights_biblia 
ADD COLUMN IF NOT EXISTS marcacoes JSONB DEFAULT '[]'::jsonb;

-- 2. Remover constraints NOT NULL das colunas antigas
ALTER TABLE highlights_biblia 
ALTER COLUMN numero_versiculo DROP NOT NULL;

ALTER TABLE highlights_biblia 
ALTER COLUMN texto_selecionado DROP NOT NULL;

ALTER TABLE highlights_biblia 
ALTER COLUMN cor DROP NOT NULL;

-- 3. Criar uma tabela temporária com os dados agrupados
CREATE TEMP TABLE temp_highlights_agrupados AS
SELECT 
  usuario_id,
  livro_id,
  numero_capitulo,
  jsonb_agg(
    jsonb_build_object(
      'texto', texto_selecionado,
      'cor', cor,
      'versiculo', numero_versiculo
    )
  ) as marcacoes_agrupadas,
  MIN(created_at) as created_at
FROM highlights_biblia
WHERE marcacoes = '[]'::jsonb OR marcacoes IS NULL
GROUP BY usuario_id, livro_id, numero_capitulo;

-- 4. Deletar registros antigos que serão consolidados
DELETE FROM highlights_biblia
WHERE id IN (
  SELECT h.id
  FROM highlights_biblia h
  INNER JOIN temp_highlights_agrupados t
    ON h.usuario_id = t.usuario_id
    AND h.livro_id = t.livro_id
    AND h.numero_capitulo = t.numero_capitulo
  WHERE h.marcacoes = '[]'::jsonb OR h.marcacoes IS NULL
);

-- 5. Inserir registros consolidados
INSERT INTO highlights_biblia (usuario_id, livro_id, numero_capitulo, marcacoes, created_at)
SELECT 
  usuario_id,
  livro_id,
  numero_capitulo,
  marcacoes_agrupadas,
  created_at
FROM temp_highlights_agrupados;

-- 6. Limpar tabela temporária
DROP TABLE temp_highlights_agrupados;

-- 7. Criar índice otimizado se não existir
CREATE INDEX IF NOT EXISTS idx_highlights_usuario_cap 
ON highlights_biblia(usuario_id, livro_id, numero_capitulo);

-- 8. Remover índice antigo se existir
DROP INDEX IF EXISTS idx_highlights_usuario;
