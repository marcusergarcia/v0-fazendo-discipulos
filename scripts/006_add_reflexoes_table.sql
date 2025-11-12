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

-- Políticas RLS agora usam DO $$ para verificar existência antes de criar
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'reflexoes_conteudo' 
    AND policyname = 'Discípulos podem criar suas próprias reflexões'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'reflexoes_conteudo' 
    AND policyname = 'Discípulos podem ver suas próprias reflexões'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'reflexoes_conteudo' 
    AND policyname = 'Discipuladores podem ver reflexões de seus discípulos'
  ) THEN
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
  END IF;
END $$;
