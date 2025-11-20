-- Criando nova tabela otimizada com array de capítulos lidos

-- 1. Criar nova tabela com estrutura otimizada
CREATE TABLE IF NOT EXISTS leituras_capitulos_novo (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capitulos_lidos INTEGER[] DEFAULT '{}',
  xp_acumulado_leitura INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id)
);

-- 2. Migrar dados existentes (agrupar por usuário)
INSERT INTO leituras_capitulos_novo (usuario_id, capitulos_lidos, xp_acumulado_leitura)
SELECT 
  usuario_id,
  ARRAY_AGG(id) FILTER (WHERE lido = true) as capitulos_lidos,
  COUNT(*) FILTER (WHERE lido = true) * 5 as xp_acumulado_leitura
FROM leituras_capitulos
GROUP BY usuario_id
ON CONFLICT (usuario_id) DO NOTHING;

-- 3. Renomear tabelas (backup da antiga)
ALTER TABLE IF EXISTS leituras_capitulos RENAME TO leituras_capitulos_backup;
ALTER TABLE leituras_capitulos_novo RENAME TO leituras_capitulos;

-- 4. Configurar RLS
ALTER TABLE leituras_capitulos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem gerenciar suas leituras" ON leituras_capitulos;

CREATE POLICY "Usuários podem gerenciar suas leituras"
ON leituras_capitulos
FOR ALL
TO authenticated
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leituras_capitulos_usuario ON leituras_capitulos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_leituras_capitulos_array ON leituras_capitulos USING GIN(capitulos_lidos);

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at ON leituras_capitulos;

CREATE TRIGGER trigger_atualizar_updated_at
BEFORE UPDATE ON leituras_capitulos
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at();
