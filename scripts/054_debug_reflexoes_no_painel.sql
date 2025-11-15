-- Verificar por que as reflexões da Viviane não aparecem no painel do Marcus

DECLARE
  viviane_user_id uuid := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
  marcus_user_id uuid := 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
  viviane_discipulo_id uuid;
  marcus_discipulo_id uuid;
  count_reflexoes int;
BEGIN
  RAISE NOTICE '=== DEBUG COMPLETO DO PAINEL DO DISCIPULADOR ===';
  
  -- 1. Buscar o discipulo_id da Viviane
  SELECT id INTO viviane_discipulo_id
  FROM public.discipulos
  WHERE user_id = viviane_user_id;
  
  RAISE NOTICE '1. Viviane discipulo_id: %', viviane_discipulo_id;
  
  -- 2. Buscar o discipulo_id do Marcus
  SELECT id INTO marcus_discipulo_id
  FROM public.discipulos
  WHERE user_id = marcus_user_id;
  
  RAISE NOTICE '2. Marcus discipulo_id: %', marcus_discipulo_id;
  
  -- 3. Verificar se a Viviane tem o Marcus como discipulador
  RAISE NOTICE '3. Verificando relação discipulador...';
  SELECT discipulador_id, aprovado_discipulador
  FROM public.discipulos
  WHERE id = viviane_discipulo_id;
  
  -- 4. Buscar TODOS os discípulos do Marcus (a query do painel)
  RAISE NOTICE '4. Buscando discípulos do Marcus (query do painel)...';
  
  -- 5. Contar reflexões da Viviane
  SELECT COUNT(*) INTO count_reflexoes
  FROM public.reflexoes_conteudo
  WHERE discipulo_id = viviane_discipulo_id;
  
  RAISE NOTICE '5. Total de reflexões da Viviane: %', count_reflexoes;
  
  -- 6. Verificar se a query do painel encontraria as reflexões
  RAISE NOTICE '6. Testando a query exata do painel...';
  SELECT COUNT(*) INTO count_reflexoes
  FROM public.reflexoes_conteudo
  WHERE discipulo_id IN (
    SELECT id FROM public.discipulos 
    WHERE discipulador_id = marcus_user_id 
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
WHERE discipulador_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';

-- Reflexões da Viviane
SELECT 
  'REFLEXOES DA VIVIANE' as tipo,
  id,
  discipulo_id,
  fase_numero,
  passo_numero,
  tipo as tipo_conteudo,
  reflexao
FROM public.reflexoes_conteudo
WHERE discipulo_id = (
  SELECT id FROM public.discipulos 
  WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
);

-- Resultado da query exata do painel
SELECT 
  'QUERY DO PAINEL' as tipo,
  rc.id,
  rc.discipulo_id,
  rc.fase_numero,
  rc.passo_numero,
  rc.tipo,
  rc.reflexao,
  d.nome_completo_temp
FROM public.reflexoes_conteudo rc
LEFT JOIN public.discipulos d ON d.id = rc.discipulo_id
WHERE rc.discipulo_id IN (
  SELECT id FROM public.discipulos 
  WHERE discipulador_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a' 
  AND aprovado_discipulador = true
);
