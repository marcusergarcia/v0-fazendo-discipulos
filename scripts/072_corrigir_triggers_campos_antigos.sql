-- Corrigir todas as funções de trigger que usam campos antigos

-- 1. Corrigir função atualizar_reflexoes_concluidas
CREATE OR REPLACE FUNCTION atualizar_reflexoes_concluidas()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contagem de reflexões concluídas no progresso_fases
  -- Como há apenas UMA linha por discípulo, buscamos apenas por discipulo_id
  UPDATE progresso_fases
  SET 
    reflexoes_concluidas = (
      SELECT COUNT(*)
      FROM reflexoes_conteudo
      WHERE discipulo_id = NEW.discipulo_id
        AND situacao = 'aprovado'
    ),
    updated_at = NOW()
  WHERE discipulo_id = NEW.discipulo_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Corrigir função atualizar_videos_assistidos (se existir)
CREATE OR REPLACE FUNCTION atualizar_videos_assistidos()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contagem de vídeos assistidos
  UPDATE progresso_fases
  SET 
    videos_assistidos = (
      SELECT COUNT(*)
      FROM reflexoes_conteudo
      WHERE discipulo_id = NEW.discipulo_id
        AND tipo = 'video'
        AND situacao = 'aprovado'
    ),
    updated_at = NOW()
  WHERE discipulo_id = NEW.discipulo_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Corrigir função atualizar_artigos_lidos (se existir)
CREATE OR REPLACE FUNCTION atualizar_artigos_lidos()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contagem de artigos lidos
  UPDATE progresso_fases
  SET 
    artigos_lidos = (
      SELECT COUNT(*)
      FROM reflexoes_conteudo
      WHERE discipulo_id = NEW.discipulo_id
        AND tipo = 'artigo'
        AND situacao = 'aprovado'
    ),
    updated_at = NOW()
  WHERE discipulo_id = NEW.discipulo_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Corrigir função atualizar_perguntas_respondidas (se existir)
CREATE OR REPLACE FUNCTION atualizar_perguntas_respondidas()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contagem de perguntas respondidas
  UPDATE progresso_fases
  SET 
    perguntas_respondidas = (
      SELECT COUNT(*)
      FROM perguntas_reflexivas
      WHERE discipulo_id = NEW.discipulo_id
        AND situacao = 'aprovado'
    ),
    updated_at = NOW()
  WHERE discipulo_id = NEW.discipulo_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Dropar colunas antigas se ainda existirem (com segurança)
DO $$ 
BEGIN
  -- Tentar remover passo_numero se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progresso_fases' 
    AND column_name = 'passo_numero'
  ) THEN
    ALTER TABLE progresso_fases DROP COLUMN passo_numero;
  END IF;

  -- Tentar remover fase_numero se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progresso_fases' 
    AND column_name = 'fase_numero'
  ) THEN
    ALTER TABLE progresso_fases DROP COLUMN fase_numero;
  END IF;

  -- Tentar remover pontuacao_total se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progresso_fases' 
    AND column_name = 'pontuacao_total'
  ) THEN
    ALTER TABLE progresso_fases DROP COLUMN pontuacao_total;
  END IF;

  -- Tentar remover completado se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progresso_fases' 
    AND column_name = 'completado'
  ) THEN
    ALTER TABLE progresso_fases DROP COLUMN completado;
  END IF;
END $$;

-- 6. Verificar se há outras funções usando campos antigos
SELECT 
  routine_name,
  'Função pode precisar de correção: ' || routine_name as alerta
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
  AND (
    routine_definition ILIKE '%passo_numero%'
    OR routine_definition ILIKE '%fase_numero%'
    OR routine_definition ILIKE '%pontuacao_total%'
  )
  AND routine_name NOT IN (
    'atualizar_reflexoes_concluidas',
    'atualizar_videos_assistidos',
    'atualizar_artigos_lidos',
    'atualizar_perguntas_respondidas'
  );
