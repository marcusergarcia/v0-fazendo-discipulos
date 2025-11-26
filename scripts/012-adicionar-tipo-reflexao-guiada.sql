-- Adicionar novo tipo de resposta: reflexao_guiada
ALTER TABLE historico_respostas_passo
DROP CONSTRAINT IF EXISTS historico_respostas_passo_tipo_resposta_check;

ALTER TABLE historico_respostas_passo
ADD CONSTRAINT historico_respostas_passo_tipo_resposta_check 
CHECK (tipo_resposta IN ('pergunta', 'missao', 'reflexao_guiada'));

-- Verificar se a constraint foi atualizada
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'historico_respostas_passo_tipo_resposta_check';
