-- Adicionar coluna resumo na tabela reflexoes_conteudo para armazenar resumos dos conteúdos
ALTER TABLE reflexoes_conteudo 
ADD COLUMN IF NOT EXISTS resumo TEXT;

-- Comentário explicativo
COMMENT ON COLUMN reflexoes_conteudo.resumo IS 'Resumo breve do conteúdo do vídeo ou artigo (2-3 frases) para contextualizar a reflexão';

-- Criar índice para melhorar performance em buscas de texto (opcional)
CREATE INDEX IF NOT EXISTS idx_reflexoes_resumo_busca 
ON reflexoes_conteudo USING gin(to_tsvector('portuguese', resumo));
