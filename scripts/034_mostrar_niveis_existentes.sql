-- Script para mostrar os valores de nivel_atual existentes na tabela discipulos
-- Isso vai nos ajudar a entender quais valores são válidos

SELECT 
    id,
    nome_completo_temp,
    nivel_atual,
    xp_total
FROM discipulos
ORDER BY nivel_atual DESC;

-- Mostrar também a definição da constraint
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'discipulos'::regclass
    AND conname LIKE '%nivel%';
