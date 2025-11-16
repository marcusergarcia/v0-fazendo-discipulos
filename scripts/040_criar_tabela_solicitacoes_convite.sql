-- Criar tabela para solicitações de convite
CREATE TABLE IF NOT EXISTS public.solicitacoes_convite (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  mensagem TEXT,
  discipulador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
  data_solicitacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_resposta TIMESTAMPTZ,
  convite_id UUID REFERENCES public.convites(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_discipulador ON public.solicitacoes_convite(discipulador_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON public.solicitacoes_convite(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_email ON public.solicitacoes_convite(email);

-- Comentários
COMMENT ON TABLE public.solicitacoes_convite IS 'Solicitações de convite de pessoas que querem iniciar o discipulado';
COMMENT ON COLUMN public.solicitacoes_convite.status IS 'Status da solicitação: pendente, aprovada, rejeitada';
COMMENT ON COLUMN public.solicitacoes_convite.convite_id IS 'ID do convite gerado após aprovação';

-- RLS Policies
ALTER TABLE public.solicitacoes_convite ENABLE ROW LEVEL SECURITY;

-- Política: Discipuladores podem ver suas próprias solicitações
CREATE POLICY "Discipuladores podem ver suas solicitações"
ON public.solicitacoes_convite
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.id = solicitacoes_convite.discipulador_id
  )
);

-- Política: Qualquer pessoa pode criar solicitações (sem autenticação)
CREATE POLICY "Qualquer pessoa pode solicitar convite"
ON public.solicitacoes_convite
FOR INSERT
WITH CHECK (true);

-- Política: Discipuladores podem atualizar suas solicitações
CREATE POLICY "Discipuladores podem atualizar suas solicitações"
ON public.solicitacoes_convite
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.id = solicitacoes_convite.discipulador_id
  )
);
