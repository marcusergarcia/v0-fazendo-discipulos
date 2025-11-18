-- Aprovar as respostas do Pr. Marcus Emerson para liberar o Passo 2

-- Buscar o discípulo Pr. Marcus Emerson
DO $$
DECLARE
  v_discipulo_id UUID;
  v_passo_numero INT := 1;
  v_pergunta_id UUID;
  v_missao_id UUID;
BEGIN
  -- Buscar ID do Pr. Marcus Emerson pela tabela profiles
  SELECT d.id INTO v_discipulo_id
  FROM discipulos d
  INNER JOIN profiles p ON p.id = d.user_id
  WHERE p.nome_completo ILIKE '%Marcus%Emerson%'
  LIMIT 1;

  IF v_discipulo_id IS NULL THEN
    RAISE NOTICE 'Discípulo Pr. Marcus Emerson não encontrado';
    RETURN;
  END IF;

  RAISE NOTICE 'Discípulo encontrado: %', v_discipulo_id;

  -- Aprovar a pergunta
  UPDATE historico_respostas_passo
  SET 
    situacao = 'aprovado',
    xp_ganho = 25,
    feedback_discipulador = 'Excelente reflexão! Você compreendeu bem o propósito da criação.',
    data_aprovacao = NOW()
  WHERE discipulo_id = v_discipulo_id
    AND passo_numero = v_passo_numero
    AND tipo_resposta = 'pergunta'
    AND situacao = 'enviado'
  RETURNING id INTO v_pergunta_id;

  IF v_pergunta_id IS NOT NULL THEN
    RAISE NOTICE 'Pergunta aprovada: %', v_pergunta_id;
  ELSE
    RAISE NOTICE 'Nenhuma pergunta encontrada para aprovar';
  END IF;

  -- Aprovar a missão
  UPDATE historico_respostas_passo
  SET 
    situacao = 'aprovado',
    xp_ganho = 25,
    feedback_discipulador = 'Ótima resposta! Continue assim!',
    data_aprovacao = NOW()
  WHERE discipulo_id = v_discipulo_id
    AND passo_numero = v_passo_numero
    AND tipo_resposta = 'missao'
    AND situacao = 'enviado'
  RETURNING id INTO v_missao_id;

  IF v_missao_id IS NOT NULL THEN
    RAISE NOTICE 'Missão aprovada: %', v_missao_id;
  ELSE
    RAISE NOTICE 'Nenhuma missão encontrada para aprovar';
  END IF;

  -- Atualizar XP do discípulo
  UPDATE discipulos
  SET xp_total = COALESCE(xp_total, 0) + 50
  WHERE id = v_discipulo_id;

  RAISE NOTICE 'XP atualizado (+50 XP)';

  -- Verificar se todas as reflexões estão aprovadas
  DECLARE
    v_total_reflexoes INT;
    v_reflexoes_aprovadas INT;
    v_pode_avancar BOOLEAN := FALSE;
  BEGIN
    SELECT COUNT(*) INTO v_total_reflexoes
    FROM reflexoes_conteudo
    WHERE discipulo_id = v_discipulo_id
      AND passo_numero = v_passo_numero;

    SELECT COUNT(*) INTO v_reflexoes_aprovadas
    FROM reflexoes_conteudo
    WHERE discipulo_id = v_discipulo_id
      AND passo_numero = v_passo_numero
      AND situacao = 'aprovado';

    RAISE NOTICE 'Reflexões: % de % aprovadas', v_reflexoes_aprovadas, v_total_reflexoes;

    -- Se todas as reflexões e respostas estão aprovadas, liberar próximo passo
    IF v_reflexoes_aprovadas >= 6 AND v_pergunta_id IS NOT NULL AND v_missao_id IS NOT NULL THEN
      v_pode_avancar := TRUE;
      
      UPDATE discipulos
      SET passo_atual = 2
      WHERE id = v_discipulo_id;
      
      RAISE NOTICE '✅ PASSO 2 LIBERADO AUTOMATICAMENTE!';
    ELSE
      RAISE NOTICE '⚠️ Ainda faltam reflexões para liberar o Passo 2';
      RAISE NOTICE 'Necessário: 6 reflexões aprovadas + pergunta + missão';
    END IF;
  END;

  -- Mostrar resultado final
  RAISE NOTICE '=== RESUMO ===';
  RAISE NOTICE 'Discípulo: Pr. Marcus Emerson';
  RAISE NOTICE 'Pergunta aprovada: %', v_pergunta_id IS NOT NULL;
  RAISE NOTICE 'Missão aprovada: %', v_missao_id IS NOT NULL;
  
END $$;

-- Verificar status final
SELECT 
  p.nome_completo,
  d.passo_atual,
  d.xp_total,
  COUNT(CASE WHEN r.situacao = 'aprovado' THEN 1 END) as reflexoes_aprovadas,
  COUNT(r.id) as total_reflexoes,
  (SELECT COUNT(*) FROM historico_respostas_passo 
   WHERE discipulo_id = d.id 
   AND passo_numero = 1 
   AND situacao = 'aprovado') as respostas_aprovadas
FROM discipulos d
INNER JOIN profiles p ON p.id = d.user_id
LEFT JOIN reflexoes_conteudo r ON r.discipulo_id = d.id AND r.passo_numero = 1
WHERE p.nome_completo ILIKE '%Marcus%Emerson%'
GROUP BY d.id, p.nome_completo, d.passo_atual, d.xp_total;
