-- Limpar notificações antigas de discípulos que já foram aprovados
-- Remove notificações do tipo "novo_discipulo" e "mensagem" de discípulos aprovados

DELETE FROM notificacoes 
WHERE discipulo_id IN (
  SELECT id 
  FROM discipulos 
  WHERE aprovado_discipulador = true
)
AND tipo IN ('novo_discipulo', 'mensagem');

-- Verificar quantas notificações foram removidas
SELECT 
  COUNT(*) as total_notificacoes_restantes,
  tipo,
  COUNT(*) FILTER (WHERE discipulo_id IS NOT NULL) as com_discipulo
FROM notificacoes
GROUP BY tipo;
