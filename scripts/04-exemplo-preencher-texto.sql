-- Exemplo de como preencher o texto de um capítulo
-- Use este formato para adicionar os textos da Bíblia ACF

-- Exemplo: Preencher Gênesis 1
UPDATE capitulos_biblia
SET texto = 'No princípio criou Deus os céus e a terra. E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas...'
WHERE livro_id = (SELECT id FROM livros_biblia WHERE abreviacao = 'gn')
  AND numero_capitulo = 1
  AND versao = 'ACF';

-- Você pode criar um script para cada livro ou importar de um arquivo JSON/CSV
-- Exemplo de consulta para ver os capítulos vazios de um livro específico:
SELECT 
  l.nome,
  c.numero_capitulo,
  CASE WHEN c.texto = '' THEN 'VAZIO' ELSE 'PREENCHIDO' END as status
FROM capitulos_biblia c
JOIN livros_biblia l ON c.livro_id = l.id
WHERE l.abreviacao = 'jo' -- João
ORDER BY c.numero_capitulo;
