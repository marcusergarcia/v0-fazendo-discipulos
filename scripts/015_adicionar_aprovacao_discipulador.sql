-- Script para adicionar campo de aprovação do discipulador
-- Este campo controla se o novo discípulo pode acessar o sistema

-- Adicionar campo aprovado_discipulador na tabela discipulos
ALTER TABLE public.discipulos
ADD COLUMN IF NOT EXISTS aprovado_discipulador BOOLEAN DEFAULT FALSE;

-- Adicionar campo data_aprovacao_discipulador
ALTER TABLE public.discipulos
ADD COLUMN IF NOT EXISTS data_aprovacao_discipulador TIMESTAMPTZ;

-- Atualizar discípulos existentes para aprovado (retroativo)
UPDATE public.discipulos
SET aprovado_discipulador = TRUE
WHERE aprovado_discipulador IS NULL;

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_discipulos_aprovado ON public.discipulos(aprovado_discipulador);
CREATE INDEX IF NOT EXISTS idx_discipulos_discipulador_id ON public.discipulos(discipulador_id);
