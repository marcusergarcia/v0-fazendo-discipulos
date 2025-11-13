-- Script para aumentar o nível do Marcus sem alterar pontos XP
-- Mantém xp_total intacto, apenas aumenta o nivel_atual

DO $$
DECLARE
  v_marcus_user_id UUID;
BEGIN
  -- Buscar o user_id do Marcus pelo email
  SELECT id INTO v_marcus_user_id
  FROM auth.users
  WHERE email = 'marcus.macintel@terra.com.br';

  -- Atualizar apenas o nivel_atual para 5 (Multiplicador) sem alterações em xp_total
  UPDATE discipulos
  SET 
    nivel_atual = 5,
    updated_at = NOW()
  WHERE user_id = v_marcus_user_id;

  -- Mostrar resultado
  RAISE NOTICE 'Nível atualizado para Marcus (nivel_atual = 5)!';
  RAISE NOTICE 'User ID: %', v_marcus_user_id;
  
  -- Verificar o resultado
  SELECT 
    nome_completo_temp,
    nivel_atual,
    xp_total
  FROM discipulos
  WHERE user_id = v_marcus_user_id;
END $$;

-- Mostrar o registro atualizado
SELECT 
  d.nome_completo_temp,
  d.nivel_atual,
  d.xp_total,
  d.fase_atual,
  d.passo_atual
FROM discipulos d
WHERE d.user_id = (
  SELECT id FROM auth.users WHERE email = 'marcus.macintel@terra.com.br'
);
