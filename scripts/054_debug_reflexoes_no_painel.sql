-- Verificar por que as reflexões da Viviane não aparecem no painel do Marcus

DO $$
DECLARE
  viviane_user_id text := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
  marcus_user_id text := 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
  viviane_discipulo_id text;
  marcus_discipulo_id text;
  count_reflexoes int;
BEGIN
  RAISE NOTICE '=== DEBUG COMPLETO DO PAINEL DO DISCIPULADOR ===';
  
  -- 1. Buscar o discipulo_id da Viviane
  SELECT id::text INTO viviane_discipulo_id
  FROM public.discipulos
  WHERE user_id::text = viviane_user_id;
  
  RAISE NOTICE '1. Viviane discipulo_id: %', viviane_discipulo_id;
  
  -- 2. Buscar o discipulo_id do Marcus
  SELECT id::text INTO marcus_discipulo_id
  FROM public.discipulos
  WHERE user_id::text = marcus_user_id;
  
  RAISE NOTICE '2. Marcus discipulo_id: %', marcus_discipulo_id;
  
  -- 3. Verificar se a Viviane tem o Marcus como discipulador
  RAISE NOTICE '3. Viviane tem Marcus como discipulador? Aprovada? Buscando...';
  
  -- 4. Contar reflexões da Viviane
  SELECT COUNT(*) INTO count_reflexoes
  FROM public.reflexoes_conteudo
  WHERE discipulo_id::text = viviane_discipulo_id;
  
  RAISE NOTICE '4. Total de reflexões da Viviane: %', count_reflexoes;
  
  -- 5. Verificar se a query do painel encontraria as reflexões
  RAISE NOTICE '5. Testando a query exata do painel...';
  SELECT COUNT(*) INTO count_reflexoes
  FROM public.reflexoes_conteudo
  WHERE discipulo_id IN (
    SELECT id FROM public.discipulos 
    WHERE discipulador_id::text = marcus_user_id 
    AND aprovado_discipulador = true
  );
  
  RAISE NOTICE '6. Reflexões encontradas pela query do painel: %', count_reflexoes;
  
END $$;

-- Retornar os dados para análise

-- Discípulos do Marcus
SELECT 
  'DISCIPULOS DO MARCUS' as tipo,
  id,
  user_id,
  nome_completo_temp,
  discipulador_id,
  aprovado_discipulador
FROM public.discipulos
WHERE discipulador_id::text = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';

-- Reflexões da Viviane
SELECT 
  'REFLEXOES DA VIVIANE' as tipo,
  id,
  discipulo_id,
  fase_numero,
  passo_numero,
  tipo as tipo_conteudo,
  LEFT(reflexao, 100) as reflexao_preview
FROM public.reflexoes_conteudo
WHERE discipulo_id = (
  SELECT id FROM public.discipulos 
  WHERE user_id::text = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
);

-- Resultado da query exata do painel
SELECT 
  'QUERY DO PAINEL' as tipo,
  rc.id,
  rc.discipulo_id,
  rc.fase_numero,
  rc.passo_numero,
  rc.tipo,
  LEFT(rc.reflexao, 100) as reflexao_preview,
  d.nome_completo_temp
FROM public.reflexoes_conteudo rc
LEFT JOIN public.discipulos d ON d.id = rc.discipulo_id
WHERE rc.discipulo_id IN (
  SELECT id FROM public.discipulos 
  WHERE discipulador_id::text = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a' 
  AND aprovado_discipulador = true
);
