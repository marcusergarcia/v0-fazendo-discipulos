-- Adicionar campos para tracking de recursos educacionais
ALTER TABLE public.progresso_fases 
ADD COLUMN IF NOT EXISTS videos_assistidos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS artigos_lidos JSONB DEFAULT '[]'::jsonb;

-- Comentários explicativos
COMMENT ON COLUMN public.progresso_fases.videos_assistidos IS 'Array de IDs de vídeos que o discípulo assistiu';
COMMENT ON COLUMN public.progresso_fases.artigos_lidos IS 'Array de IDs de artigos que o discípulo leu';
