-- Script para inicializar progresso para discípulos existentes que não têm registros ainda
-- Isso corrige o problema de discípulos aprovados antes da funcionalidade de inicialização automática

-- Inserir registros de progresso para todos os 10 passos da Fase 1 (O Evangelho)
-- para cada discípulo aprovado que não tem progresso ainda
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
  CASE 
    WHEN passo_num = 1 THEN NOW()  -- Primeiro passo já pode começar
    ELSE NULL                        -- Outros passos só começam quando o anterior for completado
  END as data_inicio,
  ARRAY[]::TEXT[] as videos_assistidos,
  ARRAY[]::TEXT[] as artigos_lidos,
  false as completado,
  false as enviado_para_validacao,
  '' as resposta_pergunta,
  '' as resposta_missao,
  '' as rascunho_resposta,
  'pendente' as status_validacao,
  0 as pontuacao_total,
  0 as reflexoes_concluidas,
  NULL as data_completado
FROM 
  public.discipulos d
CROSS JOIN 
  generate_series(1, 10) as passo_num
WHERE 
  d.aprovado_discipulador = true
  AND NOT EXISTS (
    -- Só inserir se o discípulo ainda não tem progresso
    SELECT 1 
    FROM public.progresso_fases pf 
    WHERE pf.discipulo_id = d.id
  );
