-- Sistema de Armadura de Deus (Efésios 6)

-- Adicionar campos de armadura ao perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS armadura JSONB DEFAULT '{
  "capacete": false,
  "couraca": false,
  "cinto": false,
  "calcado": false,
  "escudo": false,
  "espada": false
}'::jsonb;

-- Tabela para rastrear conquistas de armadura
CREATE TABLE IF NOT EXISTS armadura_conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  peca TEXT NOT NULL CHECK (peca IN ('capacete', 'couraca', 'cinto', 'calcado', 'escudo', 'espada')),
  conquistada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  passo_relacionado INTEGER,
  UNIQUE(user_id, peca)
);

-- RLS para armadura_conquistas
ALTER TABLE armadura_conquistas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own armadura conquistas"
  ON armadura_conquistas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own armadura conquistas"
  ON armadura_conquistas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Função para desbloquear peça de armadura
CREATE OR REPLACE FUNCTION desbloquear_armadura(p_user_id UUID, p_peca TEXT, p_passo INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir conquista
  INSERT INTO armadura_conquistas (user_id, peca, passo_relacionado)
  VALUES (p_user_id, p_peca, p_passo)
  ON CONFLICT (user_id, peca) DO NOTHING;
  
  -- Atualizar campo armadura no perfil
  UPDATE profiles
  SET armadura = jsonb_set(armadura, ARRAY[p_peca], 'true'::jsonb)
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Mapeamento de passos para peças de armadura (Fase 2)
COMMENT ON FUNCTION desbloquear_armadura IS '
Mapeamento sugerido (Fase 2 - baseado em Efésios 6):
- Passo 11-12: Cinturão da Verdade (Efésios 6:14a)
- Passo 13-14: Couraça da Justiça (Efésios 6:14b)
- Passo 15-16: Calçado da Paz (Efésios 6:15)
- Passo 17-18: Escudo da Fé (Efésios 6:16)
- Passo 19-20: Capacete da Salvação (Efésios 6:17a)
- Passo 21-22: Espada do Espírito (Efésios 6:17b)
';
