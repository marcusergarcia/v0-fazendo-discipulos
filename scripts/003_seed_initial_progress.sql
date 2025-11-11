-- Script para criar progresso inicial para novos usuários
-- Este script cria automaticamente os 10 passos da Fase 1 quando um discípulo é criado

CREATE OR REPLACE FUNCTION public.criar_progresso_inicial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar 10 passos iniciais para a Fase 1
  INSERT INTO public.progresso_fases (discipulo_id, fase_numero, passo_numero)
  SELECT NEW.id, 1, passo
  FROM generate_series(1, 10) AS passo
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_progresso_inicial ON public.discipulos;

CREATE TRIGGER trigger_progresso_inicial
  AFTER INSERT ON public.discipulos
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_progresso_inicial();
