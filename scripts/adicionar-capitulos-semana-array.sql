-- Adicionar campo capitulos_semana como array de IDs de capítulos à tabela plano_leitura_biblica

ALTER TABLE plano_leitura_biblica 
ADD COLUMN IF NOT EXISTS capitulos_semana integer[] DEFAULT '{}';

-- Comentário explicativo
COMMENT ON COLUMN plano_leitura_biblica.capitulos_semana IS 'Array com os IDs dos capítulos desta semana para facilitar o monitoramento de progresso';

-- Popular o array capitulos_semana com os IDs corretos baseados no livro e range de capítulos
-- Isso vai buscar os IDs reais da tabela capitulos_biblia

UPDATE plano_leitura_biblica plb
SET capitulos_semana = (
  SELECT array_agg(cb.id ORDER BY cb.numero_capitulo)
  FROM capitulos_biblia cb
  JOIN livros_biblia lb ON cb.livro_id = lb.id
  WHERE lb.nome = plb.livro
    AND cb.numero_capitulo BETWEEN plb.capitulo_inicio AND plb.capitulo_fim
);

-- Verificar resultado (mostrar algumas semanas como exemplo)
SELECT 
  semana,
  tema,
  livro,
  capitulo_inicio,
  capitulo_fim,
  total_capitulos,
  array_length(capitulos_semana, 1) as qtd_capitulos_no_array,
  capitulos_semana
FROM plano_leitura_biblica
WHERE semana <= 5
ORDER BY semana;
