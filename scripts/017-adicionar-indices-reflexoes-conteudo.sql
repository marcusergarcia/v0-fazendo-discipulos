-- Script para adicionar índices compostos na tabela reflexoes_conteudo
-- Estes índices otimizam as queries mais frequentes do sistema

-- ÍNDICE 1: Para buscar reflexões de um discípulo em um passo específico
-- Usado em: actions.ts (linha 239), page.tsx do passo
-- Query: WHERE discipulo_id = X AND passo_numero = Y
CREATE INDEX IF NOT EXISTS idx_reflexoes_discipulo_passo 
ON reflexoes_conteudo(discipulo_id, passo_numero);

-- ÍNDICE 2: Para buscar reflexões pendentes de aprovação de um discípulo
-- Usado em: discipulador/page.tsx para listar tarefas pendentes
-- Query: WHERE discipulo_id = X AND situacao = 'enviado'
CREATE INDEX IF NOT EXISTS idx_reflexoes_discipulo_situacao 
ON reflexoes_conteudo(discipulo_id, situacao);

-- ÍNDICE 3: Para verificar se já existe reflexão de um conteúdo específico
-- Usado em: actions.ts (linhas 409-417, 563-571) ao enviar reflexão
-- Query: WHERE discipulo_id = X AND tipo = Y AND conteudo_id = Z AND passo_numero = W
CREATE INDEX IF NOT EXISTS idx_reflexoes_discipulo_conteudo 
ON reflexoes_conteudo(discipulo_id, tipo, conteudo_id, passo_numero);

-- ÍNDICE 4: Para buscar reflexões por discipulador (todas as reflexões dos discípulos dele)
-- Usado em: discipulador/page.tsx (linha 54)
-- Query: WHERE discipulador_id = X
CREATE INDEX IF NOT EXISTS idx_reflexoes_discipulador 
ON reflexoes_conteudo(discipulador_id);

-- ÍNDICE 5: Para buscar reflexões com notificação (usado ao deletar)
-- Usado em: actions.ts (linha 307) ao resetar passo
-- Query: WHERE id IN (...) com notificacao_id não nulo
CREATE INDEX IF NOT EXISTS idx_reflexoes_notificacao 
ON reflexoes_conteudo(notificacao_id) 
WHERE notificacao_id IS NOT NULL;

-- ÍNDICE 6: Para queries de agregação por fase e passo
-- Usado em: verificarConclusaoPasso para contar reflexões aprovadas
-- Query: WHERE discipulo_id = X AND fase_numero = Y AND passo_numero = Z AND situacao = 'aprovado'
CREATE INDEX IF NOT EXISTS idx_reflexoes_fase_passo_situacao 
ON reflexoes_conteudo(discipulo_id, fase_numero, passo_numero, situacao);

-- Comentários sobre os índices:
-- 1. índices compostos são ordenados da esquerda para a direita
-- 2. O primeiro campo do índice deve ser o mais seletivo (discipulo_id)
-- 3. Índices parciais (com WHERE) são menores e mais eficientes
-- 4. PostgreSQL pode usar estes índices para queries que filtram apenas pelos primeiros campos

-- Exemplo de uso automático:
-- Query: SELECT * FROM reflexoes_conteudo WHERE discipulo_id = 'abc' AND passo_numero = 2
-- Usará: idx_reflexoes_discipulo_passo automaticamente

ANALYZE reflexoes_conteudo;
