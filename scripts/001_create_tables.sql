-- Criar tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome_completo TEXT,
  telefone TEXT,
  igreja TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de discípulos (quem está sendo discipulado)
CREATE TABLE IF NOT EXISTS public.discipulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discipulador_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nivel_atual TEXT DEFAULT 'Explorador' CHECK (nivel_atual IN ('Explorador', 'Discípulo', 'Guerreiro', 'Servo Mestre', 'Multiplicador')),
  fase_atual INTEGER DEFAULT 1 CHECK (fase_atual BETWEEN 1 AND 8),
  passo_atual INTEGER DEFAULT 1,
  xp_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de progresso por fase
CREATE TABLE IF NOT EXISTS public.progresso_fases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES public.discipulos(id) ON DELETE CASCADE,
  fase_numero INTEGER NOT NULL CHECK (fase_numero BETWEEN 1 AND 8),
  passo_numero INTEGER NOT NULL CHECK (passo_numero BETWEEN 1 AND 10),
  completado BOOLEAN DEFAULT FALSE,
  data_completado TIMESTAMPTZ,
  resposta_pergunta TEXT,
  nota_discipulador TEXT,
  xp_ganho INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discipulo_id, fase_numero, passo_numero)
);

-- Criar tabela de recompensas conquistadas
CREATE TABLE IF NOT EXISTS public.recompensas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES public.discipulos(id) ON DELETE CASCADE,
  tipo_recompensa TEXT NOT NULL CHECK (tipo_recompensa IN ('insignia', 'medalha', 'armadura', 'nivel')),
  nome_recompensa TEXT NOT NULL,
  descricao TEXT,
  conquistado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de mensagens (chat discipulador-discípulo)
CREATE TABLE IF NOT EXISTS public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES public.discipulos(id) ON DELETE CASCADE,
  remetente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_fases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies para discipulos
CREATE POLICY "Discípulos podem ver seus próprios dados"
  ON public.discipulos FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = discipulador_id);

CREATE POLICY "Usuários podem criar seu registro de discípulo"
  ON public.discipulos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Discípulos e discipuladores podem atualizar"
  ON public.discipulos FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = discipulador_id);

-- Policies para progresso_fases
CREATE POLICY "Ver progresso próprio ou de seus discípulos"
  ON public.progresso_fases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.discipulos 
      WHERE id = progresso_fases.discipulo_id 
      AND (user_id = auth.uid() OR discipulador_id = auth.uid())
    )
  );

CREATE POLICY "Inserir próprio progresso"
  ON public.progresso_fases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.discipulos 
      WHERE id = progresso_fases.discipulo_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Atualizar próprio progresso ou de discípulos"
  ON public.progresso_fases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.discipulos 
      WHERE id = progresso_fases.discipulo_id 
      AND (user_id = auth.uid() OR discipulador_id = auth.uid())
    )
  );

-- Policies para recompensas
CREATE POLICY "Ver próprias recompensas ou de discípulos"
  ON public.recompensas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.discipulos 
      WHERE id = recompensas.discipulo_id 
      AND (user_id = auth.uid() OR discipulador_id = auth.uid())
    )
  );

CREATE POLICY "Sistema insere recompensas"
  ON public.recompensas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.discipulos 
      WHERE id = recompensas.discipulo_id 
      AND user_id = auth.uid()
    )
  );

-- Policies para mensagens
CREATE POLICY "Ver mensagens relacionadas"
  ON public.mensagens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.discipulos 
      WHERE id = mensagens.discipulo_id 
      AND (user_id = auth.uid() OR discipulador_id = auth.uid())
    )
  );

CREATE POLICY "Enviar mensagens"
  ON public.mensagens FOR INSERT
  WITH CHECK (
    auth.uid() = remetente_id AND
    EXISTS (
      SELECT 1 FROM public.discipulos 
      WHERE id = mensagens.discipulo_id 
      AND (user_id = auth.uid() OR discipulador_id = auth.uid())
    )
  );
