-- Criar tabela para armazenar o plano de leitura bíblica de 52 semanas
CREATE TABLE IF NOT EXISTS plano_leitura_biblica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semana INTEGER NOT NULL UNIQUE CHECK (semana >= 1 AND semana <= 52),
  tema TEXT NOT NULL,
  livro TEXT NOT NULL,
  capitulo_inicio INTEGER NOT NULL,
  capitulo_fim INTEGER NOT NULL,
  total_capitulos INTEGER NOT NULL,
  descricao TEXT NOT NULL,
  fase TEXT NOT NULL CHECK (fase IN ('Conhecendo Jesus', 'Vida Cristã', 'Doutrina e Maturidade', 'Sabedoria e AT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE plano_leitura_biblica ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler o plano de leitura
CREATE POLICY "Todos podem ler plano de leitura"
  ON plano_leitura_biblica
  FOR SELECT
  TO authenticated
  USING (true);

-- Inserir dados das 52 semanas
INSERT INTO plano_leitura_biblica (semana, tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, descricao, fase) VALUES
-- FASE 1: Conhecendo Jesus (Semanas 1-13)
(1, 'O Verbo que se fez carne', 'João', 1, 4, 4, 'Comece conhecendo Jesus através do Evangelho de João', 'Conhecendo Jesus'),
(2, 'Jesus, o Pão da Vida', 'João', 5, 8, 4, 'Jesus revela quem Ele é', 'Conhecendo Jesus'),
(3, 'O Bom Pastor', 'João', 9, 12, 4, 'Jesus como pastor e amigo', 'Conhecendo Jesus'),
(4, 'O Caminho, a Verdade e a Vida', 'João', 13, 17, 5, 'Os últimos ensinamentos de Jesus', 'Conhecendo Jesus'),
(5, 'Cruz e Ressurreição', 'João', 18, 21, 4, 'O sacrifício e a vitória de Cristo', 'Conhecendo Jesus'),
(6, 'Jesus em ação', 'Marcos', 1, 4, 4, 'O Evangelho mais direto e prático', 'Conhecendo Jesus'),
(7, 'Milagres e poder de Jesus', 'Marcos', 5, 8, 4, 'Jesus manifesta Seu poder', 'Conhecendo Jesus'),
(8, 'O Servo Sofredor', 'Marcos', 9, 12, 4, 'Jesus ensina sobre servir', 'Conhecendo Jesus'),
(9, 'Paixão e Glória', 'Marcos', 13, 16, 4, 'A crucificação e ressurreição', 'Conhecendo Jesus'),
(10, 'Jesus, o Messias prometido', 'Mateus', 1, 7, 7, 'Jesus cumpre as profecias', 'Conhecendo Jesus'),
(11, 'Autoridade e Ensino', 'Mateus', 8, 14, 7, 'Jesus ensina com autoridade', 'Conhecendo Jesus'),
(12, 'O Reino de Deus', 'Mateus', 15, 21, 7, 'Parábolas do Reino', 'Conhecendo Jesus'),
(13, 'A Grande Comissão', 'Mateus', 22, 28, 7, 'Jesus envia seus discípulos', 'Conhecendo Jesus'),

-- FASE 2: Vida Cristã (Semanas 14-26)
(14, 'A compaixão de Jesus', 'Lucas', 1, 6, 6, 'Jesus revela o coração de Deus', 'Vida Cristã'),
(15, 'Fé e milagres', 'Lucas', 7, 12, 6, 'Jesus manifesta o poder de Deus', 'Vida Cristã'),
(16, 'Parábolas de graça', 'Lucas', 13, 18, 6, 'Jesus ensina sobre o amor de Deus', 'Vida Cristã'),
(17, 'Salvação e novo nascimento', 'Lucas', 19, 24, 6, 'Jesus salva e transforma vidas', 'Vida Cristã'),
(18, 'O nascimento da Igreja', 'Atos', 1, 5, 5, 'Pentecostes e a Igreja primitiva', 'Vida Cristã'),
(19, 'Expansão do Evangelho', 'Atos', 6, 10, 5, 'O Evangelho se espalha', 'Vida Cristã'),
(20, 'Missões e evangelismo', 'Atos', 11, 15, 5, 'A Igreja em missão', 'Vida Cristã'),
(21, 'Paulo, apóstolo dos gentios', 'Atos', 16, 20, 5, 'Viagens missionárias de Paulo', 'Vida Cristã'),
(22, 'Perseverança na fé', 'Atos', 21, 28, 8, 'Paulo enfrenta perseguições', 'Vida Cristã'),
(23, 'Alegria em Cristo', 'Filipenses', 1, 4, 4, 'A carta da alegria', 'Vida Cristã'),
(24, 'Nossa identidade em Cristo', 'Efésios', 1, 6, 6, 'Quem somos em Cristo', 'Vida Cristã'),
(25, 'Cristo como centro', 'Colossenses', 1, 4, 4, 'Jesus, preeminente em tudo', 'Vida Cristã'),
(26, 'Esperança e perseverança', '1 Tessalonicenses', 1, 5, 5, 'Vivendo na esperança da volta de Cristo', 'Vida Cristã'),

-- FASE 3: Doutrina e Maturidade (Semanas 27-39)
(27, 'Salvação pela fé - Parte 1', 'Romanos', 1, 4, 4, 'Todos pecaram e precisam de salvação', 'Doutrina e Maturidade'),
(28, 'Salvação pela fé - Parte 2', 'Romanos', 5, 8, 4, 'Justificação e vida no Espírito', 'Doutrina e Maturidade'),
(29, 'Israel e a graça de Deus', 'Romanos', 9, 12, 4, 'A fidelidade de Deus', 'Doutrina e Maturidade'),
(30, 'Vida cristã prática', 'Romanos', 13, 16, 4, 'Como viver em Cristo', 'Doutrina e Maturidade'),
(31, 'Liberdade em Cristo', 'Gálatas', 1, 6, 6, 'Livres da lei, servos do amor', 'Doutrina e Maturidade'),
(32, 'Sabedoria de Deus - Parte 1', '1 Coríntios', 1, 5, 5, 'A sabedoria da cruz', 'Doutrina e Maturidade'),
(33, 'Sabedoria de Deus - Parte 2', '1 Coríntios', 6, 10, 5, 'Santidade e liberdade cristã', 'Doutrina e Maturidade'),
(34, 'Dons espirituais e amor', '1 Coríntios', 11, 14, 4, 'O caminho mais excelente', 'Doutrina e Maturidade'),
(35, 'Ressurreição e vitória', '1 Coríntios', 15, 16, 2, 'Nossa esperança futura', 'Doutrina e Maturidade'),
(36, 'Ministério e sofrimento', '2 Coríntios', 1, 7, 7, 'Força na fraqueza', 'Doutrina e Maturidade'),
(37, 'Generosidade e fé', '2 Coríntios', 8, 13, 6, 'Dar com alegria', 'Doutrina e Maturidade'),
(38, 'Cristo, superior a tudo - Parte 1', 'Hebreus', 1, 7, 7, 'Jesus, nosso sumo sacerdote', 'Doutrina e Maturidade'),
(39, 'Cristo, superior a tudo - Parte 2', 'Hebreus', 8, 13, 6, 'Fé e perseverança', 'Doutrina e Maturidade'),

-- FASE 4: Sabedoria e AT (Semanas 40-52)
(40, 'Salmos de adoração', 'Salmos', 1, 25, 25, 'Louvores e orações', 'Sabedoria e AT'),
(41, 'Salmos de confiança', 'Salmos', 26, 50, 25, 'Confie no Senhor', 'Sabedoria e AT'),
(42, 'Sabedoria prática', 'Provérbios', 1, 15, 15, 'Princípios para a vida', 'Sabedoria e AT'),
(43, 'Mais sabedoria', 'Provérbios', 16, 31, 16, 'Vivendo com sabedoria', 'Sabedoria e AT'),
(44, 'No princípio Deus', 'Gênesis', 1, 11, 11, 'Criação e primeiros acontecimentos', 'Sabedoria e AT'),
(45, 'Abraão, pai da fé', 'Gênesis', 12, 25, 14, 'A promessa de Deus a Abraão', 'Sabedoria e AT'),
(46, 'José e a providência divina', 'Gênesis', 37, 50, 14, 'Deus transforma o mal em bem', 'Sabedoria e AT'),
(47, 'Libertação do Egito', 'Êxodo', 1, 15, 15, 'Deus liberta seu povo', 'Sabedoria e AT'),
(48, 'Os Dez Mandamentos', 'Êxodo', 19, 24, 6, 'A lei de Deus', 'Sabedoria e AT'),
(49, 'O Messias prometido', 'Isaías', 40, 55, 16, 'Profecias sobre Jesus', 'Sabedoria e AT'),
(50, 'Novo coração', 'Ezequiel', 36, 37, 2, 'Deus promete renovação', 'Sabedoria e AT'),
(51, 'Fidelidade de Deus', 'Daniel', 1, 6, 6, 'Deus é fiel aos seus servos', 'Sabedoria e AT'),
(52, 'Apocalipse e vitória final', 'Apocalipse', 19, 22, 4, 'Cristo volta e vence', 'Sabedoria e AT');

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_plano_leitura_semana ON plano_leitura_biblica(semana);
