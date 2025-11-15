-- Zerar XP da Viviane
-- Este script limpa o XP total da discípula Viviane Silva Garcia

-- Buscar o discipulo_id da Viviane
DO $$
DECLARE
  viviane_discipulo_id UUID;
BEGIN
  -- Encontrar o ID da Viviane na tabela discipulos
  SELECT id INTO viviane_discipulo_id
  FROM discipulos
  WHERE user_id IN (
    SELECT id FROM profiles 
    WHERE email = 'vivianegarcia28@hotmail.com' 
    OR nome_completo ILIKE '%Viviane%Silva%Garcia%'
  )
  LIMIT 1;

  IF viviane_discipulo_id IS NOT NULL THEN
    -- Zerar o XP total
    UPDATE discipulos
    SET xp_total = 0
    WHERE id = viviane_discipulo_id;
    
    RAISE NOTICE 'XP da Viviane zerado com sucesso! ID: %', viviane_discipulo_id;
  ELSE
    RAISE NOTICE 'Viviane não encontrada na tabela discipulos';
  END IF;
END $$;

-- Verificar o resultado
SELECT 
  d.id,
  p.nome_completo,
  p.email,
  d.xp_total as xp_atual,
  d.fase_atual,
  d.passo_atual
FROM discipulos d
JOIN profiles p ON p.id = d.user_id
WHERE p.email = 'vivianegarcia28@hotmail.com' 
   OR p.nome_completo ILIKE '%Viviane%Silva%Garcia%';
