-- Adicionar campo de etnia à tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS etnia VARCHAR(50);

-- Adicionar constraint para validar valores permitidos
ALTER TABLE profiles
ADD CONSTRAINT check_etnia 
CHECK (etnia IS NULL OR etnia IN ('branca', 'parda', 'negra', 'indigena', 'asiatica'));

-- Criar índice para melhorar performance em buscas por etnia
CREATE INDEX IF NOT EXISTS idx_profiles_etnia ON profiles(etnia);

-- Comentário sobre a coluna
COMMENT ON COLUMN profiles.etnia IS 'Etnia do usuário para personalização do avatar';
