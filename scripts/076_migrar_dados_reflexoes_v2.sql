-- Removido MAX(uuid) e usando subconsulta para buscar discipulador_id

-- Migrar dados de reflexoes_conteudo para reflexoes_passo
-- Agrupando por discipulo_id, fase_numero, passo_numero, tipo

INSERT INTO reflexoes_passo (
  discipulo_id,
  discipulador_id,
  fase_numero,
  passo_numero,
  tipo,
  conteudos_ids,
  reflexoes,
  feedbacks,
  situacao,
  xp_ganho,
  data_criacao,
  data_aprovacao
)
SELECT 
  rc.discipulo_id,
  -- Buscar o discipulador_id da tabela discipulos
  (SELECT discipulador_id FROM discipulos WHERE id = rc.discipulo_id LIMIT 1),
  rc.fase_numero,
  rc.passo_numero,
  rc.tipo,
  
  -- Array de IDs dos conteúdos
  array_agg(rc.conteudo_id ORDER BY rc.conteudo_id),
  
  -- Array de reflexões JSONB
  jsonb_agg(
    jsonb_build_object(
      'conteudo_id', rc.conteudo_id,
      'reflexao', COALESCE(rc.reflexao, ''),
      'resumo', COALESCE(rc.resumo, ''),
      'titulo', COALESCE(rc.titulo, '')
    ) ORDER BY rc.conteudo_id
  ),
  
  -- Array de feedbacks JSONB
  jsonb_agg(
    jsonb_build_object(
      'conteudo_id', rc.conteudo_id,
      'feedback_discipulador', COALESCE(rc.feedback_discipulador, ''),
      'xp_ganho', COALESCE(rc.xp_ganho, 0)
    ) ORDER BY rc.conteudo_id
  ),
  
  -- Status geral (pega o mais avançado)
  CASE 
    WHEN bool_and(rc.situacao = 'aprovado') THEN 'aprovado'
    WHEN bool_or(rc.situacao = 'enviado') THEN 'enviado'
    WHEN bool_or(rc.reflexao IS NOT NULL AND rc.reflexao != '') THEN 'em_andamento'
    ELSE 'nao_iniciado'
  END,
  
  -- XP total do grupo
  COALESCE(SUM(rc.xp_ganho), 0),
  
  -- Data mais antiga de criação
  MIN(rc.data_criacao),
  
  -- Data mais recente de aprovação
  MAX(rc.data_aprovacao)

FROM reflexoes_conteudo rc
GROUP BY rc.discipulo_id, rc.fase_numero, rc.passo_numero, rc.tipo
ON CONFLICT (discipulo_id, fase_numero, passo_numero, tipo) 
DO UPDATE SET
  discipulador_id = EXCLUDED.discipulador_id,
  conteudos_ids = EXCLUDED.conteudos_ids,
  reflexoes = EXCLUDED.reflexoes,
  feedbacks = EXCLUDED.feedbacks,
  situacao = EXCLUDED.situacao,
  xp_ganho = EXCLUDED.xp_ganho,
  data_criacao = EXCLUDED.data_criacao,
  data_aprovacao = EXCLUDED.data_aprovacao;

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
  'Redução estimada',
  CAST(ROUND(((SELECT COUNT(*)::numeric FROM reflexoes_conteudo) - 
              (SELECT COUNT(*)::numeric FROM reflexoes_passo)) / 
             (SELECT COUNT(*)::numeric FROM reflexoes_conteudo) * 100, 1) AS text) || '%';
