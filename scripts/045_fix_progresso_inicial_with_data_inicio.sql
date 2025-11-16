-- Atualizar o trigger para criar progresso inicial COM data_inicio
-- Isso garante que os 10 passos criados automaticamente já tenham data_inicio preenchida

CREATE OR REPLACE FUNCTION public.criar_progresso_inicial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar 10 passos iniciais para a Fase 1 COM data_inicio
  INSERT INTO public.progresso_fases (discipulo_id, fase_numero, passo_numero, data_inicio)
  SELECT NEW.id, 1, passo, NOW()
  FROM generate_series(1, 10) AS passo
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Atualizar registros existentes sem data_inicio
UPDATE public.progresso_fases
SET data_inicio = created_at
WHERE data_inicio IS NULL;
