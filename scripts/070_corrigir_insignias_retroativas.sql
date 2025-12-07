-- Corrigir insígnias retroativamente para todos os discípulos
-- Baseado no passo_atual, adicionar todas as insígnias que faltam

DO $$
DECLARE
  disc RECORD;
  passo_num INTEGER;
  insignia_texto TEXT;
BEGIN
  -- Para cada discípulo
  FOR disc IN 
    SELECT d.id, d.passo_atual, r.insignias
    FROM discipulos d
    JOIN recompensas r ON r.discipulo_id = d.id
    WHERE d.passo_atual > 1
  LOOP
    -- Adicionar insígnias para todos os passos completados (1 até passo_atual - 1)
    FOR passo_num IN 1..(disc.passo_atual - 1) LOOP
      insignia_texto := 'Passo ' || passo_num || ' Concluído';
      
      -- Verificar se a insígnia já existe
      IF NOT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements_text(disc.insignias) as i
        WHERE i = insignia_texto
      ) THEN
        -- Adicionar insígnia que falta
        UPDATE recompensas
        SET insignias = COALESCE(insignias, '[]'::jsonb) || jsonb_build_array(insignia_texto)
        WHERE discipulo_id = disc.id;
        
        RAISE NOTICE 'Adicionada insígnia "%" para discípulo %', insignia_texto, disc.id;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Verificar resultado
SELECT 
  d.nome_completo_temp,
  d.passo_atual,
  COALESCE(jsonb_array_length(r.insignias), 0) as total_insignias,
  r.insignias
FROM discipulos d
JOIN recompensas r ON r.discipulo_id = d.id
WHERE d.passo_atual > 1
ORDER BY d.nome_completo_temp;
