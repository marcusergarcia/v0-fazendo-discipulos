-- Atualizar os tipos permitidos na tabela notificacoes para incluir todos os tipos usados no sistema

-- Remover a constraint antiga
ALTER TABLE notificacoes 
DROP CONSTRAINT IF EXISTS notificacoes_tipo_check;

-- Adicionar a nova constraint com TODOS os tipos usados no sistema
ALTER TABLE notificacoes
ADD CONSTRAINT notificacoes_tipo_check 
CHECK (tipo = ANY (ARRAY[
  'reflexao'::text,           -- Tipo legado (manter para compatibilidade)
  'reflexao_enviada'::text,   -- Reflexões de vídeos e artigos enviadas para aprovação
  'missao'::text,             -- Missões práticas
  'mensagem'::text,           -- Mensagens do chat
  'validacao'::text,          -- Validações do sistema
  'perguntas_reflexivas'::text, -- Perguntas reflexivas enviadas (nome legado)
  'pergunta_enviada'::text,   -- Perguntas reflexivas enviadas (nome novo)
  'novo_discipulo'::text,     -- Novo discípulo aguardando aprovação
  'aprovacao_aceita'::text,   -- Discípulo aprovado pelo discipulador
  'discipulo_rejeitado'::text, -- Discípulo rejeitado pelo discipulador
  'solicitacao_convite'::text  -- Solicitação de convite para se tornar discípulo
]));

-- Verificar que a constraint foi atualizada
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'notificacoes_tipo_check';
