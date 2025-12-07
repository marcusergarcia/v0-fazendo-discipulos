-- Dropar e recriar a tabela reflexoes_passo usando os mesmos nomes de campos
-- da tabela reflexoes_conteudo para manter compatibilidade com funções existentes

-- Dropar a tabela atual
DROP TABLE IF EXISTS reflexoes_passo CASCADE;

-- Recriar com mesmos nomes de campos da reflexoes_conteudo
CREATE TABLE reflexoes_passo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id uuid REFERENCES discipulos(id) ON DELETE CASCADE NOT NULL,
  discipulador_id uuid, -- Adicionado para compatibilidade
  fase_numero integer NOT NULL,
  passo_numero integer NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('video', 'artigo')), -- Mesmo nome que reflexoes_conteudo
  
  -- Arrays de IDs dos conteúdos (video-1, video-2, artigo-1, etc)
  conteudos_ids text[] DEFAULT '{}',
  
  -- Array de respostas/reflexões JSONB
  -- [{conteudo_id: "video-1", reflexao: "texto", resumo: "texto"}]
  reflexoes jsonb DEFAULT '[]',
  
  -- Array de feedbacks do discipulador JSONB
  -- [{conteudo_id: "video-1", feedback_discipulador: "texto", xp_ganho: 30}]
  feedbacks jsonb DEFAULT '[]',
  
  -- Campos de status (mesmos nomes da tabela antiga)
  situacao text CHECK (situacao IN ('nao_iniciado', 'em_andamento', 'enviado', 'aprovado')) DEFAULT 'nao_iniciado',
  xp_ganho integer DEFAULT 0, -- Soma total de XP do grupo (mesmo nome)
  titulo text, -- Para compatibilidade
  notificacao_id uuid, -- Para compatibilidade
  
  -- Datas (mesmos nomes da tabela antiga)
  data_criacao timestamptz DEFAULT now(),
  data_aprovacao timestamptz,
  
  -- Garantir uma linha por discípulo/fase/passo/tipo
  UNIQUE(discipulo_id, fase_numero, passo_numero, tipo)
);

-- Índices para performance
CREATE INDEX idx_reflexoes_passo_discipulo ON reflexoes_passo(discipulo_id);
CREATE INDEX idx_reflexoes_passo_discipulador ON reflexoes_passo(discipulador_id);
CREATE INDEX idx_reflexoes_passo_fase_passo ON reflexoes_passo(fase_numero, passo_numero);
CREATE INDEX idx_reflexoes_passo_situacao ON reflexoes_passo(situacao);

-- Políticas RLS (mesmas da tabela antiga)
ALTER TABLE reflexoes_passo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discípulos podem ver suas próprias reflexões"
  ON reflexoes_passo FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discípulos podem criar suas próprias reflexões"
  ON reflexoes_passo FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discipuladores podem ver reflexões de seus discípulos"
  ON reflexoes_passo FOR SELECT
  USING (auth.uid() IN (
    SELECT d.discipulador_id 
    FROM discipulos d
    WHERE d.id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discipuladores podem atualizar reflexões de seus discípulos"
  ON reflexoes_passo FOR UPDATE
  USING (auth.uid() IN (
    SELECT d.discipulador_id 
    FROM discipulos d
    WHERE d.id = reflexoes_passo.discipulo_id
  ));

CREATE POLICY "Discipuladores podem ver reflexões diretas"
  ON reflexoes_passo FOR SELECT
  USING (auth.uid() = reflexoes_passo.discipulador_id);

-- Comentários
COMMENT ON TABLE reflexoes_passo IS 'Tabela otimizada que agrupa reflexões por tipo (video/artigo) usando mesmos nomes de campos que reflexoes_conteudo para compatibilidade';
COMMENT ON COLUMN reflexoes_passo.reflexoes IS 'Array JSONB com reflexões individuais de cada conteúdo [{conteudo_id, reflexao, resumo}]';
COMMENT ON COLUMN reflexoes_passo.feedbacks IS 'Array JSONB com feedbacks do discipulador [{conteudo_id, feedback_discipulador, xp_ganho}]';
