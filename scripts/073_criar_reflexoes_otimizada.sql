-- Criar nova tabela otimizada para reflexões
-- Em vez de 1 linha por conteúdo, teremos 1 linha por tipo de conteúdo por passo
-- Isso reduz drasticamente o número de linhas (de ~6 para ~2 por passo)

CREATE TABLE IF NOT EXISTS reflexoes_passo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id uuid REFERENCES discipulos(id) ON DELETE CASCADE NOT NULL,
  fase_numero integer NOT NULL,
  passo_numero integer NOT NULL,
  tipo_conteudo text NOT NULL CHECK (tipo_conteudo IN ('video', 'artigo')),
  
  -- Arrays de dados de cada conteúdo individual
  conteudos_ids text[] DEFAULT '{}', -- IDs dos conteúdos (video-1, video-2, etc)
  respostas jsonb DEFAULT '[]', -- [{conteudo_id: "video-1", resposta: "texto", enviado_em: "timestamp"}]
  feedbacks jsonb DEFAULT '[]', -- [{conteudo_id: "video-1", feedback: "texto", avaliado_em: "timestamp", xp: 30}]
  
  -- Status geral do grupo
  situacao text CHECK (situacao IN ('nao_iniciado', 'em_andamento', 'enviado', 'aprovado')) DEFAULT 'nao_iniciado',
  xp_total integer DEFAULT 0, -- Soma de todos os XPs do grupo
  todos_aprovados boolean DEFAULT false,
  
  -- Metadados
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Garantir uma linha por discípulo/fase/passo/tipo
  UNIQUE(discipulo_id, fase_numero, passo_numero, tipo_conteudo)
);

-- Índices para performance
CREATE INDEX idx_reflexoes_passo_discipulo ON reflexoes_passo(discipulo_id);
CREATE INDEX idx_reflexoes_passo_fase_passo ON reflexoes_passo(fase_numero, passo_numero);
CREATE INDEX idx_reflexoes_passo_situacao ON reflexoes_passo(situacao);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_reflexoes_passo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reflexoes_passo_updated_at
  BEFORE UPDATE ON reflexoes_passo
  FOR EACH ROW
  EXECUTE FUNCTION update_reflexoes_passo_updated_at();

-- Função para migrar dados da tabela antiga para a nova
CREATE OR REPLACE FUNCTION migrar_reflexoes_para_otimizada()
RETURNS void AS $$
DECLARE
  disc RECORD;
  fase INT;
  passo INT;
  tipo TEXT;
BEGIN
  -- Para cada combinação única de discípulo, fase, passo e tipo
  FOR disc IN 
    SELECT DISTINCT 
      discipulo_id,
      fase_numero,
      passo_numero,
      CASE 
        WHEN conteudo_id LIKE 'video%' THEN 'video'
        WHEN conteudo_id LIKE 'artigo%' THEN 'artigo'
        ELSE 'video' -- fallback
      END as tipo_conteudo
    FROM reflexoes_conteudo
    ORDER BY discipulo_id, fase_numero, passo_numero
  LOOP
    -- Inserir linha agrupada com arrays
    INSERT INTO reflexoes_passo (
      discipulo_id,
      fase_numero,
      passo_numero,
      tipo_conteudo,
      conteudos_ids,
      respostas,
      feedbacks,
      situacao,
      xp_total,
      todos_aprovados
    )
    SELECT 
      disc.discipulo_id,
      disc.fase_numero,
      disc.passo_numero,
      disc.tipo_conteudo,
      -- Array de IDs
      array_agg(conteudo_id ORDER BY conteudo_id),
      -- Array de respostas (JSONB)
      jsonb_agg(
        jsonb_build_object(
          'conteudo_id', conteudo_id,
          'resposta', COALESCE(resposta, ''),
          'enviado_em', created_at
        ) ORDER BY conteudo_id
      ),
      -- Array de feedbacks (JSONB)
      jsonb_agg(
        jsonb_build_object(
          'conteudo_id', conteudo_id,
          'feedback', COALESCE(feedback_discipulador, ''),
          'xp', COALESCE(xp_ganho, 0),
          'avaliado_em', updated_at
        ) ORDER BY conteudo_id
      ),
      -- Status geral (pega o mais avançado)
      CASE 
        WHEN bool_and(situacao = 'aprovado') THEN 'aprovado'
        WHEN bool_or(situacao = 'enviado') THEN 'enviado'
        WHEN bool_or(resposta IS NOT NULL AND resposta != '') THEN 'em_andamento'
        ELSE 'nao_iniciado'
      END,
      -- XP total
      COALESCE(SUM(xp_ganho), 0),
      -- Todos aprovados
      bool_and(situacao = 'aprovado')
    FROM reflexoes_conteudo
    WHERE discipulo_id = disc.discipulo_id
      AND fase_numero = disc.fase_numero
      AND passo_numero = disc.passo_numero
      AND CASE 
        WHEN conteudo_id LIKE 'video%' THEN 'video'
        WHEN conteudo_id LIKE 'artigo%' THEN 'artigo'
        ELSE 'video'
      END = disc.tipo_conteudo
    ON CONFLICT (discipulo_id, fase_numero, passo_numero, tipo_conteudo) 
    DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Migração concluída com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- Comentários explicativos
COMMENT ON TABLE reflexoes_passo IS 'Tabela otimizada que agrupa reflexões por tipo de conteúdo (video/artigo) em vez de ter uma linha por conteúdo individual';
COMMENT ON COLUMN reflexoes_passo.respostas IS 'Array JSONB com respostas individuais de cada conteúdo do grupo';
COMMENT ON COLUMN reflexoes_passo.feedbacks IS 'Array JSONB com feedbacks do discipulador para cada conteúdo do grupo';

-- Políticas RLS (espelhar da tabela antiga)
ALTER TABLE reflexoes_passo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discípulos podem ver suas próprias reflexões"
  ON reflexoes_passo FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discípulos podem inserir suas reflexões"
  ON reflexoes_passo FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discípulos podem atualizar suas reflexões"
  ON reflexoes_passo FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discipuladores podem ver reflexões"
  ON reflexoes_passo FOR SELECT
  USING (auth.uid() IN (
    SELECT d.discipulador_id 
    FROM discipulos d
    WHERE d.id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discipuladores podem atualizar reflexões (feedback)"
  ON reflexoes_passo FOR UPDATE
  USING (auth.uid() IN (
    SELECT d.discipulador_id 
    FROM discipulos d
    WHERE d.id = reflexoes_passo.discipulo_id
  ));

-- Executar migração (comentado por segurança - executar manualmente após revisar)
-- SELECT migrar_reflexoes_para_otimizada();

-- Comparar número de linhas
SELECT 
  'reflexoes_conteudo (antiga)' as tabela,
  COUNT(*) as total_linhas
FROM reflexoes_conteudo
UNION ALL
SELECT 
  'reflexoes_passo (nova)' as tabela,
  COUNT(*) as total_linhas
FROM reflexoes_passo;
