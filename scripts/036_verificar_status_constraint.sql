-- Script para verificar os valores válidos para o campo status

-- Verificar a constraint do campo status
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'discipulos'::regclass
    AND conname LIKE '%status%';

-- Mostrar os valores de status atualmente na tabela
SELECT DISTINCT status
FROM discipulos
WHERE status IS NOT NULL;
