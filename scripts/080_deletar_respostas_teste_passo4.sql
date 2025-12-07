-- Deletar respostas antigas do Passo 4 do discípulo TESTE
-- para permitir reenvio com todas as 4 perguntas

DO $$
DECLARE
  v_discipulo_id UUID;
BEGIN
  -- Buscar o ID do discípulo TESTE
  SELECT id INTO v_discipulo_id
  FROM discipulos
  WHERE email_temporario = 'teste@gmail.com';

  IF v_discipulo_id IS NULL THEN
    RAISE NOTICE 'Discípulo TESTE não encontrado';
    RETURN;
  END IF;

  -- Deletar registro de perguntas reflexivas do Passo 4
  DELETE FROM perguntas_reflexivas
  WHERE discipulo_id = v_discipulo_id
    AND passo_numero = 4;

  RAISE NOTICE 'Respostas do Passo 4 deletadas. O discípulo pode reenviar com todas as 4 perguntas.';
END $$;
