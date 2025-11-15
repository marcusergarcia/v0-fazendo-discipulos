-- Adicionar coluna discipulador_id na tabela reflexoes_conteudo
ALTER TABLE reflexoes_conteudo
ADD COLUMN IF NOT EXISTS discipulador_id uuid REFERENCES profiles(id);

-- Popular a coluna com os dados existentes
UPDATE reflexoes_conteudo rc
SET discipulador_id = d.discipulador_id
FROM discipulos d
WHERE rc.discipulo_id = d.id;

-- Criar índice para melhorar performance das queries
CREATE INDEX IF NOT EXISTS idx_reflexoes_discipulador 
ON reflexoes_conteudo(discipulador_id);

-- Verificar os resultados
SELECT 
  rc.id,
  rc.titulo,
  rc.discipulo_id,
  rc.discipulador_id,
  d.nome_completo_temp as discipulo_nome,
  p.nome_completo as discipulador_nome
FROM reflexoes_conteudo rc
LEFT JOIN discipulos d ON rc.discipulo_id = d.id
LEFT JOIN profiles p ON rc.discipulador_id = p.id
ORDER BY rc.data_criacao DESC;
