-- Limpar notificações órfãs (sem discípulos correspondentes aguardando aprovação)

-- Encontrar notificações de aprovação que não têm discípulos pendentes
WITH notificacoes_orfas AS (
  SELECT n.id, n.link, n.titulo
  FROM notificacoes n
  WHERE n.tipo = 'mensagem'
    AND n.titulo = 'Novo Discípulo Aguardando Aprovação'
    AND n.link IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM discipulos d
      WHERE '/discipulador/aprovar/' || d.id = n.link
        AND d.aprovado_discipulador = false
        AND d.user_id IS NULL
    )
)
SELECT * FROM notificacoes_orfas;

-- Deletar as notificações órfãs
DELETE FROM notificacoes
WHERE id IN (
  SELECT n.id
  FROM notificacoes n
  WHERE n.tipo = 'mensagem'
    AND n.titulo = 'Novo Discípulo Aguardando Aprovação'
    AND n.link IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM discipulos d
      WHERE '/discipulador/aprovar/' || d.id = n.link
        AND d.aprovado_discipulador = false
        AND d.user_id IS NULL
    )
);
