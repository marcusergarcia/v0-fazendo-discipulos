-- Atualizar títulos NULL nas reflexões de vídeos
UPDATE reflexoes_conteudo rc
SET titulo = (
  SELECT 
    CASE 
      WHEN rc.tipo = 'video' AND rc.conteudo_id = 'video-1' THEN 'O que significa ser criado à imagem de Deus?'
      WHEN rc.tipo = 'video' AND rc.conteudo_id = 'video-2' THEN 'Gênesis 1 - A Criação'
      WHEN rc.tipo = 'video' AND rc.conteudo_id = 'video-3' THEN 'Por que Deus nos Criou?'
      WHEN rc.tipo = 'artigo' AND rc.conteudo_id = 'artigo-1' THEN 'Imago Dei (Imagem de Deus)'
      WHEN rc.tipo = 'artigo' AND rc.conteudo_id = 'artigo-2' THEN 'Fomos Criados para Relacionamento'
      WHEN rc.tipo = 'artigo' AND rc.conteudo_id = 'artigo-3' THEN 'Criação (Cristianismo)'
      ELSE 'Conteúdo'
    END
)
WHERE titulo IS NULL;

-- Verificar resultados
SELECT 
  id,
  conteudo_id,
  tipo,
  titulo,
  LEFT(reflexao, 50) as reflexao_preview
FROM reflexoes_conteudo
ORDER BY data_criacao DESC
LIMIT 10;
