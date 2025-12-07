-- Corrigir trigger de progresso inicial para usar APENAS campos que existem
-- DROPANDO e RECRIANDO com os nomes de campos corretos

DROP TRIGGER IF EXISTS trigger_progresso_inicial ON public.discipulos;
DROP FUNCTION IF EXISTS public.criar_progresso_inicial();

-- Criar função com campos corretos da tabela progresso_fases
CREATE OR REPLACE FUNCTION public.criar_progresso_inicial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar registro único de progresso inicial para a Fase 1, Passo 1
  INSERT INTO public.progresso_fases (
    discipulo_id, 
    fase_atual, 
    passo_atual,
    pontuacao_passo_atual,
    videos_assistidos,
    artigos_lidos,
    reflexoes_concluidas,
    enviado_para_validacao,
    dias_no_passo,
    alertado_tempo_excessivo,
    data_inicio_passo
  )
  VALUES (
    NEW.id, 
    1,  -- fase_atual
    1,  -- passo_atual
    0,  -- pontuacao_passo_atual
    ARRAY[]::text[],  -- videos_assistidos vazio
    ARRAY[]::text[],  -- artigos_lidos vazio
    0,  -- reflexoes_concluidas
    false,  -- enviado_para_validacao
    0,  -- dias_no_passo
    false,  -- alertado_tempo_excessivo
    NOW()  -- data_inicio_passo
  )
  ON CONFLICT (discipulo_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER trigger_progresso_inicial
  AFTER INSERT ON public.discipulos
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_progresso_inicial();

-- Verificar se trigger foi criado
SELECT 
  tgname as trigger_name,
  proname as function_name 
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'trigger_progresso_inicial';
