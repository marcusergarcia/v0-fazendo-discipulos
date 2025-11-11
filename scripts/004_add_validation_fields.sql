-- Adicionar campos para validação do discipulador e rascunhos
ALTER TABLE public.progresso_fases 
ADD COLUMN IF NOT EXISTS rascunho_resposta TEXT,
ADD COLUMN IF NOT EXISTS enviado_para_validacao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_envio_validacao TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS validado_por UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS data_validacao TIMESTAMPTZ;
