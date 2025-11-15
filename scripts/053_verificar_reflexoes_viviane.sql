-- Verificar se há reflexões da Viviane e se o discipulador está correto
-- User ID da Viviane: a0e1c579-92f5-42a8-84cc-faf1bbebd73c

DO $$
DECLARE
  viviane_user_id uuid := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
  viviane_discipulo_id uuid;
  marcus_user_id uuid := 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a';
  count_reflexoes int;
  count_discipulos_aprovados int;
  count_reflexoes_visiveis int;
  viviane_aprovada boolean;
  viviane_discipulador_id uuid;
BEGIN
  RAISE NOTICE '=== VERIFICAÇÃO COMPLETA ===';
  
  -- 1. Buscar o discipulo_id da Viviane
  SELECT id INTO viviane_discipulo_id
  FROM public.discipulos
  WHERE user_id = viviane_user_id;
  
  RAISE NOTICE '1. Viviane discipulo_id: %', viviane_discipulo_id;
  
  -- 2. Verificar se a Viviane está aprovada pelo discipulador
  SELECT aprovado_discipulador, discipulador_id 
  INTO viviane_aprovada, viviane_discipulador_id
  FROM public.discipulos
  WHERE id = viviane_discipulo_id;
  
  RAISE NOTICE '2. Viviane aprovada: %, Discipulador ID: %', viviane_aprovada, viviane_discipulador_id;
  RAISE NOTICE '2. Marcus user_id: %', marcus_user_id;
  
  -- 3. Contar reflexões da Viviane
  SELECT COUNT(*) INTO count_reflexoes
  FROM public.reflexoes_conteudo
  WHERE discipulo_id = viviane_discipulo_id;
  
  RAISE NOTICE '3. Total de reflexões da Viviane: %', count_reflexoes;
  
  -- 4. Contar discípulos aprovados do Marcus
  SELECT COUNT(*) INTO count_discipulos_aprovados
  FROM public.discipulos
  WHERE discipulador_id = marcus_user_id 
    AND aprovado_discipulador = true;
  
  RAISE NOTICE '4. Total de discípulos aprovados do Marcus: %', count_discipulos_aprovados;
  
  -- 5. Testar a query exata que o painel usa
  SELECT COUNT(*) INTO count_reflexoes_visiveis
  FROM public.reflexoes_conteudo rc
  WHERE rc.discipulo_id IN (
    SELECT id FROM public.discipulos 
    WHERE discipulador_id = marcus_user_id 
      AND aprovado_discipulador = true
  );
  
  RAISE NOTICE '5. Total de reflexões visíveis para o Marcus: %', count_reflexoes_visiveis;
  
  -- Diagnóstico final
  RAISE NOTICE '';
  RAISE NOTICE '=== DIAGNÓSTICO ===';
  IF viviane_discipulador_id != marcus_user_id THEN
    RAISE NOTICE 'PROBLEMA: Viviane tem discipulador_id diferente do Marcus!';
  ELSIF viviane_aprovada = false THEN
    RAISE NOTICE 'PROBLEMA: Viviane não está aprovada!';
  ELSIF count_reflexoes = 0 THEN
    RAISE NOTICE 'PROBLEMA: Viviane não tem reflexões salvas!';
  ELSIF count_reflexoes_visiveis = 0 THEN
    RAISE NOTICE 'PROBLEMA: As reflexões existem mas a query não as encontra!';
  ELSE
    RAISE NOTICE 'SUCESSO: Tudo está correto, as reflexões devem aparecer!';
  END IF;
  
END $$;

-- Mostrar dados brutos para análise
SELECT 
  'VIVIANE DISCIPULO' as tipo,
  id,
  user_id,
  discipulador_id,
  aprovado_discipulador,
  nome_completo_temp
FROM public.discipulos
WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';

SELECT 
  'REFLEXOES VIVIANE' as tipo,
  id,
  discipulo_id,
  fase_numero,
  passo_numero,
  tipo,
  LEFT(reflexao, 50) as reflexao_preview
FROM public.reflexoes_conteudo
WHERE discipulo_id = (SELECT id FROM public.discipulos WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c');
