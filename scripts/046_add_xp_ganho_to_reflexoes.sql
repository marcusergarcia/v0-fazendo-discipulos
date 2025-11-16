-- Adicionar colunas necessárias em reflexoes_conteudo
ALTER TABLE reflexoes_conteudo 
ADD COLUMN IF NOT EXISTS xp_ganho INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS feedback_discipulador TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMPTZ DEFAULT NULL;

-- Criar índice para melhorar performance nas buscas
CREATE INDEX IF NOT EXISTS idx_reflexoes_discipulo_passo 
ON reflexoes_conteudo(discipulo_id, fase_numero, passo_numero);
