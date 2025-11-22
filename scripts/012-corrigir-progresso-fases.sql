-- Script para corrigir a tabela progresso_fases
-- 1. Atualizar reflexoes_concluidas com valores corretos
-- 2. Remover campos duplicados (nivel e passo)
-- 3. Criar função para atualizar automaticamente reflexoes_concluidas

-- PASSO 1: Atualizar reflexoes_concluidas contando reflexões aprovadas
UPDATE progresso_fases pf
SET reflexoes_concluidas = (
  SELECT COUNT(*)
  FROM reflexoes_conteudo rc
  WHERE rc.discipulo_id = pf.discipulo_id
    AND rc.passo_numero = pf.passo_numero
    AND rc.situacao = 'aprovado'
);

-- PASSO 2: Verificar se os campos duplicados realmente têm os mesmos valores
DO $$
BEGIN
  -- Verificar se fase_numero == nivel
  IF EXISTS (
    SELECT 1 FROM progresso_fases WHERE fase_numero != nivel
  ) THEN
    RAISE EXCEPTION 'ATENÇÃO: fase_numero e nivel têm valores diferentes! Verifique antes de remover.';
  END IF;

  -- Verificar se passo_numero == passo
  IF EXISTS (
    SELECT 1 FROM progresso_fases WHERE passo_numero != passo
  ) THEN
    RAISE EXCEPTION 'ATENÇÃO: passo_numero e passo têm valores diferentes! Verifique antes de remover.';
  END IF;

  RAISE NOTICE 'Verificação concluída: campos duplicados têm valores idênticos';
END $$;

-- PASSO 3: Remover campos duplicados (nivel e passo)
ALTER TABLE progresso_fases DROP COLUMN IF EXISTS nivel;
ALTER TABLE progresso_fases DROP COLUMN IF EXISTS passo;

-- PASSO 4: Criar função para atualizar automaticamente reflexoes_concluidas
-- quando uma reflexão é aprovada
CREATE OR REPLACE FUNCTION atualizar_reflexoes_concluidas()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a reflexão foi aprovada, atualizar o contador
  IF NEW.situacao = 'aprovado' AND (OLD.situacao IS NULL OR OLD.situacao != 'aprovado') THEN
    UPDATE progresso_fases
    SET reflexoes_concluidas = reflexoes_concluidas + 1
    WHERE discipulo_id = NEW.discipulo_id
      AND passo_numero = NEW.passo_numero;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger se já existir
DROP TRIGGER IF EXISTS trigger_atualizar_reflexoes ON reflexoes_conteudo;

-- Criar trigger
CREATE TRIGGER trigger_atualizar_reflexoes
AFTER UPDATE ON reflexoes_conteudo
FOR EACH ROW
EXECUTE FUNCTION atualizar_reflexoes_concluidas();

-- PASSO 5: Mostrar estatísticas atualizadas
SELECT 
  d.id as discipulo_id,
  p.nome_completo as nome,
  pf.passo_numero,
  pf.reflexoes_concluidas,
  pf.pontuacao_total,
  pf.completado
FROM progresso_fases pf
JOIN discipulos d ON d.id = pf.discipulo_id
JOIN profiles p ON p.id = d.user_id
ORDER BY d.id, pf.passo_numero;
