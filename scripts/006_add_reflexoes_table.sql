-- Criar tabela para armazenar reflexões sobre vídeos e artigos
CREATE TABLE IF NOT EXISTS public.reflexoes_conteudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES public.discipulos(id) ON DELETE CASCADE,
  fase_numero INT NOT NULL,
  passo_numero INT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('video', 'artigo')),
  conteudo_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  reflexao TEXT NOT NULL,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discipulo_id, fase_numero, passo_numero, tipo, conteudo_id)
);

-- Habilitar RLS
ALTER TABLE public.reflexoes_conteudo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Discípulos podem criar suas próprias reflexões"
ON public.reflexoes_conteudo FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.discipulos
    WHERE discipulos.id = reflexoes_conteudo.discipulo_id
    AND discipulos.user_id = auth.uid()
  )
);

CREATE POLICY "Discípulos podem ver suas próprias reflexões"
ON public.reflexoes_conteudo FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.discipulos
    WHERE discipulos.id = reflexoes_conteudo.discipulo_id
    AND discipulos.user_id = auth.uid()
  )
);

CREATE POLICY "Discipuladores podem ver reflexões de seus discípulos"
ON public.reflexoes_conteudo FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.discipulos
    WHERE discipulos.id = reflexoes_conteudo.discipulo_id
    AND discipulos.discipulador_id = auth.uid()
  )
);
