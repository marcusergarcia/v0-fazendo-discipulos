-- Script para limpar TODAS as notificações órfãs do banco de dados
-- Execução: 2025-12-11

BEGIN;

-- 1. Remover referências de notificacao_id em reflexoes_passo onde a notificação será deletada
UPDATE reflexoes_passo rp
SET notificacao_id = NULL
WHERE notificacao_id IN (
  -- Notificações órfãs (sem reflexões associadas)
  SELECT n.id FROM notificacoes n
  WHERE n.tipo = 'reflexao'
  AND NOT EXISTS (
    SELECT 1 FROM reflexoes_passo rp2 
    WHERE rp2.notificacao_id = n.id
  )
  UNION
  -- Notificações de reflexões 100% aprovadas
  SELECT n.id FROM notificacoes n
  WHERE n.tipo = 'reflexao'
  AND EXISTS (
    SELECT 1 FROM reflexoes_passo rp2 
    WHERE rp2.notificacao_id = n.id
    GROUP BY rp2.notificacao_id
    HAVING COUNT(*) > 0 AND COUNT(*) = COUNT(*) FILTER (WHERE rp2.situacao = 'aprovado')
  )
);

-- 2. Remover referências de notificacao_id em perguntas_reflexivas onde a notificação será deletada
UPDATE perguntas_reflexivas pr
SET notificacao_id = NULL
WHERE notificacao_id IN (
  -- Notificações órfãs (sem perguntas associadas)
  SELECT n.id FROM notificacoes n
  WHERE n.tipo = 'perguntas_reflexivas'
  AND NOT EXISTS (
    SELECT 1 FROM perguntas_reflexivas pr2 
    WHERE pr2.notificacao_id = n.id
  )
  UNION
  -- Notificações de perguntas 100% aprovadas
  SELECT n.id FROM notificacoes n
  WHERE n.tipo = 'perguntas_reflexivas'
  AND EXISTS (
    SELECT 1 FROM perguntas_reflexivas pr2 
    WHERE pr2.notificacao_id = n.id
    AND pr2.situacao = 'aprovado'
  )
);

-- 3. Deletar notificações de reflexões órfãs (sem reflexões associadas)
DELETE FROM notificacoes n
WHERE n.tipo = 'reflexao'
AND NOT EXISTS (
  SELECT 1 FROM reflexoes_passo rp 
  WHERE rp.notificacao_id = n.id
);

-- 4. Deletar notificações de reflexões 100% aprovadas
DELETE FROM notificacoes n
WHERE n.tipo = 'reflexao'
AND EXISTS (
  SELECT 1 FROM reflexoes_passo rp 
  WHERE rp.notificacao_id = n.id
  GROUP BY rp.notificacao_id
  HAVING COUNT(*) > 0 AND COUNT(*) = COUNT(*) FILTER (WHERE rp.situacao = 'aprovado')
);

-- 5. Deletar notificações de perguntas órfãs (sem perguntas associadas)
DELETE FROM notificacoes n
WHERE n.tipo = 'perguntas_reflexivas'
AND NOT EXISTS (
  SELECT 1 FROM perguntas_reflexivas pr 
  WHERE pr.notificacao_id = n.id
);

-- 6. Deletar notificações de perguntas 100% aprovadas
DELETE FROM notificacoes n
WHERE n.tipo = 'perguntas_reflexivas'
AND EXISTS (
  SELECT 1 FROM perguntas_reflexivas pr 
  WHERE pr.notificacao_id = n.id
  AND pr.situacao = 'aprovado'
);

-- 7. Deletar notificações com discipulo_id NULL (de testes antigos)
DELETE FROM notificacoes n
WHERE n.discipulo_id IS NULL
AND n.tipo IN ('reflexao', 'perguntas_reflexivas');

COMMIT;

-- Verificar resultado
SELECT COUNT(*) as total_notificacoes_restantes FROM notificacoes;
