-- Migrar dados de progresso_fases para historico_respostas_passo
-- Criar dois registros separados: um para pergunta e outro para missão

-- 1. Primeiro, adicionar coluna 'resposta' se não existir
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS resposta text;

-- 2. Garantir que tipo_resposta existe
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS tipo_resposta text;

-- 3. Adicionar constraint para tipo_resposta aceitar apenas 'pergunta' ou 'missao'
ALTER TABLE historico_respostas_passo
DROP CONSTRAINT IF EXISTS historico_respostas_passo_tipo_resposta_check;

ALTER TABLE historico_respostas_passo
ADD CONSTRAINT historico_respostas_passo_tipo_resposta_check 
CHECK (tipo_resposta IN ('pergunta', 'missao'));

-- 4. Migrar respostas de perguntas de progresso_fases para historico_respostas_passo
INSERT INTO historico_respostas_passo (
  discipulo_id,
  passo_numero,
  fase_numero,
  tipo_resposta,
  resposta,
  situacao,
  data_envio,
  created_at
)
SELECT 
  pf.discipulo_id,
  pf.passo_numero,
  pf.fase_numero,
  'pergunta' as tipo_resposta,
  pf.resposta_pergunta as resposta,
  CASE 
    WHEN pf.enviado_para_validacao = true THEN 'enviado'
    ELSE 'rascunho'
  END as situacao,
  pf.created_at as data_envio,
  NOW() as created_at
FROM progresso_fases pf
WHERE pf.resposta_pergunta IS NOT NULL 
  AND pf.resposta_pergunta != ''
  AND NOT EXISTS (
    SELECT 1 FROM historico_respostas_passo hrp 
    WHERE hrp.discipulo_id = pf.discipulo_id 
      AND hrp.passo_numero = pf.passo_numero 
      AND hrp.fase_numero = pf.fase_numero
      AND hrp.tipo_resposta = 'pergunta'
  );

-- 5. Migrar respostas de missões de progresso_fases para historico_respostas_passo
INSERT INTO historico_respostas_passo (
  discipulo_id,
  passo_numero,
  fase_numero,
  tipo_resposta,
  resposta,
  situacao,
  data_envio,
  created_at
)
SELECT 
  pf.discipulo_id,
  pf.passo_numero,
  pf.fase_numero,
  'missao' as tipo_resposta,
  pf.resposta_missao as resposta,
  CASE 
    WHEN pf.enviado_para_validacao = true THEN 'enviado'
    ELSE 'rascunho'
  END as situacao,
  pf.created_at as data_envio,
  NOW() as created_at
FROM progresso_fases pf
WHERE pf.resposta_missao IS NOT NULL 
  AND pf.resposta_missao != ''
  AND NOT EXISTS (
    SELECT 1 FROM historico_respostas_passo hrp 
    WHERE hrp.discipulo_id = pf.discipulo_id 
      AND hrp.passo_numero = pf.passo_numero 
      AND hrp.fase_numero = pf.fase_numero
      AND hrp.tipo_resposta = 'missao'
  );

-- 6. Atualizar registros existentes em historico_respostas_passo que têm texto_resposta
UPDATE historico_respostas_passo
SET resposta = texto_resposta
WHERE resposta IS NULL 
  AND texto_resposta IS NOT NULL 
  AND texto_resposta != '';

-- 7. Remover colunas redundantes se existirem
ALTER TABLE historico_respostas_passo 
DROP COLUMN IF EXISTS texto_pergunta,
DROP COLUMN IF EXISTS texto_resposta;

-- 8. Verificar resultado da migração
SELECT 
  'Migração concluída!' as status,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN tipo_resposta = 'pergunta' THEN 1 END) as total_perguntas,
  COUNT(CASE WHEN tipo_resposta = 'missao' THEN 1 END) as total_missoes,
  COUNT(CASE WHEN resposta IS NOT NULL AND resposta != '' THEN 1 END) as com_resposta,
  COUNT(CASE WHEN situacao = 'enviado' THEN 1 END) as enviadas,
  COUNT(CASE WHEN situacao = 'aprovado' THEN 1 END) as aprovadas
FROM historico_respostas_passo;

-- 9. Mostrar exemplo dos dados migrados por discípulo
SELECT 
  d.nome_completo_temp as discipulo,
  hrp.passo_numero,
  hrp.tipo_resposta,
  LEFT(hrp.resposta, 80) || '...' as resposta_preview,
  hrp.situacao,
  hrp.data_envio
FROM historico_respostas_passo hrp
JOIN discipulos d ON d.id = hrp.discipulo_id
ORDER BY hrp.data_envio DESC
LIMIT 10;
