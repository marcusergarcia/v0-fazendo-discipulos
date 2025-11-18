-- Otimizar a estrutura da tabela historico_respostas_passo
-- Removendo campos redundantes e consolidando em uma estrutura mais limpa

-- 1. Adicionar novas colunas limpas
ALTER TABLE historico_respostas_passo
ADD COLUMN IF NOT EXISTS texto_pergunta TEXT,
ADD COLUMN IF NOT EXISTS texto_resposta TEXT;

-- 2. Migrar dados existentes para as novas colunas
UPDATE historico_respostas_passo
SET 
  texto_pergunta = CASE 
    WHEN tipo_resposta = 'pergunta' THEN pergunta
    WHEN tipo_resposta = 'missao' THEN missao_pratica
    ELSE NULL
  END,
  texto_resposta = CASE 
    WHEN tipo_resposta = 'pergunta' THEN resposta_pergunta
    WHEN tipo_resposta = 'missao' THEN resposta_missao
    ELSE NULL
  END;

-- 3. Remover colunas redundantes
ALTER TABLE historico_respostas_passo
DROP COLUMN IF EXISTS pergunta,
DROP COLUMN IF EXISTS resposta_pergunta,
DROP COLUMN IF EXISTS missao_pratica,
DROP COLUMN IF EXISTS resposta_missao;

-- 4. Remover colunas obsoletas de validação antiga
ALTER TABLE historico_respostas_passo
DROP COLUMN IF EXISTS status_validacao,
DROP COLUMN IF EXISTS validado_por,
DROP COLUMN IF EXISTS data_validacao;

-- 5. Adicionar constraint para garantir que tipo_resposta seja válido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'historico_respostas_passo_tipo_resposta_check'
  ) THEN
    ALTER TABLE historico_respostas_passo
    ADD CONSTRAINT historico_respostas_passo_tipo_resposta_check
    CHECK (tipo_resposta IN ('pergunta', 'missao'));
  END IF;
END$$;

-- 6. Adicionar constraint para garantir que situacao seja válida
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'historico_respostas_passo_situacao_check'
  ) THEN
    ALTER TABLE historico_respostas_passo
    ADD CONSTRAINT historico_respostas_passo_situacao_check
    CHECK (situacao IN ('enviado', 'aprovado', 'rejeitado'));
  END IF;
END$$;

-- 7. Verificar resultado
SELECT 
  'Estrutura otimizada com sucesso!' as mensagem,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN tipo_resposta = 'pergunta' THEN 1 END) as perguntas,
  COUNT(CASE WHEN tipo_resposta = 'missao' THEN 1 END) as missoes,
  COUNT(CASE WHEN situacao = 'enviado' THEN 1 END) as enviados,
  COUNT(CASE WHEN situacao = 'aprovado' THEN 1 END) as aprovados
FROM historico_respostas_passo;
