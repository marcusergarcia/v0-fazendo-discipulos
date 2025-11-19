-- Script para gerar todas as linhas de capítulos com texto vazio
-- Execute este script APÓS o script 00-setup-biblia-completo.sql

-- Gerar capítulos para cada livro baseado no total_capitulos
DO $$
DECLARE
  livro RECORD;
  cap INTEGER;
BEGIN
  -- Iterar sobre cada livro
  FOR livro IN SELECT id, total_capitulos FROM livros_biblia ORDER BY ordem
  LOOP
    -- Gerar capítulos de 1 até total_capitulos
    FOR cap IN 1..livro.total_capitulos
    LOOP
      INSERT INTO capitulos_biblia (livro_id, numero_capitulo, texto, versao)
      VALUES (livro.id, cap, '', 'ACF')
      ON CONFLICT (livro_id, numero_capitulo, versao) DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Capítulos gerados com sucesso!';
END $$;

-- Verificar quantos capítulos foram criados
SELECT 
  COUNT(*) as total_capitulos_gerados,
  COUNT(CASE WHEN texto = '' THEN 1 END) as capitulos_vazios,
  COUNT(CASE WHEN texto != '' THEN 1 END) as capitulos_preenchidos
FROM capitulos_biblia;

-- Listar alguns capítulos vazios para visualizar
SELECT 
  l.nome as livro,
  c.numero_capitulo,
  c.texto,
  c.versao
FROM capitulos_biblia c
JOIN livros_biblia l ON c.livro_id = l.id
ORDER BY l.ordem, c.numero_capitulo
LIMIT 10;
