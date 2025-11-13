-- Script para verificar constraint do campo tipo em notificacoes

-- Ver a constraint atual
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'notificacoes'::regclass
  AND conname LIKE '%tipo%';

-- Ver os tipos de notificação existentes
SELECT DISTINCT tipo
FROM notificacoes
WHERE tipo IS NOT NULL;
