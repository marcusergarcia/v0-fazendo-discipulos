-- Adicionar o tipo 'perguntas_reflexivas' à constraint da tabela notificacoes

-- Remover a constraint antiga
ALTER TABLE notificacoes 
DROP CONSTRAINT IF EXISTS notificacoes_tipo_check;

-- Adicionar a nova constraint com o tipo 'perguntas_reflexivas'
ALTER TABLE notificacoes
ADD CONSTRAINT notificacoes_tipo_check 
CHECK (tipo = ANY (ARRAY[
  'reflexao'::text, 
  'missao'::text, 
  'mensagem'::text, 
  'validacao'::text,
  'perguntas_reflexivas'::text
]));

-- Verificar que a constraint foi atualizada
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'notificacoes_tipo_check';
