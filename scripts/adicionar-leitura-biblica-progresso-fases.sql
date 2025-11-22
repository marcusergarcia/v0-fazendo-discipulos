-- Script para adicionar campos de leitura bíblica ao sistema de progresso de fases
-- Permite rastrear quais semanas de leitura foram concluídas e o XP ganho

-- Adicionar campo para rastrear semanas de leitura concluídas
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS leituras_semanais_concluidas INTEGER[] DEFAULT '{}';

-- Adicionar campo para XP acumulado de leitura bíblica
ALTER TABLE public.progresso_fases
ADD COLUMN IF NOT EXISTS xp_leitura_biblica INTEGER DEFAULT 0;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.progresso_fases.leituras_semanais_concluidas IS 
'Array com os números das semanas de leitura bíblica que foram concluídas (ex: [1, 2, 3])';

COMMENT ON COLUMN public.progresso_fases.xp_leitura_biblica IS 
'XP total acumulado através das leituras bíblicas semanais';

-- Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_progresso_leituras_semana 
ON public.progresso_fases USING GIN (leituras_semanais_concluidas);

-- Função auxiliar para adicionar semana concluída ao progresso
CREATE OR REPLACE FUNCTION adicionar_semana_leitura_concluida(
  p_discipulo_id UUID,
  p_fase_numero INTEGER,
  p_passo_numero INTEGER,
  p_semana_numero INTEGER,
  p_xp_ganho INTEGER DEFAULT 50
)
RETURNS BOOLEAN AS $$
DECLARE
  v_semanas_atuais INTEGER[];
BEGIN
  -- Buscar semanas já concluídas
  SELECT leituras_semanais_concluidas INTO v_semanas_atuais
  FROM progresso_fases
  WHERE discipulo_id = p_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero;

  -- Se o registro não existe, retornar false
  IF v_semanas_atuais IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Se a semana já foi concluída, não adicionar novamente
  IF p_semana_numero = ANY(v_semanas_atuais) THEN
    RETURN TRUE;
  END IF;

  -- Adicionar semana ao array e atualizar XP
  UPDATE progresso_fases
  SET 
    leituras_semanais_concluidas = array_append(leituras_semanais_concluidas, p_semana_numero),
    xp_leitura_biblica = COALESCE(xp_leitura_biblica, 0) + p_xp_ganho
  WHERE discipulo_id = p_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se semana de leitura foi concluída
CREATE OR REPLACE FUNCTION verificar_semana_leitura_concluida(
  p_discipulo_id UUID,
  p_fase_numero INTEGER,
  p_passo_numero INTEGER,
  p_semana_numero INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_semanas_concluidas INTEGER[];
BEGIN
  SELECT leituras_semanais_concluidas INTO v_semanas_concluidas
  FROM progresso_fases
  WHERE discipulo_id = p_discipulo_id
    AND fase_numero = p_fase_numero
    AND passo_numero = p_passo_numero;

  -- Se não encontrou registro ou array é nulo, retornar false
  IF v_semanas_concluidas IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verificar se a semana está no array
  RETURN (p_semana_numero = ANY(v_semanas_concluidas));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensagem de sucesso
SELECT 'Campos de leitura bíblica adicionados com sucesso!' as message;
SELECT 'Use adicionar_semana_leitura_concluida() para marcar semanas como concluídas' as info;
SELECT 'Use verificar_semana_leitura_concluida() para verificar se uma semana foi concluída' as info2;
