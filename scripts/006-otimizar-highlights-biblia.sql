-- Migração para otimizar highlights_biblia
-- De: uma linha por marcação
-- Para: uma linha por usuário por capítulo com array JSON de marcações

-- 1. Criar nova tabela otimizada
CREATE TABLE IF NOT EXISTS highlights_biblia_novo (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  livro_id INTEGER NOT NULL,
  numero_capitulo INTEGER NOT NULL,
  marcacoes JSONB DEFAULT '[]'::jsonb, -- Array de {texto: string, cor: string, id: number}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, livro_id, numero_capitulo)
);

-- 2. Migrar dados existentes para novo formato consolidado
INSERT INTO highlights_biblia_novo (usuario_id, livro_id, numero_capitulo, marcacoes, created_at)
SELECT 
  usuario_id,
  livro_id,
  numero_capitulo,
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'texto', texto_selecionado,
      'cor', cor
    )
  ) as marcacoes,
  MIN(created_at) as created_at
FROM highlights_biblia
GROUP BY usuario_id, livro_id, numero_capitulo
ON CONFLICT (usuario_id, livro_id, numero_capitulo) DO NOTHING;

-- 3. Backup da tabela antiga
ALTER TABLE highlights_biblia RENAME TO highlights_biblia_backup;

-- 4. Renomear nova tabela
ALTER TABLE highlights_biblia_novo RENAME TO highlights_biblia;

-- 5. Habilitar RLS
ALTER TABLE highlights_biblia ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
CREATE POLICY "Usuários podem gerenciar seus highlights" 
ON highlights_biblia
FOR ALL
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- 7. Criar índices para performance
CREATE INDEX idx_highlights_usuario ON highlights_biblia(usuario_id);
CREATE INDEX idx_highlights_capitulo ON highlights_biblia(livro_id, numero_capitulo);

-- 8. Adicionar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_highlights_timestamp
BEFORE UPDATE ON highlights_biblia
FOR EACH ROW
EXECUTE FUNCTION update_highlights_updated_at();

COMMENT ON TABLE highlights_biblia IS 'Armazena marcações de texto da Bíblia consolidadas por usuário/capítulo';
COMMENT ON COLUMN highlights_biblia.marcacoes IS 'Array JSON de marcações: [{id: number, texto: string, cor: string}]';
