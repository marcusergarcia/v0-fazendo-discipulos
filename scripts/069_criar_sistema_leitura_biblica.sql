-- Criar tabela de leituras bíblicas
CREATE TABLE IF NOT EXISTS leituras_biblicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES discipulos(id) ON DELETE CASCADE,
  semana_numero INTEGER NOT NULL,
  livro TEXT NOT NULL,
  capitulo_inicio INTEGER NOT NULL,
  capitulo_fim INTEGER NOT NULL,
  data_leitura TIMESTAMP WITH TIME ZONE,
  confirmada BOOLEAN DEFAULT FALSE,
  xp_ganho INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discipulo_id, semana_numero)
);

-- Adicionar RLS
ALTER TABLE leituras_biblicas ENABLE ROW LEVEL SECURITY;

-- Política para discípulos verem suas próprias leituras
CREATE POLICY "Discípulos podem ver suas próprias leituras"
ON leituras_biblicas FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = discipulo_id
  )
);

-- Política para discípulos inserirem suas próprias leituras
CREATE POLICY "Discípulos podem inserir suas próprias leituras"
ON leituras_biblicas FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = discipulo_id
  )
);

-- Política para discípulos atualizarem suas próprias leituras
CREATE POLICY "Discípulos podem atualizar suas próprias leituras"
ON leituras_biblicas FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = discipulo_id
  )
);

-- Política para discipuladores verem leituras de seus discípulos
CREATE POLICY "Discipuladores podem ver leituras de seus discípulos"
ON leituras_biblicas FOR SELECT
USING (
  auth.uid() IN (
    SELECT d.user_id 
    FROM discipulos d 
    WHERE d.id = (SELECT discipulador_id FROM discipulos WHERE id = discipulo_id)
  )
);

-- Índices para performance
CREATE INDEX idx_leituras_discipulo ON leituras_biblicas(discipulo_id);
CREATE INDEX idx_leituras_semana ON leituras_biblicas(semana_numero);
CREATE INDEX idx_leituras_confirmada ON leituras_biblicas(confirmada);

-- Mensagem de sucesso
SELECT 'Tabela leituras_biblicas criada com sucesso!' as message;
