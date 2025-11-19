-- Tabela para armazenar highlights (marcações coloridas) nos textos bíblicos
CREATE TABLE IF NOT EXISTS public.highlights_biblia (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  livro_id INTEGER NOT NULL,
  numero_capitulo INTEGER NOT NULL,
  texto_selecionado TEXT NOT NULL,
  posicao_inicio INTEGER NOT NULL,
  posicao_fim INTEGER NOT NULL,
  cor VARCHAR(20) NOT NULL DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_highlights_profile ON public.highlights_biblia(profile_id);
CREATE INDEX IF NOT EXISTS idx_highlights_capitulo ON public.highlights_biblia(livro_id, numero_capitulo);

-- RLS (Row Level Security)
ALTER TABLE public.highlights_biblia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios highlights"
  ON public.highlights_biblia FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Usuários podem criar seus próprios highlights"
  ON public.highlights_biblia FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Usuários podem atualizar seus próprios highlights"
  ON public.highlights_biblia FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Usuários podem deletar seus próprios highlights"
  ON public.highlights_biblia FOR DELETE
  USING (auth.uid() = profile_id);
