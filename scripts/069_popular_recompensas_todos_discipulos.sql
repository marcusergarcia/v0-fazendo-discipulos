-- MIGRAÇÃO: Popular recompensas com todos os discípulos
-- Garante que TODOS os discípulos têm um registro em recompensas desde o início

-- 1. Criar registros para discípulos que não têm recompensas
INSERT INTO recompensas (discipulo_id, insignias, medalhas, armaduras, nivel)
SELECT 
  d.id,
  '[]'::jsonb,  -- Array vazio de insígnias
  '[]'::jsonb,  -- Array vazio de medalhas
  '[]'::jsonb,  -- Array vazio de armaduras
  1             -- Nível inicial
FROM discipulos d
LEFT JOIN recompensas r ON r.discipulo_id = d.id
WHERE r.id IS NULL;

-- 2. Criar uma função para adicionar insígnia ao array (sem duplicar)
CREATE OR REPLACE FUNCTION adicionar_insignia(
  p_discipulo_id UUID,
  p_insignia TEXT
) RETURNS void AS $$
BEGIN
  UPDATE recompensas
  SET 
    insignias = CASE 
      WHEN insignias @> to_jsonb(p_insignia::text)
      THEN insignias  -- Já existe, não adiciona
      ELSE insignias || to_jsonb(p_insignia::text)  -- Adiciona ao array
    END,
    updated_at = now()
  WHERE discipulo_id = p_discipulo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger para criar recompensas automaticamente quando um novo discípulo é criado
CREATE OR REPLACE FUNCTION criar_recompensas_automaticamente()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO recompensas (discipulo_id, insignias, medalhas, armaduras, nivel)
  VALUES (NEW.id, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_criar_recompensas ON discipulos;
CREATE TRIGGER trigger_criar_recompensas
  AFTER INSERT ON discipulos
  FOR EACH ROW
  EXECUTE FUNCTION criar_recompensas_automaticamente();

-- 4. Verificar resultado
SELECT 
  (SELECT COUNT(*) FROM discipulos) as total_discipulos,
  (SELECT COUNT(*) FROM recompensas) as total_recompensas,
  CASE 
    WHEN (SELECT COUNT(*) FROM discipulos) = (SELECT COUNT(*) FROM recompensas)
    THEN '✓ Todos os discípulos têm recompensas'
    ELSE '✗ Ainda faltam discípulos'
  END as status;
