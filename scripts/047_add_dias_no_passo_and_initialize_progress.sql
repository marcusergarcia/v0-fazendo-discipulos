-- Script para adicionar campo dias_no_passo e inicializar progresso de discípulos existentes
-- Garante que todos os campos necessários existem antes de popular os dados

-- 1. Primeiro, adicionar a coluna dias_no_passo se não existir
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS dias_no_passo INTEGER DEFAULT 0;

-- 2. Criar função para atualizar dias_no_passo se não existir
CREATE OR REPLACE FUNCTION atualizar_dias_no_passo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completado THEN
    NEW.dias_no_passo := EXTRACT(DAY FROM (NEW.data_completado - NEW.data_inicio));
  ELSE
    NEW.dias_no_passo := EXTRACT(DAY FROM (NOW() - NEW.data_inicio));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar trigger para calcular dias_no_passo automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_dias_no_passo ON public.progresso_fases;
CREATE TRIGGER trigger_atualizar_dias_no_passo
  BEFORE INSERT OR UPDATE ON public.progresso_fases
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_dias_no_passo();

-- 4. Agora popular progresso para discípulos existentes que não têm registros ainda
-- Inserir registros de progresso para todos os 10 passos da Fase 1 (O Evangelho)
INSERT INTO public.progresso_fases (
  discipulo_id,
  fase_numero,
  passo_numero,
  nivel,
  passo,
  data_inicio,
  videos_assistidos,
  artigos_lidos,
  completado,
  enviado_para_validacao,
  resposta_pergunta,
  resposta_missao,
  rascunho_resposta,
  status_validacao,
  pontuacao_total,
  reflexoes_concluidas,
  data_completado
)
SELECT 
  d.id as discipulo_id,
  1 as fase_numero,
  passo_num as passo_numero,
  1 as nivel,
  passo_num as passo,
  CASE WHEN passo_num = 1 THEN NOW() ELSE NULL END as data_inicio, -- Só primeiro passo começa agora
  ARRAY[]::TEXT[] as videos_assistidos,
  ARRAY[]::TEXT[] as artigos_lidos,
  false as completado,
  false as enviado_para_validacao,
  NULL as resposta_pergunta,
  NULL as resposta_missao,
  NULL as rascunho_resposta,
  'pendente' as status_validacao,
  0 as pontuacao_total,
  0 as reflexoes_concluidas,
  NULL as data_completado
FROM 
  public.discipulos d
  CROSS JOIN generate_series(1, 10) as passo_num
WHERE 
  d.aprovado_discipulador = true
  AND NOT EXISTS (
    SELECT 1 FROM public.progresso_fases pf
    WHERE pf.discipulo_id = d.id
  )
ON CONFLICT (discipulo_id, fase_numero, passo_numero) DO NOTHING;

-- 5. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_progresso_dias ON public.progresso_fases(discipulo_id, completado, dias_no_passo);

-- 6. Comentário
COMMENT ON COLUMN public.progresso_fases.dias_no_passo IS 'Dias no passo atual (calculado automaticamente via trigger)';
