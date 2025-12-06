-- MIGRAÇÃO: Reestruturar progresso_fases para ter UMA linha por discípulo
-- Nova estrutura:
-- - Uma linha por discípulo
-- - Arrays para rastrear fases/passos concluídos
-- - Campos para o passo ATUAL em progresso
-- - XP temporário que é transferido para discipulos.xp_total ao avançar

-- 1. Criar nova tabela com estrutura otimizada
CREATE TABLE IF NOT EXISTS progresso_discipulo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id UUID NOT NULL REFERENCES discipulos(id) ON DELETE CASCADE,
  
  -- Passo atual em progresso
  fase_atual INTEGER NOT NULL DEFAULT 1,
  passo_atual INTEGER NOT NULL DEFAULT 1,
  
  -- Histórico de fases/passos concluídos (arrays)
  fases_concluidas INTEGER[] DEFAULT '{}',
  passos_concluidos JSONB DEFAULT '[]', -- [{fase: 1, passo: 1}, {fase: 1, passo: 2}, ...]
  
  -- Progresso do passo ATUAL
  reflexoes_concluidas INTEGER DEFAULT 0,
  pontuacao_temporaria INTEGER DEFAULT 0, -- XP acumulado no passo atual
  videos_assistidos TEXT[] DEFAULT '{}',
  artigos_lidos TEXT[] DEFAULT '{}',
  
  -- Metadados
  data_inicio_passo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_ultimo_passo_concluido TIMESTAMP WITH TIME ZONE,
  dias_no_passo_atual INTEGER DEFAULT 0,
  alertado_tempo_excessivo BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: apenas uma linha por discípulo
  UNIQUE(discipulo_id)
);

-- 2. Criar índices para performance
CREATE INDEX idx_progresso_discipulo_discipulo_id ON progresso_discipulo(discipulo_id);
CREATE INDEX idx_progresso_discipulo_fase_passo ON progresso_discipulo(fase_atual, passo_atual);

-- 3. Migrar dados existentes da tabela antiga para a nova
-- Para cada discípulo, pegar o passo MAIS RECENTE como o atual
-- e os anteriores como concluídos
INSERT INTO progresso_discipulo (
  discipulo_id,
  fase_atual,
  passo_atual,
  fases_concluidas,
  passos_concluidos,
  reflexoes_concluidas,
  pontuacao_temporaria,
  videos_assistidos,
  artigos_lidos,
  data_inicio_passo,
  dias_no_passo_atual,
  alertado_tempo_excessivo,
  created_at
)
SELECT DISTINCT ON (pf.discipulo_id)
  pf.discipulo_id,
  pf.fase_numero AS fase_atual,
  pf.passo_numero AS passo_atual,
  
  -- Pegar fases únicas já concluídas (exceto a atual)
  COALESCE(
    (SELECT ARRAY_AGG(DISTINCT fase_numero) 
     FROM progresso_fases 
     WHERE discipulo_id = pf.discipulo_id 
     AND completado = TRUE 
     AND fase_numero < pf.fase_numero),
    '{}'
  ) AS fases_concluidas,
  
  -- Pegar todos os passos concluídos (exceto o atual)
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object('fase', fase_numero, 'passo', passo_numero))
     FROM progresso_fases 
     WHERE discipulo_id = pf.discipulo_id 
     AND completado = TRUE
     AND NOT (fase_numero = pf.fase_numero AND passo_numero = pf.passo_numero)),
    '[]'
  ) AS passos_concluidos,
  
  pf.reflexoes_concluidas,
  pf.pontuacao_total AS pontuacao_temporaria,
  pf.videos_assistidos,
  pf.artigos_lidos,
  pf.data_inicio,
  pf.dias_no_passo,
  pf.alertado_tempo_excessivo,
  pf.created_at
FROM progresso_fases pf
ORDER BY pf.discipulo_id, pf.created_at DESC
ON CONFLICT (discipulo_id) DO NOTHING;

-- 4. Habilitar RLS
ALTER TABLE progresso_discipulo ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
-- Corrigido: usar profiles.id em vez de user_id
CREATE POLICY "Discípulos podem ver seu próprio progresso"
  ON progresso_discipulo
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      INNER JOIN discipulos d ON d.id = progresso_discipulo.discipulo_id
      WHERE p.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Discipuladores podem ver progresso de seus discípulos"
  ON progresso_discipulo
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      INNER JOIN discipulos d ON d.discipulador_id = p.id
      WHERE d.id = progresso_discipulo.discipulo_id
    )
  );

CREATE POLICY "Discípulos podem inserir seu próprio progresso"
  ON progresso_discipulo
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      INNER JOIN discipulos d ON d.id = progresso_discipulo.discipulo_id
      WHERE p.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Discípulos e discipuladores podem atualizar progresso"
  ON progresso_discipulo
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      INNER JOIN discipulos d ON d.id = progresso_discipulo.discipulo_id
      WHERE p.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    auth.uid() IN (
      SELECT p.id FROM profiles p
      INNER JOIN discipulos d ON d.discipulador_id = p.id
      WHERE d.id = progresso_discipulo.discipulo_id
    )
  );

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_progresso_discipulo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progresso_discipulo_updated_at
  BEFORE UPDATE ON progresso_discipulo
  FOR EACH ROW
  EXECUTE FUNCTION update_progresso_discipulo_updated_at();

-- 7. Comentários sobre a tabela antiga
COMMENT ON TABLE progresso_fases IS 'DEPRECATED: Use progresso_discipulo. Esta tabela será removida após migração completa.';

-- NOTA: NÃO vamos dropar a tabela antiga ainda!
-- Depois que todo o código estiver migrado e testado, você pode executar:
-- DROP TABLE progresso_fases CASCADE;
