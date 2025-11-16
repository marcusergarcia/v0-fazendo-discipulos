-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('reflexao', 'missao', 'mensagem', 'validacao')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Policy para ver próprias notificações
CREATE POLICY "Ver próprias notificações"
  ON public.notificacoes FOR SELECT
  USING (auth.uid() = user_id);

-- Policy para inserir notificações
CREATE POLICY "Sistema cria notificações"
  ON public.notificacoes FOR INSERT
  WITH CHECK (true);

-- Policy para marcar como lida
CREATE POLICY "Marcar próprias notificações como lida"
  ON public.notificacoes FOR UPDATE
  USING (auth.uid() = user_id);
