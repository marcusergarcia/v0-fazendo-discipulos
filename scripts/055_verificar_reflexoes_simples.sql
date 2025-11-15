-- Verificação SIMPLES: Mostrar TODAS as reflexões da Viviane

-- User ID da Viviane
DO $$
DECLARE
  viviane_user_id uuid := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
BEGIN
  RAISE NOTICE '=== VERIFICAÇÃO SIMPLES ===';
END $$;

-- 1. Mostrar o discipulo_id da Viviane
SELECT 
  'VIVIANE DISCIPULO' as tipo,
  id as discipulo_id,
  user_id,
  discipulador_id,
  aprovado_discipulador,
  nome_completo_temp
FROM public.discipulos
WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';

-- 2. Mostrar TODAS as reflexões da Viviane
SELECT 
  'REFLEXOES DA VIVIANE' as tipo,
  r.*
FROM public.reflexoes_conteudo r
JOIN public.discipulos d ON d.id = r.discipulo_id
WHERE d.user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';

-- 3. Testar a query EXATA que o painel usa
SELECT 
  'QUERY DO PAINEL' as tipo,
  r.*
FROM public.reflexoes_conteudo r
WHERE r.discipulo_id IN (
  SELECT id FROM public.discipulos 
  WHERE discipulador_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a'
  AND aprovado_discipulador = true
);
