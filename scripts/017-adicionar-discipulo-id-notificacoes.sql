-- Adicionar campo discipulo_id na tabela notificacoes
-- Isso permite identificar quem enviou a reflexão que gerou a notificação

-- Adicionar coluna discipulo_id
ALTER TABLE notificacoes 
ADD COLUMN IF NOT EXISTS discipulo_id uuid REFERENCES discipulos(id) ON DELETE CASCADE;

-- Criar índice para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_notificacoes_discipulo_id ON notificacoes(discipulo_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_reflexao_id ON notificacoes(reflexao_id);

-- Comentários para documentação
COMMENT ON COLUMN notificacoes.discipulo_id IS 'ID do discípulo que enviou a reflexão/resposta';
COMMENT ON COLUMN notificacoes.user_id IS 'ID do discipulador que receberá a notificação';
COMMENT ON COLUMN notificacoes.reflexao_id IS 'ID da reflexão ou resposta relacionada';
