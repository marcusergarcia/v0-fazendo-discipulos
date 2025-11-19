-- Script completo para configurar a estrutura da Bíblia no Supabase
-- Execute este script uma única vez - ele cria tabelas, livros E capítulos vazios

-- ==================================================
-- PARTE 1: CRIAR TABELAS
-- ==================================================

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
  texto TEXT DEFAULT '', -- Texto completo do capítulo (todos os versículos juntos)
  versao VARCHAR(20) DEFAULT 'ACF',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(livro_id, numero_capitulo, versao)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_livros_abreviacao ON livros_biblia(abreviacao);
CREATE INDEX IF NOT EXISTS idx_capitulos_livro ON capitulos_biblia(livro_id);
CREATE INDEX IF NOT EXISTS idx_capitulos_numero ON capitulos_biblia(numero_capitulo);

-- Habilitar RLS (Row Level Security)
ALTER TABLE livros_biblia ENABLE ROW LEVEL SECURITY;
ALTER TABLE capitulos_biblia ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público para leitura
DROP POLICY IF EXISTS "Permitir leitura pública de livros" ON livros_biblia;
CREATE POLICY "Permitir leitura pública de livros" ON livros_biblia
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura pública de capítulos" ON capitulos_biblia;
CREATE POLICY "Permitir leitura pública de capítulos" ON capitulos_biblia
  FOR SELECT USING (true);

-- ==================================================
-- PARTE 2: POPULAR LIVROS DA BÍBLIA
-- ==================================================

-- Popular tabela de livros da Bíblia (Antigo Testamento)
INSERT INTO livros_biblia (abreviacao, nome, testamento, ordem, total_capitulos) VALUES
('gn', 'Gênesis', 'Antigo', 1, 50),
('ex', 'Êxodo', 'Antigo', 2, 40),
('lv', 'Levítico', 'Antigo', 3, 27),
('nm', 'Números', 'Antigo', 4, 36),
('dt', 'Deuteronômio', 'Antigo', 5, 34),
('js', 'Josué', 'Antigo', 6, 24),
('jz', 'Juízes', 'Antigo', 7, 21),
('rt', 'Rute', 'Antigo', 8, 4),
('1sm', '1 Samuel', 'Antigo', 9, 31),
('2sm', '2 Samuel', 'Antigo', 10, 24),
('1rs', '1 Reis', 'Antigo', 11, 22),
('2rs', '2 Reis', 'Antigo', 12, 25),
('1cr', '1 Crônicas', 'Antigo', 13, 29),
('2cr', '2 Crônicas', 'Antigo', 14, 36),
('ed', 'Esdras', 'Antigo', 15, 10),
('ne', 'Neemias', 'Antigo', 16, 13),
('et', 'Ester', 'Antigo', 17, 10),
('jó', 'Jó', 'Antigo', 18, 42),
('sl', 'Salmos', 'Antigo', 19, 150),
('pv', 'Provérbios', 'Antigo', 20, 31),
('ec', 'Eclesiastes', 'Antigo', 21, 12),
('ct', 'Cântico dos Cânticos', 'Antigo', 22, 8),
('is', 'Isaías', 'Antigo', 23, 66),
('jr', 'Jeremias', 'Antigo', 24, 52),
('lm', 'Lamentações', 'Antigo', 25, 5),
('ez', 'Ezequiel', 'Antigo', 26, 48),
('dn', 'Daniel', 'Antigo', 27, 12),
('os', 'Oséias', 'Antigo', 28, 14),
('jl', 'Joel', 'Antigo', 29, 3),
('am', 'Amós', 'Antigo', 30, 9),
('ob', 'Obadias', 'Antigo', 31, 1),
('jn', 'Jonas', 'Antigo', 32, 4),
('mq', 'Miquéias', 'Antigo', 33, 7),
('na', 'Naum', 'Antigo', 34, 3),
('hc', 'Habacuque', 'Antigo', 35, 3),
('sf', 'Sofonias', 'Antigo', 36, 3),
('ag', 'Ageu', 'Antigo', 37, 2),
('zc', 'Zacarias', 'Antigo', 38, 14),
('ml', 'Malaquias', 'Antigo', 39, 4),
-- Novo Testamento
('mt', 'Mateus', 'Novo', 40, 28),
('mc', 'Marcos', 'Novo', 41, 16),
('lc', 'Lucas', 'Novo', 42, 24),
('jo', 'João', 'Novo', 43, 21),
('at', 'Atos', 'Novo', 44, 28),
('rm', 'Romanos', 'Novo', 45, 16),
('1co', '1 Coríntios', 'Novo', 46, 16),
('2co', '2 Coríntios', 'Novo', 47, 13),
('gl', 'Gálatas', 'Novo', 48, 6),
('ef', 'Efésios', 'Novo', 49, 6),
('fp', 'Filipenses', 'Novo', 50, 4),
('cl', 'Colossenses', 'Novo', 51, 4),
('1ts', '1 Tessalonicenses', 'Novo', 52, 5),
('2ts', '2 Tessalonicenses', 'Novo', 53, 3),
('1tm', '1 Timóteo', 'Novo', 54, 6),
('2tm', '2 Timóteo', 'Novo', 55, 4),
('tt', 'Tito', 'Novo', 56, 3),
('fm', 'Filemom', 'Novo', 57, 1),
('hb', 'Hebreus', 'Novo', 58, 13),
('tg', 'Tiago', 'Novo', 59, 5),
('1pe', '1 Pedro', 'Novo', 60, 5),
('2pe', '2 Pedro', 'Novo', 61, 3),
('1jo', '1 João', 'Novo', 62, 5),
('2jo', '2 João', 'Novo', 63, 1),
('3jo', '3 João', 'Novo', 64, 1),
('jd', 'Judas', 'Novo', 65, 1),
('ap', 'Apocalipse', 'Novo', 66, 22)
ON CONFLICT (abreviacao) DO NOTHING;

-- ==================================================
-- PARTE 3: GERAR 1.189 CAPÍTULOS VAZIOS
-- ==================================================

DO $$
DECLARE
  livro RECORD;
  cap INTEGER;
  total_gerados INTEGER := 0;
BEGIN
  -- Iterar sobre cada livro
  FOR livro IN SELECT id, nome, total_capitulos FROM livros_biblia ORDER BY ordem
  LOOP
    -- Gerar capítulos de 1 até total_capitulos
    FOR cap IN 1..livro.total_capitulos
    LOOP
      INSERT INTO capitulos_biblia (livro_id, numero_capitulo, texto, versao)
      VALUES (livro.id, cap, '', 'ACF')
      ON CONFLICT (livro_id, numero_capitulo, versao) DO NOTHING;
      total_gerados := total_gerados + 1;
    END LOOP;
    
    RAISE NOTICE 'Gerados % capítulos para %', livro.total_capitulos, livro.nome;
  END LOOP;
  
  RAISE NOTICE 'Total de capítulos gerados: %', total_gerados;
END $$;

-- ==================================================
-- RESULTADO E VERIFICAÇÃO
-- ==================================================

-- Verificar se tudo foi criado corretamente
SELECT 'Setup completo!' as status;

SELECT 
  COUNT(*) as total_livros,
  SUM(total_capitulos) as total_capitulos_esperado
FROM livros_biblia;

SELECT 
  COUNT(*) as total_capitulos_gerados,
  COUNT(CASE WHEN texto = '' THEN 1 END) as capitulos_vazios,
  COUNT(CASE WHEN texto != '' THEN 1 END) as capitulos_preenchidos
FROM capitulos_biblia;

-- Mostrar os primeiros 10 capítulos gerados
SELECT 
  l.nome as livro,
  c.numero_capitulo,
  CASE 
    WHEN c.texto = '' THEN '(vazio - aguardando preenchimento)'
    ELSE SUBSTRING(c.texto, 1, 50) || '...'
  END as texto_preview
FROM capitulos_biblia c
JOIN livros_biblia l ON c.livro_id = l.id
ORDER BY l.ordem, c.numero_capitulo
LIMIT 10;

COMMENT ON TABLE livros_biblia IS 'Armazena os 66 livros da Bíblia';
COMMENT ON TABLE capitulos_biblia IS 'Armazena os 1.189 capítulos da Bíblia com texto completo em ACF (domínio público)';
