-- Tabela para rastrear leitura individual de capítulos
CREATE TABLE IF NOT EXISTS public.leituras_capitulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES discipulos(id) ON DELETE CASCADE,
  livro TEXT NOT NULL,
  capitulo INTEGER NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  tempo_leitura_segundos INTEGER DEFAULT 0,
  rolou_ate_fim BOOLEAN DEFAULT FALSE,
  data_leitura TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discipulo_id, livro, capitulo)
);

-- Tabela para highlights/marcações de texto
CREATE TABLE IF NOT EXISTS public.highlights_biblia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES discipulos(id) ON DELETE CASCADE,
  livro TEXT NOT NULL,
  capitulo INTEGER NOT NULL,
  texto_selecionado TEXT NOT NULL,
  cor TEXT NOT NULL, -- yellow, green, blue, pink, purple
  posicao_inicio INTEGER NOT NULL,
  posicao_fim INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leituras_capitulos_discipulo ON leituras_capitulos(discipulo_id);
CREATE INDEX IF NOT EXISTS idx_highlights_discipulo_livro_cap ON highlights_biblia(discipulo_id, livro, capitulo);

-- RLS Policies para leituras_capitulos
ALTER TABLE public.leituras_capitulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discípulos podem ver suas próprias leituras"
  ON leituras_capitulos FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM discipulos WHERE id = leituras_capitulos.discipulo_id));

CREATE POLICY "Discípulos podem inserir suas próprias leituras"
  ON leituras_capitulos FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM discipulos WHERE id = leituras_capitulos.discipulo_id));

CREATE POLICY "Discípulos podem atualizar suas próprias leituras"
  ON leituras_capitulos FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM discipulos WHERE id = leituras_capitulos.discipulo_id));

-- RLS Policies para highlights_biblia
ALTER TABLE public.highlights_biblia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discípulos podem ver seus próprios highlights"
  ON highlights_biblia FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM discipulos WHERE id = highlights_biblia.discipulo_id));

CREATE POLICY "Discípulos podem criar seus próprios highlights"
  ON highlights_biblia FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM discipulos WHERE id = highlights_biblia.discipulo_id));

CREATE POLICY "Discípulos podem deletar seus próprios highlights"
  ON highlights_biblia FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM discipulos WHERE id = highlights_biblia.discipulo_id));
