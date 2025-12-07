-- Adicionar campo passo_atual à tabela reflexoes_conteudo para facilitar queries
-- Este campo reflete o passo em que o discípulo estava quando criou a reflexão

ALTER TABLE reflexoes_conteudo 
ADD COLUMN IF NOT EXISTS passo_atual integer;

-- Copiar valores de passo_numero para passo_atual (são iguais)
UPDATE reflexoes_conteudo 
SET passo_atual = passo_numero
WHERE passo_atual IS NULL;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_reflexoes_passo_atual 
ON reflexoes_conteudo(discipulo_id, passo_atual);

-- Adicionar campo passo_atual à tabela perguntas_reflexivas
ALTER TABLE perguntas_reflexivas 
ADD COLUMN IF NOT EXISTS passo_atual integer;

-- Copiar valores de passo_numero para passo_atual
UPDATE perguntas_reflexivas 
SET passo_atual = passo_numero
WHERE passo_atual IS NULL;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_perguntas_passo_atual 
ON perguntas_reflexivas(discipulo_id, passo_atual);

COMMENT ON COLUMN reflexoes_conteudo.passo_atual IS 'Passo em que o discípulo estava ao criar esta reflexão';
COMMENT ON COLUMN perguntas_reflexivas.passo_atual IS 'Passo em que o discípulo estava ao responder estas perguntas';
