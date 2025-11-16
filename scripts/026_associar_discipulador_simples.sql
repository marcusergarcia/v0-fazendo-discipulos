-- Script simples para associar você ao discipulador "12 Apóstolos" que já existe

DO $$
DECLARE
    v_apostolos_user_id UUID;
    v_marcus_user_id UUID;
BEGIN
    -- Buscar o user_id do Marcus
    SELECT id INTO v_marcus_user_id
    FROM auth.users
    WHERE email = 'marcus.macintel@terra.com.br'
    LIMIT 1;

    -- Buscar o user_id do 12 Apóstolos (qualquer um dos emails)
    SELECT id INTO v_apostolos_user_id
    FROM auth.users
    WHERE email LIKE '12apostolos%'
    LIMIT 1;

    RAISE NOTICE 'Marcus user_id: %', v_marcus_user_id;
    RAISE NOTICE '12 Apóstolos user_id: %', v_apostolos_user_id;

    -- Se ambos existem, atualizar o discipulador_id na tabela discipulos
    IF v_marcus_user_id IS NOT NULL AND v_apostolos_user_id IS NOT NULL THEN
        UPDATE discipulos
        SET discipulador_id = v_apostolos_user_id
        WHERE user_id = v_marcus_user_id;
        
        RAISE NOTICE 'Discipulador associado com sucesso!';
        
        -- Verificar se o perfil do 12 Apóstolos existe
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_apostolos_user_id) THEN
            -- Criar perfil básico para 12 Apóstolos
            INSERT INTO profiles (id, email, nome_completo, status)
            VALUES (
                v_apostolos_user_id,
                (SELECT email FROM auth.users WHERE id = v_apostolos_user_id),
                '12 Apóstolos',
                'ativo'
            );
            RAISE NOTICE 'Perfil do 12 Apóstolos criado!';
        END IF;
        
        -- Atualizar o nível do 12 Apóstolos para Multiplicador
        UPDATE discipulos
        SET 
            nivel_atual = 'Multiplicador',
            xp_total = 10000
        WHERE user_id = v_apostolos_user_id;
        
        RAISE NOTICE 'Nível do 12 Apóstolos atualizado para Multiplicador com 10000 XP!';
    ELSE
        RAISE NOTICE 'Usuários não encontrados!';
    END IF;
END $$;
