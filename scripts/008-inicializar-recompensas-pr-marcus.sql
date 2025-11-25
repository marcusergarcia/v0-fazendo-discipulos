-- Inicializar recompensas para Pr. Marcus com as insígnias dos passos já concluídos
INSERT INTO recompensas (
    discipulo_id,
    insignias,
    medalhas,
    armaduras,
    nivel
)
VALUES (
    'd4d131f7-de70-48e6-943b-840f6fe7c51d',
    '["Passo 1 Concluído", "Passo 2 Concluído"]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    1
)
ON CONFLICT (discipulo_id)
DO UPDATE SET
    insignias = EXCLUDED.insignias,
    medalhas = EXCLUDED.medalhas,
    armaduras = EXCLUDED.armaduras,
    nivel = EXCLUDED.nivel;
