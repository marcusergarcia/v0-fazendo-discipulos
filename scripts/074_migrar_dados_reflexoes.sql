-- Migração de dados da tabela reflexoes_conteudo (antiga) para reflexoes_passo (nova otimizada)
-- Esta migração agrupa múltiplas reflexões em uma única linha por tipo de conteúdo/passo

-- Ajustado para usar a estrutura real da tabela reflexoes_passo
INSERT INTO reflexoes_passo (
  discipulo_id,
  fase_numero,
  passo_numero,
  tipo_conteudo,
  conteudos_ids,
  respostas,
  feedbacks,
  situacao,
  todos_aprovados,
  xp_total,
  created_at,
  updated_at
)
SELECT 
  rc.discipulo_id,
  rc.fase_numero,
  rc.passo_numero,
  -- Determinar tipo de conteúdo baseado no tipo na tabela conteudos_fases
  CASE 
    WHEN cf.tipo = 'video' THEN 'video'
    WHEN cf.tipo = 'artigo' THEN 'artigo'
    ELSE 'outro'
  END as tipo_conteudo,
  -- Array de IDs dos conteúdos
  array_agg(rc.conteudo_id ORDER BY rc.created_at) as conteudos_ids,
  -- Agregar todas as respostas em um array JSONB
  jsonb_agg(
    jsonb_build_object(
      'conteudo_id', rc.conteudo_id,
      'titulo', rc.titulo,
      'reflexao', rc.reflexao,
      'resumo', rc.resumo,
      'xp_ganho', COALESCE(rc.xp_ganho, 0),
      'created_at', rc.data_criacao,
      'updated_at', rc.data_aprovacao
    ) ORDER BY rc.data_criacao
  ) as respostas,
  -- Agregar feedbacks em um array JSONB separado
  jsonb_agg(
    CASE 
      WHEN rc.feedback_discipulador IS NOT NULL THEN
        jsonb_build_object(
          'conteudo_id', rc.conteudo_id,
          'feedback', rc.feedback_discipulador,
          'data', rc.data_aprovacao
        )
      ELSE NULL
    END
    ORDER BY rc.data_criacao
  ) FILTER (WHERE rc.feedback_discipulador IS NOT NULL) as feedbacks,
  -- Determinar situação consolidada do grupo
  CASE 
    -- Se todas as reflexões estão aprovadas, o grupo está aprovado
    WHEN BOOL_AND(rc.situacao = 'aprovado') THEN 'aprovado'
    -- Se alguma foi enviada mas nem todas aprovadas, está em avaliação
    WHEN BOOL_OR(rc.situacao IN ('enviado', 'aprovado')) THEN 'enviado'
    -- Caso contrário, não iniciado
    ELSE 'nao_iniciado'
  END as situacao,
  -- Flag indicando se todos foram aprovados
  BOOL_AND(rc.situacao = 'aprovado') as todos_aprovados,
  -- Somar todo o XP ganho no grupo
  COALESCE(SUM(rc.xp_ganho), 0) as xp_total,
  -- Usar a data mais antiga de criação do grupo
  MIN(rc.data_criacao) as created_at,
  -- Usar a data mais recente de atualização do grupo
  MAX(COALESCE(rc.data_aprovacao, rc.data_criacao)) as updated_at
FROM reflexoes_conteudo rc
INNER JOIN conteudos_fases cf ON cf.id = rc.conteudo_id
WHERE cf.tipo IN ('video', 'artigo') -- Apenas vídeos e artigos
GROUP BY 
  rc.discipulo_id,
  rc.fase_numero,
  rc.passo_numero,
  cf.tipo
ORDER BY 
  rc.discipulo_id,
  rc.fase_numero,
  rc.passo_numero,
  cf.tipo;

-- Verificar resultado da migração
SELECT 
  'reflexoes_conteudo (antiga)' as tabela,
  COUNT(*)::text as total_linhas
FROM reflexoes_conteudo
UNION ALL
SELECT 
  'reflexoes_passo (nova)' as tabela,
  COUNT(*)::text as total_linhas
FROM reflexoes_passo
UNION ALL
SELECT 
  'Redução percentual' as tabela,
  ROUND(
    (1 - (SELECT COUNT(*)::float FROM reflexoes_passo) / 
         NULLIF((SELECT COUNT(*)::float FROM reflexoes_conteudo), 0)) * 100, 
    2
  )::text || '%' as total_linhas;

-- Comparar XP total antes e depois para validar integridade
SELECT 
  'XP total reflexoes_conteudo' as metrica,
  SUM(COALESCE(xp_ganho, 0))::text as valor
FROM reflexoes_conteudo
UNION ALL
SELECT 
  'XP total reflexoes_passo' as metrica,
  SUM(xp_total)::text as valor
FROM reflexoes_passo;

-- Mostrar exemplo de agrupamento para validação
SELECT 
  discipulo_id,
  fase_numero,
  passo_numero,
  tipo_conteudo,
  situacao,
  jsonb_array_length(respostas) as qtd_respostas,
  COALESCE(jsonb_array_length(feedbacks), 0) as qtd_feedbacks,
  xp_total,
  todos_aprovados
FROM reflexoes_passo
ORDER BY discipulo_id, fase_numero, passo_numero, tipo_conteudo
LIMIT 10;
