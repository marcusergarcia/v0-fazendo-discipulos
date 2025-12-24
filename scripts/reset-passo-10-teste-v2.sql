-- Reset completo do Passo 10 para o discípulo TESTE
-- Execute este script para testar o fluxo novamente

DO $$
DECLARE
  discipulo_id_teste UUID;
  user_id_teste UUID;
BEGIN
  -- Buscar discípulo pelo nome_completo na tabela profiles
  SELECT p.id INTO user_id_teste
  FROM profiles p
  WHERE p.nome_completo ILIKE '%TESTE%'
  LIMIT 1;

  IF user_id_teste IS NULL THEN
    RAISE EXCEPTION 'Profile TESTE não encontrado';
  END IF;

  -- Buscar ID do discípulo
  SELECT id INTO discipulo_id_teste
  FROM discipulos
  WHERE user_id = user_id_teste
  LIMIT 1;

  IF discipulo_id_teste IS NULL THEN
    RAISE EXCEPTION 'Discípulo TESTE não encontrado';
  END IF;

  RAISE NOTICE 'Discípulo TESTE encontrado: %', discipulo_id_teste;

  -- 2. Deletar perguntas reflexivas do passo 10
  DELETE FROM perguntas_reflexivas
  WHERE discipulo_id = discipulo_id_teste
    AND fase_numero = 1
    AND passo_numero = 10;

  -- 3. Deletar reflexões de vídeos e artigos do passo 10
  DELETE FROM reflexoes_passo
  WHERE discipulo_id = discipulo_id_teste
    AND passo_numero = 10;

  -- 4. Deletar notificações do passo 10
  DELETE FROM notificacoes
  WHERE discipulo_id = discipulo_id_teste
    AND mensagem LIKE '%Passo 10%';

  -- 5. Resetar progresso_fases - remover vídeos e artigos do passo 10 dos arrays
  -- Usando array_remove múltiplo aninhado de forma correta
  UPDATE progresso_fases
  SET 
    videos_assistidos = array_remove(array_remove(array_remove(array_remove(
      videos_assistidos,
      'passo-10-video-1'),
      'passo-10-video-2'),
      'passo-10-video-3'),
      'passo-10-video-4'),
    artigos_lidos = array_remove(array_remove(array_remove(array_remove(
      artigos_lidos,
      'passo-10-artigo-1'),
      'passo-10-artigo-2'),
      'passo-10-artigo-3'),
      'passo-10-artigo-4'),
    celebracao_vista = false,
    enviado_para_validacao = false
  WHERE discipulo_id = discipulo_id_teste
    AND fase_atual = 1;

  -- 6. Ajustar XP e resetar status do discípulo
  UPDATE discipulos
  SET 
    xp_total = GREATEST(0, xp_total - 360),
    passo_atual = 10
  WHERE id = discipulo_id_teste;

  -- 7. Resetar progresso_fases para o passo 10
  UPDATE progresso_fases
  SET
    passo_atual = 10,
    pontuacao_passo_anterior = NULL,
    pontuacao_passo_atual = 0
  WHERE discipulo_id = discipulo_id_teste
    AND fase_atual = 1;

  RAISE NOTICE 'Passo 10 resetado com sucesso para o discípulo TESTE';
END $$;
