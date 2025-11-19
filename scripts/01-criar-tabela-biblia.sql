-- Criar tabela para armazenar os livros da Bíblia
CREATE TABLE IF NOT EXISTS livros_biblia (
  id SERIAL PRIMARY KEY,
  abreviacao VARCHAR(10) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  testamento VARCHAR(20) NOT NULL CHECK (testamento IN ('Antigo', 'Novo')),
  ordem INTEGER NOT NULL,
  total_capitulos INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para armazenar os capítulos da Bíblia
CREATE TABLE IF NOT EXISTS capitulos_biblia (
  id SERIAL PRIMARY KEY,
  livro_id INTEGER NOT NULL REFERENCES livros_biblia(id) ON DELETE CASCADE,
  numero_capitulo INTEGER NOT NULL,
  texto TEXT NOT NULL, -- Texto completo do capítulo (todos os versículos juntos)
  versao VARCHAR(20) DEFAULT 'ACF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(livro_id, numero_capitulo)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_livros_abreviacao ON livros_biblia(abreviacao);
CREATE INDEX IF NOT EXISTS idx_capitulos_livro ON capitulos_biblia(livro_id);
CREATE INDEX IF NOT EXISTS idx_capitulos_numero ON capitulos_biblia(numero_capitulo);

-- Habilitar RLS (Row Level Security)
ALTER TABLE livros_biblia ENABLE ROW LEVEL SECURITY;
ALTER TABLE capitulos_biblia ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público para leitura
CREATE POLICY "Permitir leitura pública de livros" ON livros_biblia
  FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de capítulos" ON capitulos_biblia
  FOR SELECT USING (true);

COMMENT ON TABLE livros_biblia IS 'Armazena os livros da Bíblia';
COMMENT ON TABLE capitulos_biblia IS 'Armazena os capítulos da Bíblia com texto completo em ACF (domínio público)';
