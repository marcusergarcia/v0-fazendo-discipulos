-- Tabela para armazenar histórico de respostas de perguntas e missões
CREATE TABLE IF NOT EXISTS historico_respostas_passo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES discipulos(id) ON DELETE CASCADE,
  fase_numero INTEGER NOT NULL,
  passo_numero INTEGER NOT NULL,
  resposta_pergunta TEXT,
  resposta_missao TEXT,
  status_validacao TEXT, -- 'pendente', 'aprovado', 'reprovado'
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_validacao TIMESTAMP WITH TIME ZONE,
  validado_por UUID REFERENCES profiles(id),
  feedback_discipulador TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Índices para performance
  CONSTRAINT historico_respostas_passo_discipulo_fase_passo_idx 
    UNIQUE (discipulo_id, fase_numero, passo_numero, data_envio)
);

-- RLS Policies
ALTER TABLE historico_respostas_passo ENABLE ROW LEVEL SECURITY;

-- Discípulos podem ver seu próprio histórico
CREATE POLICY "Discípulos podem ver seu próprio histórico"
ON historico_respostas_passo
FOR SELECT
USING (
  discipulo_id IN (
    SELECT id FROM discipulos WHERE user_id = auth.uid()
  )
);

-- Discipuladores podem ver histórico de seus discípulos
CREATE POLICY "Discipuladores podem ver histórico de seus discípulos"
ON historico_respostas_passo
FOR SELECT
USING (
  discipulo_id IN (
    SELECT id FROM discipulos 
    WHERE discipulador_id IN (
      SELECT id FROM discipulos WHERE user_id = auth.uid()
    )
  )
);

-- Discípulos podem inserir seu próprio histórico
CREATE POLICY "Discípulos podem inserir seu próprio histórico"
ON historico_respostas_passo
FOR INSERT
WITH CHECK (
  discipulo_id IN (
    SELECT id FROM discipulos WHERE user_id = auth.uid()
  )
);

-- Discipuladores podem atualizar histórico de seus discípulos
CREATE POLICY "Discipuladores podem atualizar histórico de seus discípulos"
ON historico_respostas_passo
FOR UPDATE
USING (
  discipulo_id IN (
    SELECT d.id FROM discipulos d
    JOIN discipulos disc ON disc.id = d.discipulador_id
    WHERE disc.user_id = auth.uid()
  )
);

-- Comentário
COMMENT ON TABLE historico_respostas_passo IS 'Armazena histórico de todas as respostas de perguntas e missões práticas, permitindo que não se percam quando o discípulo avança de passo';
