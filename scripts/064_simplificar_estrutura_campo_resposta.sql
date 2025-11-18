-- Simplificar estrutura da tabela historico_respostas_passo
-- Manter apenas: tipo_resposta (pergunta/missao) + resposta (conteúdo)

-- 1. Adicionar coluna 'resposta' se não existir
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS resposta text;

-- 2. Migrar dados existentes para o campo unificado 'resposta'
UPDATE historico_respostas_passo
SET resposta = COALESCE(texto_resposta, resposta_pergunta, resposta_missao)
WHERE resposta IS NULL OR resposta = '';

-- 3. Remover colunas redundantes
ALTER TABLE historico_respostas_passo 
DROP COLUMN IF EXISTS texto_pergunta,
DROP COLUMN IF EXISTS texto_resposta,
DROP COLUMN IF EXISTS pergunta,
DROP COLUMN IF EXISTS resposta_pergunta,
DROP COLUMN IF EXISTS missao_pratica,
DROP COLUMN IF EXISTS resposta_missao;

-- 4. Adicionar constraint para garantir que resposta não seja nula
ALTER TABLE historico_respostas_passo
ALTER COLUMN resposta SET NOT NULL;

-- 5. Adicionar constraint para tipo_resposta aceitar apenas 'pergunta' ou 'missao'
ALTER TABLE historico_respostas_passo
DROP CONSTRAINT IF EXISTS historico_respostas_passo_tipo_resposta_check;

ALTER TABLE historico_respostas_passo
ADD CONSTRAINT historico_respostas_passo_tipo_resposta_check 
CHECK (tipo_resposta IN ('pergunta', 'missao'));

-- 6. Verificar resultado da migração
SELECT 
  'Migração concluída!' as status,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN tipo_resposta = 'pergunta' THEN 1 END) as total_perguntas,
  COUNT(CASE WHEN tipo_resposta = 'missao' THEN 1 END) as total_missoes,
  COUNT(CASE WHEN resposta IS NOT NULL THEN 1 END) as com_resposta
FROM historico_respostas_passo;

-- 7. Mostrar exemplo dos dados migrados
SELECT 
  id,
  discipulo_id,
  tipo_resposta,
  LEFT(resposta, 100) || '...' as resposta_preview,
  situacao,
  data_envio
FROM historico_respostas_passo
ORDER BY data_envio DESC
LIMIT 5;
