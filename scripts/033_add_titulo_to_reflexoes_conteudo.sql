-- Adicionar coluna titulo na tabela reflexoes_conteudo
ALTER TABLE reflexoes_conteudo 
ADD COLUMN IF NOT EXISTS titulo TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN reflexoes_conteudo.titulo IS 'Título do vídeo ou artigo relacionado à reflexão';

-- Criar índice para melhorar performance em filtros
CREATE INDEX IF NOT EXISTS idx_reflexoes_conteudo_titulo 
ON reflexoes_conteudo(titulo);

-- Atualizar reflexões existentes com titulo vazio ou null para identificação
UPDATE reflexoes_conteudo 
SET titulo = 'Conteúdo (migração)' 
WHERE titulo IS NULL;
