-- Adicionar campo situacao à tabela reflexoes_conteudo
ALTER TABLE reflexoes_conteudo 
ADD COLUMN IF NOT EXISTS situacao TEXT DEFAULT 'enviado' CHECK (situacao IN ('enviado', 'aprovado', 'rejeitado'));

-- Atualizar reflexões existentes que já têm xp_ganho para 'aprovado'
UPDATE reflexoes_conteudo 
SET situacao = 'aprovado' 
WHERE xp_ganho IS NOT NULL AND xp_ganho > 0;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_reflexoes_situacao ON reflexoes_conteudo(situacao);

-- Comentário explicativo
COMMENT ON COLUMN reflexoes_conteudo.situacao IS 'Status da reflexão: enviado (aguardando avaliação), aprovado (avaliada e aprovada), rejeitado (não aprovada)';
