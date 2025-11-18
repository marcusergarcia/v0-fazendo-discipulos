-- Liberar passo 2 para o discípulo que completou o passo 1
-- Este script atualiza o passo_atual para 2 após todas as reflexões e respostas serem aprovadas

-- Atualizar o discípulo d4d131f7-de70-48e6-943b-840f6fe7c51d para o passo 2
UPDATE discipulos
SET passo_atual = 2
WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND passo_atual = 1; -- Apenas se ainda estiver no passo 1

-- Criar ou atualizar o registro de progresso para o passo 2
INSERT INTO progresso_fases (
  discipulo_id,
  fase_numero,
  passo_numero,
  passo,
  nivel,
  completado,
  pontuacao_total
)
VALUES (
  'd4d131f7-de70-48e6-943b-840f6fe7c51d',
  1, -- fase 1
  2, -- passo 2
  2, -- passo
  1, -- nivel
  false,
  0
)
ON CONFLICT (discipulo_id, fase_numero, passo_numero) 
DO UPDATE SET
  completado = false,
  pontuacao_total = COALESCE(progresso_fases.pontuacao_total, 0);

-- Criar notificação para o discípulo sobre o desbloqueio do passo 2
INSERT INTO notificacoes (
  user_id,
  tipo,
  titulo,
  mensagem,
  lida
)
SELECT 
  d.user_id,
  'desbloqueio_passo',
  'Parabéns! Passo 2 Desbloqueado',
  'Você completou todas as atividades do Passo 1 e agora pode avançar para o Passo 2!',
  false
FROM discipulos d
WHERE d.id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
