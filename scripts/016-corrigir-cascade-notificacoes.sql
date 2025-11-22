-- Script para corrigir o problema de CASCADE DELETE entre notificacoes e reflexoes_conteudo
-- Quando deletamos uma notificação, NÃO queremos deletar a reflexão junto!

-- 1. Remover constraint CASCADE em reflexoes_conteudo.notificacao_id
DO $$ 
BEGIN
    -- Encontrar e remover a constraint existente
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%reflexoes_conteudo_notificacao_id%'
        AND table_name = 'reflexoes_conteudo'
    ) THEN
        ALTER TABLE reflexoes_conteudo 
        DROP CONSTRAINT IF EXISTS reflexoes_conteudo_notificacao_id_fkey CASCADE;
        
        RAISE NOTICE 'Constraint CASCADE removida de reflexoes_conteudo.notificacao_id';
    END IF;
END $$;

-- 2. Recriar constraint com SET NULL ao invés de CASCADE
ALTER TABLE reflexoes_conteudo
ADD CONSTRAINT reflexoes_conteudo_notificacao_id_fkey 
FOREIGN KEY (notificacao_id) 
REFERENCES notificacoes(id) 
ON DELETE SET NULL;

-- 3. Remover constraint CASCADE em historico_respostas_passo.notificacao_id (se houver)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%historico_respostas_passo_notificacao_id%'
        AND table_name = 'historico_respostas_passo'
    ) THEN
        ALTER TABLE historico_respostas_passo 
        DROP CONSTRAINT IF EXISTS historico_respostas_passo_notificacao_id_fkey CASCADE;
        
        RAISE NOTICE 'Constraint CASCADE removida de historico_respostas_passo.notificacao_id';
    END IF;
END $$;

-- 4. Recriar constraint com SET NULL
ALTER TABLE historico_respostas_passo
ADD CONSTRAINT historico_respostas_passo_notificacao_id_fkey 
FOREIGN KEY (notificacao_id) 
REFERENCES notificacoes(id) 
ON DELETE SET NULL;

-- 5. Remover constraint CASCADE em notificacoes.reflexao_id (se houver)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name LIKE '%notificacoes_reflexao_id%'
        AND table_name = 'notificacoes'
    ) THEN
        ALTER TABLE notificacoes 
        DROP CONSTRAINT IF EXISTS notificacoes_reflexao_id_fkey CASCADE;
        
        RAISE NOTICE 'Constraint CASCADE removida de notificacoes.reflexao_id';
    END IF;
END $$;

-- 6. Recriar constraint com SET NULL
ALTER TABLE notificacoes
ADD CONSTRAINT notificacoes_reflexao_id_fkey 
FOREIGN KEY (reflexao_id) 
REFERENCES reflexoes_conteudo(id) 
ON DELETE SET NULL;

COMMENT ON CONSTRAINT reflexoes_conteudo_notificacao_id_fkey ON reflexoes_conteudo IS 
'Relacionamento com notificações usando SET NULL - quando notificação é deletada, apenas limpa o campo sem deletar a reflexão';

COMMENT ON CONSTRAINT notificacoes_reflexao_id_fkey ON notificacoes IS 
'Relacionamento com reflexões usando SET NULL - quando reflexão é deletada, apenas limpa o campo sem deletar a notificação';
