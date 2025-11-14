-- Limpar todas as notificações e mensagens da Viviane
-- User ID da Viviane: a0e1c579-92f5-42a8-84cc-faf1bbebd73c

-- Corrigido para usar as colunas corretas do schema real
DO $$
DECLARE
    viviane_user_id uuid := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
    viviane_discipulo_id uuid;
    viviane_discipulador_id uuid;
BEGIN
    -- Pegar o discipulo.id e discipulador_id da Viviane
    SELECT id, discipulador_id 
    INTO viviane_discipulo_id, viviane_discipulador_id
    FROM public.discipulos
    WHERE user_id = viviane_user_id;

    -- Deletar mensagens do chat da Viviane (usa discipulo_id, não destinatario_id)
    DELETE FROM public.mensagens
    WHERE discipulo_id = viviane_discipulo_id;
    
    RAISE NOTICE 'Mensagens deletadas do chat da Viviane';

    -- Deletar notificações no discipulador (usa user_id, não usuario_id)
    DELETE FROM public.notificacoes
    WHERE user_id = viviane_discipulador_id
      AND tipo IN ('reflexao', 'missao');
    
    RAISE NOTICE 'Notificações deletadas do discipulador';

    -- Deletar reflexões de conteúdo da Viviane
    DELETE FROM public.reflexoes_conteudo
    WHERE discipulo_id = viviane_discipulo_id;

    RAISE NOTICE 'Reflexões deletadas da Viviane';

    -- Verificar notificações restantes
    RAISE NOTICE 'Notificações restantes no discipulador: %', (
        SELECT COUNT(*) 
        FROM public.notificacoes 
        WHERE user_id = viviane_discipulador_id
    );
END $$;

-- Verificar o resultado final
SELECT 
    'Notificações no discipulador' as tipo,
    COUNT(*) as quantidade
FROM public.notificacoes
WHERE user_id = (
    SELECT discipulador_id 
    FROM public.discipulos 
    WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
)
UNION ALL
SELECT 
    'Mensagens da Viviane' as tipo,
    COUNT(*) as quantidade
FROM public.mensagens
WHERE discipulo_id = (
    SELECT id
    FROM public.discipulos
    WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
)
UNION ALL
SELECT 
    'Reflexões da Viviane' as tipo,
    COUNT(*) as quantidade
FROM public.reflexoes_conteudo
WHERE discipulo_id = (
    SELECT id
    FROM public.discipulos
    WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
);
