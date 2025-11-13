-- Script para atualizar o nivel_atual do Marcus para Multiplicador
-- Mantém xp_total intacto (0)

UPDATE discipulos
SET nivel_atual = 'Multiplicador'
WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';

-- Verificar o resultado
SELECT id, nome_completo_temp, nivel_atual, xp_total
FROM discipulos
WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
