-- Script para adicionar relacionamento entre reflexões e notificações
-- Versão 1.0

-- Adicionar coluna notificacao_id na tabela reflexoes_conteudo
ALTER TABLE reflexoes_conteudo
ADD COLUMN IF NOT EXISTS notificacao_id uuid REFERENCES notificacoes(id) ON DELETE CASCADE;

-- Adicionar coluna reflexao_id na tabela notificacoes  
ALTER TABLE notificacoes
ADD COLUMN IF NOT EXISTS reflexao_id uuid REFERENCES reflexoes_conteudo(id) ON DELETE CASCADE;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_reflexoes_notificacao_id ON reflexoes_conteudo(notificacao_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_reflexao_id ON notificacoes(reflexao_id);

-- Comentários para documentação
COMMENT ON COLUMN reflexoes_conteudo.notificacao_id IS 'ID da notificação criada quando a reflexão foi enviada';
COMMENT ON COLUMN notificacoes.reflexao_id IS 'ID da reflexão relacionada a esta notificação';
