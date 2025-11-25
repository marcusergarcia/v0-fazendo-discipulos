-- Script para aprovar automaticamente as tarefas do Pr. Marcus (Discipulador Virtual)
-- Este script deve ser rodado sempre que o Pr. Marcus enviar todas as tarefas de um passo
-- Ele aprova reflexões, perguntas e missões com 30 XP cada e feedbacks criativos variados

-- Atualizando função para incluir feedbacks criativos aleatórios
CREATE OR REPLACE FUNCTION aprovar_tarefas_pr_marcus(p_numero_passo INTEGER)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a'; -- ID do Pr. Marcus
  v_progresso_id UUID;
  v_reflexoes_video INTEGER := 0;
  v_reflexoes_artigo INTEGER := 0;
  v_resposta_aprovada BOOLEAN := FALSE;
  v_missao_aprovada BOOLEAN := FALSE;
  v_pontos_ganhos INTEGER := 0;
  v_feedback TEXT;
  -- Arrays de feedbacks criativos e variados
  v_feedbacks_reflexao TEXT[] := ARRAY[
    'Excelente reflexão! Sua compreensão sobre este conteúdo está cada vez mais profunda.',
    'Muito bem! Percebo que você está internalizando esses princípios de forma prática.',
    'Reflexão poderosa! Continue aplicando essas verdades em seu dia a dia.',
    'Parabéns! Sua capacidade de conectar teoria e prática está crescendo.',
    'Inspirador! Suas reflexões demonstram um coração disposto a aprender.',
    'Fantástico! Você está capturando a essência do discipulado.',
    'Maravilhoso! Vejo seu crescimento espiritual através dessas palavras.',
    'Profundo! Suas reflexões mostram maturidade e discernimento.'
  ];
  v_feedbacks_pergunta TEXT[] := ARRAY[
    'Resposta excepcional! Você compreendeu perfeitamente o objetivo desta pergunta chave.',
    'Brilhante! Sua resposta mostra clareza e profundidade de entendimento.',
    'Perfeito! Você capturou o cerne da questão com maestria.',
    'Impressionante! Sua resposta revela um entendimento sólido dos princípios.',
    'Excelente trabalho! Continue com essa dedicação ao estudo.',
    'Muito bem articulado! Sua resposta demonstra reflexão genuína.',
    'Poderoso! Você expressou verdades fundamentais com clareza.',
    'Maravilhoso! Sua compreensão está se aprofundando a cada passo.'
  ];
  v_feedbacks_missao TEXT[] := ARRAY[
    'Missão cumprida com excelência! Você está vivendo o discipulado na prática.',
    'Que testemunho poderoso! Continue sendo luz onde Deus te colocou.',
    'Incrível! Suas ações estão transformando vidas ao seu redor.',
    'Parabéns pela obediência! Colocar em prática é essencial no discipulado.',
    'Maravilhoso! Você está sendo instrumento de Deus nesta missão.',
    'Que impacto! Continue sendo sal e luz em cada oportunidade.',
    'Extraordinário! Sua dedicação à missão é inspiradora.',
    'Fantástico! Você está fazendo a diferença no Reino de Deus.'
  ];
BEGIN
  -- Buscar o progresso do passo atual
  SELECT id INTO v_progresso_id
  FROM progresso_fases
  WHERE user_id = v_user_id
    AND numero_passo = p_numero_passo;

  IF v_progresso_id IS NULL THEN
    RETURN json_build_object('erro', 'Progresso não encontrado');
  END IF;

  -- 1. Aprovar reflexões de vídeos com feedback aleatório (30 XP cada)
  FOR v_feedback IN 
    SELECT v_feedbacks_reflexao[floor(random() * array_length(v_feedbacks_reflexao, 1) + 1)]
    FROM reflexoes_videos
    WHERE progresso_id = v_progresso_id AND situacao = 'enviado'
  LOOP
    UPDATE reflexoes_videos
    SET situacao = 'aprovado',
        feedback = v_feedback,
        pontos_ganhos = 30,
        avaliado_em = NOW()
    WHERE progresso_id = v_progresso_id
      AND situacao = 'enviado'
      AND id = (
        SELECT id FROM reflexoes_videos 
        WHERE progresso_id = v_progresso_id AND situacao = 'enviado'
        LIMIT 1
      );
    
    IF FOUND THEN
      v_reflexoes_video := v_reflexoes_video + 1;
    END IF;
  END LOOP;

  -- 2. Aprovar reflexões de artigos com feedback aleatório (30 XP cada)
  FOR v_feedback IN 
    SELECT v_feedbacks_reflexao[floor(random() * array_length(v_feedbacks_reflexao, 1) + 1)]
    FROM reflexoes_artigos
    WHERE progresso_id = v_progresso_id AND situacao = 'enviado'
  LOOP
    UPDATE reflexoes_artigos
    SET situacao = 'aprovado',
        feedback = v_feedback,
        pontos_ganhos = 30,
        avaliado_em = NOW()
    WHERE progresso_id = v_progresso_id
      AND situacao = 'enviado'
      AND id = (
        SELECT id FROM reflexoes_artigos 
        WHERE progresso_id = v_progresso_id AND situacao = 'enviado'
        LIMIT 1
      );
    
    IF FOUND THEN
      v_reflexoes_artigo := v_reflexoes_artigo + 1;
    END IF;
  END LOOP;

  -- 3. Aprovar resposta da pergunta chave com feedback aleatório (30 XP)
  v_feedback := v_feedbacks_pergunta[floor(random() * array_length(v_feedbacks_pergunta, 1) + 1)];
  UPDATE respostas_perguntas_historico
  SET situacao = 'aprovado',
      feedback = v_feedback,
      pontos_ganhos = 30,
      avaliado_em = NOW()
  WHERE user_id = v_user_id
    AND numero_passo = p_numero_passo
    AND situacao = 'enviado'
  RETURNING TRUE INTO v_resposta_aprovada;

  -- 4. Aprovar missão prática com feedback aleatório (30 XP)
  v_feedback := v_feedbacks_missao[floor(random() * array_length(v_feedbacks_missao, 1) + 1)];
  UPDATE respostas_missoes_historico
  SET situacao = 'aprovado',
      feedback = v_feedback,
      pontos_ganhos = 30,
      avaliado_em = NOW()
  WHERE user_id = v_user_id
    AND numero_passo = p_numero_passo
    AND situacao = 'enviado'
  RETURNING TRUE INTO v_missao_aprovada;

  -- Calcular pontos totais ganhos
  v_pontos_ganhos := (v_reflexoes_video * 30) + (v_reflexoes_artigo * 30);
  IF v_resposta_aprovada THEN v_pontos_ganhos := v_pontos_ganhos + 30; END IF;
  IF v_missao_aprovada THEN v_pontos_ganhos := v_pontos_ganhos + 30; END IF;

  -- Atualizar pontuação no progresso
  UPDATE progresso_fases
  SET pontuacao_total = pontuacao_total + v_pontos_ganhos
  WHERE id = v_progresso_id;

  -- Retornar resultado
  RETURN json_build_object(
    'sucesso', TRUE,
    'reflexoes_video', v_reflexoes_video,
    'reflexoes_artigo', v_reflexoes_artigo,
    'resposta_aprovada', v_resposta_aprovada,
    'missao_aprovada', v_missao_aprovada,
    'pontos_ganhos', v_pontos_ganhos
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
