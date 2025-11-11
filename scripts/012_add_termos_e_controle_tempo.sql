-- Adicionar campos de aceite de termos na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS aceitou_lgpd BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aceitou_compromisso BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_aceite_termos TIMESTAMPTZ;

-- Adicionar controle de tempo nos passos
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS data_inicio TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS dias_no_passo INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN completado THEN EXTRACT(DAY FROM (data_completado - data_inicio))
    ELSE EXTRACT(DAY FROM (NOW() - data_inicio))
  END
) STORED,
ADD COLUMN IF NOT EXISTS alertado_tempo_excessivo BOOLEAN DEFAULT FALSE;

-- Criar tabela de convites
CREATE TABLE IF NOT EXISTS public.convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  codigo_convite TEXT NOT NULL UNIQUE,
  email_convidado TEXT,
  usado BOOLEAN DEFAULT FALSE,
  usado_por UUID REFERENCES auth.users(id),
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  data_uso TIMESTAMPTZ,
  expira_em TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_convites_codigo ON public.convites(codigo_convite);
CREATE INDEX IF NOT EXISTS idx_convites_discipulador ON public.convites(discipulador_id);
CREATE INDEX IF NOT EXISTS idx_progresso_dias ON public.progresso_fases(discipulo_id, completado, dias_no_passo);

-- RLS para convites
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discipuladores podem ver seus convites"
  ON public.convites FOR SELECT
  USING (auth.uid() = discipulador_id);

CREATE POLICY "Discipuladores podem criar convites"
  ON public.convites FOR INSERT
  WITH CHECK (auth.uid() = discipulador_id);

CREATE POLICY "Qualquer um pode ver convite por código"
  ON public.convites FOR SELECT
  USING (TRUE);

CREATE POLICY "Sistema pode atualizar convite ao ser usado"
  ON public.convites FOR UPDATE
  USING (TRUE);

-- Função para gerar código de convite único
CREATE OR REPLACE FUNCTION gerar_codigo_convite()
RETURNS TEXT AS $$
DECLARE
  codigo TEXT;
BEGIN
  codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE public.convites IS 'Convites de discipuladores para novos discípulos';
COMMENT ON COLUMN public.progresso_fases.data_inicio IS 'Data de início do passo';
COMMENT ON COLUMN public.progresso_fases.dias_no_passo IS 'Dias no passo atual (calculado automaticamente)';
COMMENT ON COLUMN public.progresso_fases.alertado_tempo_excessivo IS 'Se discipulador foi alertado sobre tempo excessivo';
