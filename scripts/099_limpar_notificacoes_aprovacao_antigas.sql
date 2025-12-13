-- Limpar notificações antigas de discípulos que já foram aprovados
DELETE FROM notificacoes
WHERE tipo IN ('novo_discipulo', 'mensagem')
AND titulo = 'Novo Discípulo Aguardando Aprovação'
AND user_id IN (
  SELECT discipulador_id 
  FROM discipulos 
  WHERE aprovado_discipulador = true
);

-- Confirmar limpeza
SELECT 
  COUNT(*) as notificacoes_restantes,
  tipo
FROM notificacoes
WHERE tipo IN ('novo_discipulo', 'mensagem')
GROUP BY tipo;
