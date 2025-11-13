-- Script para verificar a constraint do nivel_atual e atualizar corretamente

-- Verificar a constraint atual
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'discipulos'::regclass
    AND conname LIKE '%nivel%';

-- Mostrar os níveis atuais possíveis
SELECT DISTINCT nivel_atual 
FROM discipulos 
WHERE nivel_atual IS NOT NULL
ORDER BY nivel_atual;

-- Atualizar o nível do Marcus para o maior valor válido (provavelmente 4)
-- Se 4 não funcionar, o script seguinte tentará 3, 2, etc.
UPDATE discipulos
SET nivel_atual = 4
WHERE user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'marcus.macintel@terra.com.br'
);

-- Verificar se a atualização funcionou
SELECT 
    user_id,
    nome_completo_temp,
    nivel_atual,
    xp_total
FROM discipulos
WHERE user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'marcus.macintel@terra.com.br'
);
