-- Script para migrar de múltiplas linhas (1 por passo) para linha única por discípulo
-- Mantém apenas o registro do passo atual do discípulo

-- Primeiro, encontrar o passo mais avançado de cada discípulo
WITH passo_atual AS (
  SELECT 
    discipulo_id,
    MAX(passo_numero) as ultimo_passo
  FROM public.progresso_fases
  WHERE fase_numero = 1
  GROUP BY discipulo_id
),
registros_manter AS (
  SELECT pf.id
  FROM public.progresso_fases pf
  INNER JOIN passo_atual pa 
    ON pf.discipulo_id = pa.discipulo_id 
    AND pf.passo_numero = pa.ultimo_passo
  WHERE pf.fase_numero = 1
)
-- Excluir todos os registros exceto o do passo atual
DELETE FROM public.progresso_fases
WHERE id NOT IN (SELECT id FROM registros_manter);

-- Remover constraint única que permitia múltiplos registros
DROP INDEX IF EXISTS idx_progresso_fases_discipulo;

-- Criar nova constraint única garantindo apenas 1 registro por discípulo por fase
CREATE UNIQUE INDEX idx_progresso_fases_discipulo_unico 
ON public.progresso_fases(discipulo_id, fase_numero);

-- Comentário explicativo
COMMENT ON INDEX idx_progresso_fases_discipulo_unico IS 
'Garante que cada discípulo tenha apenas 1 registro de progresso por fase. O passo_numero é atualizado conforme o discípulo avança.';
