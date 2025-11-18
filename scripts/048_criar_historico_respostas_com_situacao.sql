-- Criar tabela para histórico de respostas das perguntas e missões do passo
CREATE TABLE IF NOT EXISTS historico_respostas_passo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES discipulos(id) ON DELETE CASCADE,
  discipulador_id UUID REFERENCES discipulos(id) ON DELETE SET NULL,
  fase_numero INTEGER NOT NULL,
  passo_numero INTEGER NOT NULL,
  
  -- Perguntas e respostas
  pergunta TEXT,
  resposta_pergunta TEXT,
  missao_pratica TEXT,
  resposta_missao TEXT,
  
  -- Controle de aprovação
  situacao TEXT NOT NULL DEFAULT 'enviado' CHECK (situacao IN ('enviado', 'aprovado')),
  xp_ganho INTEGER DEFAULT 0,
  feedback_discipulador TEXT,
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  
  -- Notificação relacionada
  notificacao_id UUID REFERENCES notificacoes(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_respostas_discipulo ON historico_respostas_passo(discipulo_id);
CREATE INDEX IF NOT EXISTS idx_historico_respostas_discipulador ON historico_respostas_passo(discipulador_id);
CREATE INDEX IF NOT EXISTS idx_historico_respostas_situacao ON historico_respostas_passo(situacao);
CREATE INDEX IF NOT EXISTS idx_historico_respostas_passo ON historico_respostas_passo(fase_numero, passo_numero);

-- RLS Policies
ALTER TABLE historico_respostas_passo ENABLE ROW LEVEL SECURITY;

-- Discípulos podem ver suas próprias respostas
CREATE POLICY "Discípulos podem ver suas próprias respostas"
  ON historico_respostas_passo
  FOR SELECT
  USING (
    discipulo_id IN (
      SELECT id FROM discipulos WHERE user_id = auth.uid()
    )
  );

-- Discípulos podem criar suas próprias respostas
CREATE POLICY "Discípulos podem criar suas próprias respostas"
  ON historico_respostas_passo
  FOR INSERT
  WITH CHECK (
    discipulo_id IN (
      SELECT id FROM discipulos WHERE user_id = auth.uid()
    )
  );

-- Discipuladores podem ver respostas de seus discípulos
CREATE POLICY "Discipuladores podem ver respostas de seus discípulos"
  ON historico_respostas_passo
  FOR SELECT
  USING (
    discipulador_id IN (
      SELECT id FROM discipulos WHERE user_id = auth.uid()
    )
  );

-- Discipuladores podem atualizar respostas (aprovar)
CREATE POLICY "Discipuladores podem atualizar respostas"
  ON historico_respostas_passo
  FOR UPDATE
  USING (
    discipulador_id IN (
      SELECT id FROM discipulos WHERE user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_historico_respostas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_historico_respostas_timestamp
  BEFORE UPDATE ON historico_respostas_passo
  FOR EACH ROW
  EXECUTE FUNCTION update_historico_respostas_updated_at();
