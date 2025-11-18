-- Adicionar campos faltantes na tabela historico_respostas_passo

-- Adicionar discipulador_id com relacionamento
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS discipulador_id UUID REFERENCES discipulos(id) ON DELETE SET NULL;

-- Adicionar campos de controle de aprovação
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS situacao TEXT DEFAULT 'enviado' CHECK (situacao IN ('enviado', 'aprovado'));

ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS xp_ganho INTEGER DEFAULT 0;

ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE;

ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS notificacao_id UUID REFERENCES notificacoes(id) ON DELETE SET NULL;

-- Adicionar campos de perguntas (se não existirem)
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS pergunta TEXT;

ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS missao_pratica TEXT;

-- Atualizar updated_at se não existir
ALTER TABLE historico_respostas_passo 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_respostas_discipulador 
ON historico_respostas_passo(discipulador_id);

CREATE INDEX IF NOT EXISTS idx_historico_respostas_situacao 
ON historico_respostas_passo(situacao);

CREATE INDEX IF NOT EXISTS idx_historico_respostas_notificacao 
ON historico_respostas_passo(notificacao_id);

-- Atualizar registros existentes para popular discipulador_id
UPDATE historico_respostas_passo hr
SET discipulador_id = d.discipulador_id
FROM discipulos d
WHERE hr.discipulo_id = d.id 
AND hr.discipulador_id IS NULL;

-- Atualizar situacao dos registros antigos baseado em status_validacao
UPDATE historico_respostas_passo
SET situacao = CASE 
  WHEN status_validacao = 'aprovado' THEN 'aprovado'
  ELSE 'enviado'
END
WHERE situacao IS NULL;

-- Criar policy para discipuladores verem respostas de seus discípulos
DROP POLICY IF EXISTS "Discipuladores podem ver respostas via discipulador_id" ON historico_respostas_passo;
CREATE POLICY "Discipuladores podem ver respostas via discipulador_id"
  ON historico_respostas_passo
  FOR SELECT
  USING (
    discipulador_id IN (
      SELECT id FROM discipulos WHERE user_id = auth.uid()
    )
  );

-- Atualizar policy de update para usar discipulador_id
DROP POLICY IF EXISTS "Discipuladores podem atualizar via discipulador_id" ON historico_respostas_passo;
CREATE POLICY "Discipuladores podem atualizar via discipulador_id"
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

DROP TRIGGER IF EXISTS update_historico_respostas_timestamp ON historico_respostas_passo;
CREATE TRIGGER update_historico_respostas_timestamp
  BEFORE UPDATE ON historico_respostas_passo
  FOR EACH ROW
  EXECUTE FUNCTION update_historico_respostas_updated_at();
