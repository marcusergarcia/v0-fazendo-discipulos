-- Adicionar colunas para controle de leitura de mensagens
ALTER TABLE mensagens
ADD COLUMN IF NOT EXISTS lida BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_leitura TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_mensagens_nao_lidas 
ON mensagens(discipulo_id, lida) 
WHERE lida = FALSE;

-- Adicionar comentários
COMMENT ON COLUMN mensagens.lida IS 'Indica se a mensagem foi lida pelo destinatário';
COMMENT ON COLUMN mensagens.data_leitura IS 'Data e hora em que a mensagem foi marcada como lida';

-- Exibir resultado
SELECT 'Colunas de status de mensagem adicionadas com sucesso!' as resultado;
