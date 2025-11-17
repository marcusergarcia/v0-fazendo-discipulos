-- Adicionar campo booleano 'aprovado' para evitar problemas de timezone
ALTER TABLE reflexoes_conteudo 
ADD COLUMN IF NOT EXISTS aprovado BOOLEAN DEFAULT FALSE;

-- Atualizar registros existentes: se tem data_aprovacao, marcar como aprovado
UPDATE reflexoes_conteudo 
SET aprovado = TRUE 
WHERE data_aprovacao IS NOT NULL;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_reflexoes_aprovado ON reflexoes_conteudo(discipulo_id, aprovado);
