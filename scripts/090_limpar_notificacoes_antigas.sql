-- Script para limpar notificações antigas e órfãs

-- Primeiro, remover referências de notificacao_id antes de deletar
-- Limpar referências em reflexoes_passo
UPDATE reflexoes_passo 
SET notificacao_id = NULL
WHERE notificacao_id IN (
  SELECT n.id FROM notificacoes n
  INNER JOIN reflexoes_passo r ON n.discipulo_id = r.discipulo_id
  WHERE r.situacao = 'aprovado'
);

-- Limpar referências em perguntas_reflexivas
UPDATE perguntas_reflexivas 
SET notificacao_id = NULL
WHERE notificacao_id IN (
  SELECT n.id FROM notificacoes n
  INNER JOIN perguntas_reflexivas p ON n.discipulo_id = p.discipulo_id
  WHERE p.situacao = 'aprovado'
);

-- Agora podemos deletar as notificações órfãs sem violar foreign keys
-- Deletar notificações de reflexões que já foram aprovadas
DELETE FROM notificacoes 
WHERE tipo IN ('reflexao_video', 'reflexao_artigo')
AND id IN (
  SELECT n.id FROM notificacoes n
  INNER JOIN reflexoes_passo r ON n.discipulo_id = r.discipulo_id
  WHERE r.situacao = 'aprovado'
);

-- Deletar notificações de perguntas reflexivas que já foram aprovadas
DELETE FROM notificacoes 
WHERE tipo = 'perguntas_reflexivas'
AND id IN (
  SELECT n.id FROM notificacoes n
  INNER JOIN perguntas_reflexivas p ON n.discipulo_id = p.discipulo_id
  WHERE p.situacao = 'aprovado'
);

-- Deletar notificações de discípulos que já foram aprovados
DELETE FROM notificacoes 
WHERE tipo = 'novo_discipulo'
AND discipulo_id IN (
  SELECT id FROM discipulos WHERE aprovado_discipulador = true
);
