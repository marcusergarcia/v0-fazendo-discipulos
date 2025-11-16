-- Adicionar todas as colunas que faltam na tabela progresso_fases

-- Adicionar arrays de IDs de vídeos e artigos assistidos/lidos
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS videos_assistidos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS artigos_lidos TEXT[] DEFAULT '{}';

-- Adicionar campos de conclusão e validação
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS completado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS enviado_para_validacao BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_completado TIMESTAMPTZ;

-- Adicionar campos de respostas
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS resposta_pergunta TEXT,
ADD COLUMN IF NOT EXISTS resposta_missao TEXT,
ADD COLUMN IF NOT EXISTS rascunho_resposta TEXT;

-- Adicionar campo de status de validação
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS status_validacao TEXT CHECK (status_validacao IN ('pendente', 'aprovado', 'reprovado', 'em_revisao'));

-- Adicionar comentário para documentação
COMMENT ON TABLE public.progresso_fases IS 'Tabela de progresso dos discípulos nos passos e fases';
COMMENT ON COLUMN public.progresso_fases.videos_assistidos IS 'Array de IDs dos vídeos assistidos pelo discípulo neste passo';
COMMENT ON COLUMN public.progresso_fases.artigos_lidos IS 'Array de IDs dos artigos lidos pelo discípulo neste passo';
COMMENT ON COLUMN public.progresso_fases.completado IS 'Indica se o passo foi completado';
COMMENT ON COLUMN public.progresso_fases.enviado_para_validacao IS 'Indica se o passo foi enviado para validação do discipulador';
COMMENT ON COLUMN public.progresso_fases.data_completado IS 'Data e hora em que o passo foi marcado como completado';
COMMENT ON COLUMN public.progresso_fases.resposta_pergunta IS 'Resposta do discípulo para a pergunta do passo';
COMMENT ON COLUMN public.progresso_fases.resposta_missao IS 'Resposta do discípulo para a missão do passo';
COMMENT ON COLUMN public.progresso_fases.rascunho_resposta IS 'Rascunho da resposta sendo escrita pelo discípulo';
COMMENT ON COLUMN public.progresso_fases.status_validacao IS 'Status da validação pelo discipulador (pendente, aprovado, reprovado, em_revisao)';
