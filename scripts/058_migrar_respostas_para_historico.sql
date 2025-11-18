-- Migrar respostas da tabela progresso_fases para historico_respostas_passo
-- Para o Pr. Marcus Emerson (d4d131f7-de70-48e6-943b-840f6fe7c51d)

-- Inserir respostas do passo 1 no histórico
INSERT INTO historico_respostas_passo (
  discipulo_id,
  discipulador_id,
  passo_numero,
  fase_numero,
  pergunta,
  resposta_pergunta,
  missao_pratica,
  resposta_missao,
  situacao,
  data_envio,
  xp_ganho
)
SELECT 
  pf.discipulo_id,
  d.discipulador_id,
  pf.passo_numero,
  pf.fase_numero,
  'Qual o propósito da criação do ser humano?' as pergunta,
  pf.resposta_pergunta,
  'Escreva uma frase respondendo: "Por que eu existo?"' as missao_pratica,
  pf.resposta_missao,
  'enviado' as situacao, -- Define como enviado para o discipulador aprovar
  NOW() as data_envio,
  0 as xp_ganho -- XP será dado quando aprovar
FROM progresso_fases pf
JOIN discipulos d ON d.id = pf.discipulo_id
WHERE pf.discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND pf.passo_numero = 1
  AND (pf.resposta_pergunta IS NOT NULL OR pf.resposta_missao IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM historico_respostas_passo hrp
    WHERE hrp.discipulo_id = pf.discipulo_id
      AND hrp.passo_numero = pf.passo_numero
  );

-- Verificar o que foi inserido
SELECT 
  id,
  discipulo_id,
  passo_numero,
  fase_numero,
  LEFT(resposta_pergunta, 100) as resposta_pergunta_inicio,
  LEFT(resposta_missao, 100) as resposta_missao_inicio,
  situacao,
  data_envio
FROM historico_respostas_passo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
ORDER BY passo_numero;
