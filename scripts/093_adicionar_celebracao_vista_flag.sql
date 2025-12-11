-- Adiciona coluna para controlar se o discípulo já viu a celebração do passo atual
ALTER TABLE progresso_fases
ADD COLUMN IF NOT EXISTS celebracao_vista BOOLEAN DEFAULT FALSE;

-- Comentário explicativo
COMMENT ON COLUMN progresso_fases.celebracao_vista IS 'Indica se o discípulo já visualizou o modal de celebração do passo atual validado';
