-- MIGRAÇÃO: Reestruturar progresso_fases para ter UMA linha por discípulo
-- Nova estrutura simplificada:
--   - Campos para o passo ATUAL do discípulo
--   - XP é transferido para discipulos.xp_total ao avançar
--   - Sem arrays de histórico (desnecessários)

-- Removido arrays fases_concluidas e passos_concluidos - não precisamos histórico
-- 1. Criar nova tabela com estrutura otimizada e simplificada
CREATE TABLE IF NOT EXISTS progresso_discipulo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discipulo_id uuid NOT NULL UNIQUE REFERENCES discipulos(id) ON DELETE CASCADE,
  
  -- Passo atual em progresso
  fase_atual integer NOT NULL DEFAULT 1,
  passo_atual integer NOT NULL DEFAULT 1,
  
  -- Progresso do passo atual
  videos_assistidos text[] DEFAULT ARRAY[]::text[],
  artigos_lidos text[] DEFAULT ARRAY[]::text[],
  reflexoes_concluidas integer DEFAULT 0,
  pontuacao_passo_atual integer DEFAULT 0,
  
  -- Controles
  data_inicio_passo timestamp with time zone DEFAULT now(),
  dias_no_passo integer DEFAULT 0,
  alertado_tempo_excessivo boolean DEFAULT false,
  enviado_para_validacao boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Índices para performance
CREATE INDEX idx_progresso_discipulo_discipulo_id ON progresso_discipulo(discipulo_id);
CREATE INDEX idx_progresso_discipulo_fase_passo ON progresso_discipulo(fase_atual, passo_atual);

-- Simplificado migração de dados - apenas passo atual, sem arrays de histórico
-- 3. Migrar dados existentes (consolidar múltiplas linhas em uma)
INSERT INTO progresso_discipulo (
  discipulo_id,
  fase_atual,
  passo_atual,
  videos_assistidos,
  artigos_lidos,
  reflexoes_concluidas,
  pontuacao_passo_atual,
  data_inicio_passo,
  dias_no_passo,
  alertado_tempo_excessivo,
  enviado_para_validacao,
  created_at
)
SELECT DISTINCT ON (pf.discipulo_id)
  pf.discipulo_id,
  COALESCE(d.fase_atual, 1) as fase_atual,
  COALESCE(d.passo_atual, 1) as passo_atual,
  pf.videos_assistidos,
  pf.artigos_lidos,
  COALESCE(pf.reflexoes_concluidas, 0),
  COALESCE(pf.pontuacao_total, 0),
  pf.data_inicio,
  COALESCE(pf.dias_no_passo, 0),
  COALESCE(pf.alertado_tempo_excessivo, false),
  COALESCE(pf.enviado_para_validacao, false),
  pf.created_at
FROM progresso_fases pf
INNER JOIN discipulos d ON d.id = pf.discipulo_id
WHERE pf.fase_numero = COALESCE(d.fase_atual, 1)
  AND pf.passo_numero = COALESCE(d.passo_atual, 1)
ORDER BY pf.discipulo_id, pf.created_at DESC;

-- Removido lógica de arrays de concluídos da função
-- 4. Criar função para avançar de passo (transferir XP e zerar progresso)
CREATE OR REPLACE FUNCTION avancar_proximo_passo(
  p_discipulo_id uuid,
  p_nova_fase integer,
  p_novo_passo integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pontuacao_atual integer;
  v_xp_total_atual integer;
BEGIN
  -- Buscar dados atuais
  SELECT pontuacao_passo_atual
  INTO v_pontuacao_atual
  FROM progresso_discipulo
  WHERE discipulo_id = p_discipulo_id;
  
  -- Buscar XP total atual do discípulo
  SELECT xp_total INTO v_xp_total_atual
  FROM discipulos
  WHERE id = p_discipulo_id;
  
  -- Transferir XP para discipulos.xp_total
  UPDATE discipulos
  SET 
    xp_total = COALESCE(v_xp_total_atual, 0) + COALESCE(v_pontuacao_atual, 0),
    fase_atual = p_nova_fase,
    passo_atual = p_novo_passo,
    updated_at = now()
  WHERE id = p_discipulo_id;
  
  -- Atualizar progresso: novo passo e ZERAR contadores
  UPDATE progresso_discipulo
  SET
    fase_atual = p_nova_fase,
    passo_atual = p_novo_passo,
    
    -- ZERAR progresso do passo
    videos_assistidos = ARRAY[]::text[],
    artigos_lidos = ARRAY[]::text[],
    reflexoes_concluidas = 0,
    pontuacao_passo_atual = 0,
    
    -- Resetar controles
    data_inicio_passo = now(),
    dias_no_passo = 0,
    alertado_tempo_excessivo = false,
    enviado_para_validacao = false,
    
    updated_at = now()
  WHERE discipulo_id = p_discipulo_id;
  
  -- Retornar resumo
  RETURN jsonb_build_object(
    'sucesso', true,
    'xp_transferido', v_pontuacao_atual,
    'novo_xp_total', COALESCE(v_xp_total_atual, 0) + COALESCE(v_pontuacao_atual, 0),
    'nova_fase', p_nova_fase,
    'novo_passo', p_novo_passo
  );
END;
$$;

-- 5. Políticas RLS
ALTER TABLE progresso_discipulo ENABLE ROW LEVEL SECURITY;

-- Discípulos veem seu próprio progresso
CREATE POLICY "Ver próprio progresso"
ON progresso_discipulo FOR SELECT
USING (
  discipulo_id IN (
    SELECT id FROM discipulos WHERE user_id = auth.uid()
  )
);

-- Discipuladores veem progresso de seus discípulos
CREATE POLICY "Discipuladores veem progresso de discípulos"
ON progresso_discipulo FOR SELECT
USING (
  discipulo_id IN (
    SELECT id FROM discipulos 
    WHERE discipulador_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Inserir próprio progresso
CREATE POLICY "Inserir próprio progresso"
ON progresso_discipulo FOR INSERT
WITH CHECK (
  discipulo_id IN (
    SELECT id FROM discipulos WHERE user_id = auth.uid()
  )
);

-- Atualizar próprio progresso ou de discípulos
CREATE POLICY "Atualizar progresso"
ON progresso_discipulo FOR UPDATE
USING (
  discipulo_id IN (
    SELECT id FROM discipulos 
    WHERE user_id = auth.uid()
       OR discipulador_id IN (
         SELECT id FROM profiles WHERE id = auth.uid()
       )
  )
);

-- 6. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_progresso_discipulo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON progresso_discipulo
FOR EACH ROW
EXECUTE FUNCTION update_progresso_discipulo_updated_at();

-- 7. Comentários para documentação
COMMENT ON TABLE progresso_discipulo IS 'Uma linha por discípulo com progresso do passo atual';
COMMENT ON COLUMN progresso_discipulo.pontuacao_passo_atual IS 'XP acumulado no passo atual (será transferido para discipulos.xp_total ao avançar)';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migração concluída! Tabela progresso_discipulo criada com UMA linha por discípulo.';
  RAISE NOTICE 'Use a função avancar_proximo_passo() para transferir XP e zerar contadores.';
END $$;
