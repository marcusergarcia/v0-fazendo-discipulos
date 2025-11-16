-- Corrigir estrutura da tabela progresso_fases para garantir todos os campos necessários

-- Remover duplicata de videos_assistidos e artigos_lidos se existirem
-- Primeiro, vamos garantir que temos os campos certos

-- Verificar e adicionar campo data_inicio se não existir
ALTER TABLE public.progresso_fases 
ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMPTZ DEFAULT NOW();

-- Garantir que videos_assistidos e artigos_lidos são TEXT[] (não JSONB)
-- Primeiro, verificamos qual tipo está e convertemos se necessário
DO $$
BEGIN
  -- Verificar se videos_assistidos existe como JSONB e converter para TEXT[]
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progresso_fases' 
    AND column_name = 'videos_assistidos' 
    AND data_type = 'jsonb'
  ) THEN
    -- Converter JSONB para TEXT[]
    ALTER TABLE public.progresso_fases 
    ALTER COLUMN videos_assistidos TYPE TEXT[] 
    USING (
      CASE 
        WHEN videos_assistidos IS NULL THEN '{}'::TEXT[]
        ELSE ARRAY(SELECT jsonb_array_elements_text(videos_assistidos))
      END
    );
  END IF;

  -- Verificar se artigos_lidos existe como JSONB e converter para TEXT[]
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progresso_fases' 
    AND column_name = 'artigos_lidos' 
    AND data_type = 'jsonb'
  ) THEN
    -- Converter JSONB para TEXT[]
    ALTER TABLE public.progresso_fases 
    ALTER COLUMN artigos_lidos TYPE TEXT[] 
    USING (
      CASE 
        WHEN artigos_lidos IS NULL THEN '{}'::TEXT[]
        ELSE ARRAY(SELECT jsonb_array_elements_text(artigos_lidos))
      END
    );
  END IF;
END $$;

-- Garantir valores padrão corretos
UPDATE public.progresso_fases 
SET videos_assistidos = '{}'::TEXT[] 
WHERE videos_assistidos IS NULL;

UPDATE public.progresso_fases 
SET artigos_lidos = '{}'::TEXT[] 
WHERE artigos_lidos IS NULL;

-- Garantir que completado tem valor padrão
UPDATE public.progresso_fases 
SET completado = FALSE 
WHERE completado IS NULL;

-- Garantir que enviado_para_validacao tem valor padrão
UPDATE public.progresso_fases 
SET enviado_para_validacao = FALSE 
WHERE enviado_para_validacao IS NULL;

-- Comentários explicativos
COMMENT ON COLUMN public.progresso_fases.videos_assistidos IS 'Array TEXT de IDs de vídeos que o discípulo assistiu';
COMMENT ON COLUMN public.progresso_fases.artigos_lidos IS 'Array TEXT de IDs de artigos que o discípulo leu';
COMMENT ON COLUMN public.progresso_fases.data_inicio IS 'Data de início deste passo pelo discípulo';

-- Verificar estrutura final
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'progresso_fases'
ORDER BY ordinal_position;
