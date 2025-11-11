-- Adicionar campos para validação do discipulador e rascunhos
ALTER TABLE public.progresso_fases 
ADD COLUMN IF NOT EXISTS rascunho_resposta TEXT,
ADD COLUMN IF NOT EXISTS enviado_para_validacao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_envio_validacao TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS validado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS data_validacao TIMESTAMPTZ,
-- Adding new fields for tracking videos, articles, and validation status
ADD COLUMN IF NOT EXISTS videos_assistidos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS artigos_lidos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status_validacao TEXT CHECK (status_validacao IN ('pendente', 'aprovado', 'reprovado')),
ADD COLUMN IF NOT EXISTS resposta_missao TEXT,
ADD COLUMN IF NOT EXISTS feedback_discipulador TEXT;
