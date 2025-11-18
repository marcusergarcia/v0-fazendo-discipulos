-- Corrigir foreign key do discipulador_id na tabela historico_respostas_passo
-- O discipulador_id deve referenciar profiles(id) ou auth.users(id), não discipulos(id)

-- Remover a constraint incorreta
ALTER TABLE historico_respostas_passo 
DROP CONSTRAINT IF EXISTS historico_respostas_passo_discipulador_id_fkey;

-- Adicionar a constraint correta apontando para profiles
ALTER TABLE historico_respostas_passo 
ADD CONSTRAINT historico_respostas_passo_discipulador_id_fkey 
FOREIGN KEY (discipulador_id) 
REFERENCES profiles(id) 
ON DELETE SET NULL;

-- Comentário explicativo:
-- O discipulador_id representa o UUID do perfil do usuário que é o discipulador
-- Não é o ID da tabela discipulos, mas sim o ID do profile/auth.user
