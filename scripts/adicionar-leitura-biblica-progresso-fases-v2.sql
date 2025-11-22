-- Script para integrar leitura bíblica ao sistema de progresso de fases
-- Evita redundância usando a tabela leituras_capitulos existente como fonte única de verdade

-- Adicionar campo para rastrear apenas QUAIS semanas foram concluídas
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS leituras_semanais_concluidas INTEGER[] DEFAULT '{}';

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.progresso_fases.leituras_semanais_concluidas IS 
'Array com os números das semanas de leitura bíblica que foram concluídas (ex: [1, 2, 3]). 
O XP e capítulos lidos estão na tabela leituras_capitulos para evitar redundância.';

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_progresso_leituras_semana 
ON public.progresso_fases USING GIN (leituras_semanais_concluidas);

-- Função para verificar se uma semana foi concluída baseado nos capítulos lidos
CREATE OR REPLACE FUNCTION verificar_semana_leitura_concluida_real(
  p_discipulo_id UUID,
  p_semana_numero INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_capitulos_semana INTEGER[];
  v_capitulos_lidos INTEGER[];
  v_capitulo INTEGER;
  v_todos_lidos BOOLEAN := TRUE;
BEGIN
  -- Buscar os capítulos da semana do plano de leitura
  SELECT capitulos_semana INTO v_capitulos_semana
  FROM plano_leitura_biblica
  WHERE semana = p_semana_numero;

  -- Se não encontrou a semana, retornar false
  IF v_capitulos_semana IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Buscar os capítulos que o discípulo já leu
  SELECT capitulos_lidos INTO v_capitulos_lidos
  FROM leituras_capitulos
  WHERE discipulo_id = p_discipulo_id;

  -- Se não tem registro de leitura, retornar false
  IF v_capitulos_lidos IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verificar se TODOS os capítulos da semana estão nos capítulos lidos
  FOREACH v_capitulo IN ARRAY v_capitulos_semana
  LOOP
    IF NOT (v_capitulo = ANY(v_capitulos_lidos)) THEN
      v_todos_lidos := FALSE;
      EXIT;
    END IF;
  END LOOP;

  RETURN v_todos_lidos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para marcar semana como concluída no progresso
CREATE OR REPLACE FUNCTION marcar_semana_concluida(
  p_discipulo_id UUID,
  p_fase_numero INTEGER,
  p_passo_numero INTEGER,
  p_semana_numero INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_semanas_atuais INTEGER[];
  v_semana_realmente_concluida BOOLEAN;
BEGIN
  -- Verificar se a semana foi realmente concluída (capítulos lidos)
  SELECT verificar_semana_leitura_concluida_real(p_discipulo_id, p_semana_numero)
  INTO v_semana_realmente_concluida;

  IF NOT v_semana_realmente_concluida THEN
    RAISE EXCEPTION 'Semana % não foi concluída. Complete todos os capítulos primeiro.', p_semana_numero;
  END IF;

  -- Buscar semanas já marcadas
  SELECT leituras_semanais_concluidas INTO v_semanas_atuais
  FROM progresso_fases
  WHERE discipulo_id = p_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero;

  -- Se não existe registro, retornar false
  IF v_semanas_atuais IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Se já está marcada, não fazer nada
  IF p_semana_numero = ANY(v_semanas_atuais) THEN
    RETURN TRUE;
  END IF;

  -- Adicionar semana ao array
  UPDATE progresso_fases
  SET leituras_semanais_concluidas = array_append(leituras_semanais_concluidas, p_semana_numero)
  WHERE discipulo_id = p_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter XP de leitura do discípulo (usa tabela leituras_capitulos)
CREATE OR REPLACE FUNCTION obter_xp_leitura(p_discipulo_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  SELECT COALESCE(xp_acumulado_leitura, 0) INTO v_xp
  FROM leituras_capitulos
  WHERE discipulo_id = p_discipulo_id;

  RETURN COALESCE(v_xp, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para facilitar consulta do progresso completo
CREATE OR REPLACE VIEW v_progresso_completo AS
SELECT 
  pf.*,
  lc.capitulos_lidos,
  lc.xp_acumulado_leitura,
  d.nome_completo_temp as nome_discipulo
FROM progresso_fases pf
LEFT JOIN leituras_capitulos lc ON lc.discipulo_id = pf.discipulo_id
LEFT JOIN discipulos d ON d.id = pf.discipulo_id;

-- Mensagem de sucesso
SELECT 'Sistema de leitura bíblica integrado com sucesso!' as message;
SELECT 'Sem redundância: XP vem de leituras_capitulos, apenas rastreamento de semanas em progresso_fases' as info;
SELECT 'Use verificar_semana_leitura_concluida_real() para checar se semana foi concluída' as funcao1;
SELECT 'Use marcar_semana_concluida() para marcar semana no progresso' as funcao2;
SELECT 'Use obter_xp_leitura() para buscar XP de leitura do discípulo' as funcao3;
