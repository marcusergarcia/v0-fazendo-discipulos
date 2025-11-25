-- Script para aprovar automaticamente as tarefas do Pr. Marcus (Discipulador Virtual)
-- Este script deve ser rodado sempre que o Pr. Marcus enviar todas as tarefas de um passo
-- Ele aprova reflexões, perguntas e missões com 30 XP cada e feedbacks criativos variados

-- Atualizando função para usar fase_numero E passo_numero com situacao = 'enviado'
CREATE OR REPLACE FUNCTION aprovar_tarefas_pr_marcus(p_fase_numero INTEGER, p_passo_numero INTEGER)
RETURNS JSON AS $$
DECLARE
  v_discipulo_id UUID := 'd4d131f7-de70-48e6-943b-840f6fe7c51d'; -- ID do Pr. Marcus na tabela discipulos
  v_reflexoes_aprovadas INTEGER := 0;
  v_perguntas_aprovadas INTEGER := 0;
  v_missoes_aprovadas INTEGER := 0;
  v_pontos_ganhos INTEGER := 0;
  -- Arrays de feedbacks criativos e variados
  v_feedbacks_reflexao TEXT[] := ARRAY[
    'Excelente reflexão! Sua compreensão sobre este conteúdo está cada vez mais profunda. 🙏',
    'Muito bem! Percebo que você está internalizando esses princípios de forma prática.',
    'Reflexão poderosa! Continue aplicando essas verdades em seu dia a dia.',
    'Parabéns! Sua capacidade de conectar teoria e prática está crescendo.',
    'Inspirador! Suas reflexões demonstram um coração disposto a aprender.',
    'Fantástico! Você está capturando a essência do discipulado.',
    'Maravilhoso! Vejo seu crescimento espiritual através dessas palavras.',
    'Profundo! Suas reflexões mostram maturidade e discernimento.'
  ];
  v_feedbacks_pergunta TEXT[] := ARRAY[
    'Resposta excepcional! Você compreendeu perfeitamente o objetivo desta pergunta chave. ⭐',
    'Brilhante! Sua resposta mostra clareza e profundidade de entendimento.',
    'Perfeito! Você capturou o cerne da questão com maestria.',
    'Impressionante! Sua resposta revela um entendimento sólido dos princípios.',
    'Excelente trabalho! Continue com essa dedicação ao estudo.',
    'Muito bem articulado! Sua resposta demonstra reflexão genuína.',
    'Poderoso! Você expressou verdades fundamentais com clareza.',
    'Maravilhoso! Sua compreensão está se aprofundando a cada passo.'
  ];
  v_feedbacks_missao TEXT[] := ARRAY[
    'Missão cumprida com excelência! Você está vivendo o discipulado na prática. 🎯',
    'Que testemunho poderoso! Continue sendo luz onde Deus te colocou.',
    'Incrível! Suas ações estão transformando vidas ao seu redor.',
    'Parabéns pela obediência! Colocar em prática é essencial no discipulado.',
    'Maravilhoso! Você está sendo instrumento de Deus nesta missão.',
    'Que impacto! Continue sendo sal e luz em cada oportunidade.',
    'Extraordinário! Sua dedicação à missão é inspiradora.',
    'Fantástico! Você está fazendo a diferença no Reino de Deus.'
  ];
BEGIN
  -- 1. Aprovar reflexões pendentes (de vídeos e artigos) com 30 XP e feedback aleatório
  UPDATE reflexoes_conteudo
  SET 
    situacao = 'aprovado',
    xp_ganho = 30,
    feedback_discipulador = v_feedbacks_reflexao[1 + floor(random() * array_length(v_feedbacks_reflexao, 1))::int],
    data_aprovacao = NOW()
  WHERE 
    discipulo_id = v_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero
    AND situacao = 'enviado';
  
  GET DIAGNOSTICS v_reflexoes_aprovadas = ROW_COUNT;
  v_pontos_ganhos := v_pontos_ganhos + (v_reflexoes_aprovadas * 30);

  -- 2. Aprovar pergunta chave pendente com 30 XP e feedback aleatório
  UPDATE historico_respostas_passo
  SET 
    situacao = 'aprovado',
    xp_ganho = 30,
    feedback_discipulador = v_feedbacks_pergunta[1 + floor(random() * array_length(v_feedbacks_pergunta, 1))::int],
    data_aprovacao = NOW()
  WHERE 
    discipulo_id = v_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero
    AND tipo_resposta = 'pergunta'
    AND situacao = 'enviado';
  
  GET DIAGNOSTICS v_perguntas_aprovadas = ROW_COUNT;
  v_pontos_ganhos := v_pontos_ganhos + (v_perguntas_aprovadas * 30);

  -- 3. Aprovar missão prática pendente com 30 XP e feedback aleatório
  UPDATE historico_respostas_passo
  SET 
    situacao = 'aprovado',
    xp_ganho = 30,
    feedback_discipulador = v_feedbacks_missao[1 + floor(random() * array_length(v_feedbacks_missao, 1))::int],
    data_aprovacao = NOW()
  WHERE 
    discipulo_id = v_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero
    AND tipo_resposta = 'missao'
    AND situacao = 'enviado';
  
  GET DIAGNOSTICS v_missoes_aprovadas = ROW_COUNT;
  v_pontos_ganhos := v_pontos_ganhos + (v_missoes_aprovadas * 30);

  -- Retornar resumo
  RETURN json_build_object(
    'sucesso', true,
    'reflexoes_aprovadas', v_reflexoes_aprovadas,
    'perguntas_aprovadas', v_perguntas_aprovadas,
    'missoes_aprovadas', v_missoes_aprovadas,
    'pontos_ganhos', v_pontos_ganhos,
    'mensagem', format('✅ Aprovação automática concluída! %s reflexões, %s pergunta(s), %s missão(ões) aprovadas. Total: %s XP', 
                       v_reflexoes_aprovadas, v_perguntas_aprovadas, v_missoes_aprovadas, v_pontos_ganhos)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemplo de execução com fase_numero e passo_numero
-- Para executar manualmente: SELECT aprovar_tarefas_pr_marcus(1, 1);  -- fase 1, passo 1
