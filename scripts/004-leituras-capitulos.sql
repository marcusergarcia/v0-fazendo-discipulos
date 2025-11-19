-- Tabela para rastrear leitura individual de cada capítulo
CREATE TABLE IF NOT EXISTS leituras_capitulos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  livro_id INTEGER NOT NULL,
  numero_capitulo INTEGER NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  tempo_leitura INTEGER DEFAULT 0,
  data_leitura TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, livro_id, numero_capitulo)
);

-- Tabela para highlights de texto
CREATE TABLE IF NOT EXISTS highlights_biblia (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  livro_id INTEGER NOT NULL,
  numero_capitulo INTEGER NOT NULL,
  numero_versiculo INTEGER NOT NULL,
  texto_selecionado TEXT NOT NULL,
  cor VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leituras_capitulos_usuario ON leituras_capitulos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_highlights_usuario ON highlights_biblia(usuario_id);

ALTER TABLE leituras_capitulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights_biblia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas leituras"
  ON leituras_capitulos FOR ALL
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem gerenciar seus highlights"
  ON highlights_biblia FOR ALL
  USING (auth.uid() = usuario_id);
