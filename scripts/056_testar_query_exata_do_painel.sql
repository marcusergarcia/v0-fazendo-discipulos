-- Testar a query EXATA que o painel do discipulador usa

DO $$
DECLARE
  marcus_user_id uuid := 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
  viviane_discipulo_id uuid := 'd2acba9a-1fb6-4d4a-aca1-98331581f4e5';
BEGIN
  RAISE NOTICE '===== TESTE DA QUERY EXATA DO PAINEL =====';
  
  -- Passo 1: Buscar discípulos onde Marcus é discipulador
  RAISE NOTICE '1. Buscando discípulos WHERE discipulador_id = %', marcus_user_id;
  
  -- Passo 2: Filtrar os aprovados
  RAISE NOTICE '2. Filtrando apenas os aprovados';
  
  -- Passo 3: Buscar reflexões usando os IDs dos discípulos aprovados
  RAISE NOTICE '3. Buscando reflexões WHERE discipulo_id IN (array de IDs aprovados)';
  
END $$;

-- Executar a query EXATA
SELECT 
  'DISCIPULOS DO MARCUS' as tipo,
  id,
  user_id,
  discipulador_id,
  aprovado_discipulador,
  nome_completo_temp
FROM public.discipulos
WHERE discipulador_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';

-- Buscar reflexões dos discípulos aprovados
SELECT 
  'REFLEXOES DOS APROVADOS' as tipo,
  id,
  discipulo_id,
  fase_numero,
  passo_numero,
  LEFT(reflexao, 50) as reflexao_preview
FROM public.reflexoes_conteudo
WHERE discipulo_id IN (
  SELECT id 
  FROM public.discipulos 
  WHERE discipulador_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a'
    AND aprovado_discipulador = true
);

-- Verificar se há algum problema de tipo de dados
SELECT 
  'TIPOS DE DADOS' as tipo,
  pg_typeof(id) as tipo_id_reflexao,
  pg_typeof(discipulo_id) as tipo_discipulo_id
FROM public.reflexoes_conteudo
LIMIT 1;
