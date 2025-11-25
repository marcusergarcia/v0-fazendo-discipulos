-- Corrigir o progresso do Pr. Marcus
-- Criar o passo 2 que está faltando e inserir as recompensas que não foram criadas

-- 1. Criar o passo 2 se não existir
INSERT INTO progresso_fases (
  discipulo_id,
  fase_numero,
  passo_numero,
  pontuacao_total,
  reflexoes_concluidas,
  videos_assistidos,
  artigos_lidos,
  completado,
  enviado_para_validacao
)
SELECT 
  'd4d131f7-de70-48e6-943b-840f6fe7c51d',
  1,
  2,
  0,
  0,
  ARRAY[]::text[],
  ARRAY[]::text[],
  false,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM progresso_fases 
  WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND fase_numero = 1 
  AND passo_numero = 2
);

-- 2. Inserir recompensa do passo 1 se não existir
INSERT INTO recompensas (
  discipulo_id,
  tipo_recompensa,
  nome_recompensa,
  descricao,
  conquistado_em
)
SELECT 
  'd4d131f7-de70-48e6-943b-840f6fe7c51d',
  'insignia',
  'Passo 1 Concluído',
  'Você completou o passo 1 e ganhou 505 XP!',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM recompensas
  WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND nome_recompensa = 'Passo 1 Concluído'
);

-- 3. Verificar o estado final
SELECT 
  'Progresso Passos' as tabela,
  fase_numero,
  passo_numero,
  completado,
  pontuacao_total
FROM progresso_fases 
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
ORDER BY fase_numero, passo_numero;

SELECT 
  'Recompensas' as tabela,
  tipo_recompensa,
  nome_recompensa,
  conquistado_em
FROM recompensas
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
ORDER BY conquistado_em;

SELECT 
  'Discípulo' as tabela,
  fase_atual,
  passo_atual,
  xp_total
FROM discipulos
WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
