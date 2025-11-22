-- Script para adicionar campo discipulo_id na tabela leituras_capitulos e migrar dados
-- Este script mantém compatibilidade com o campo usuario_id existente

-- 1. Adicionar campo discipulo_id (permitindo NULL temporariamente)
ALTER TABLE leituras_capitulos 
ADD COLUMN IF NOT EXISTS discipulo_id UUID REFERENCES discipulos(id) ON DELETE CASCADE;

-- 2. Migrar dados: preencher discipulo_id com base no usuario_id
UPDATE leituras_capitulos lc
SET discipulo_id = d.id
FROM discipulos d
WHERE lc.usuario_id = d.user_id
AND lc.discipulo_id IS NULL;

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_leituras_capitulos_discipulo 
ON leituras_capitulos(discipulo_id);

-- 4. Atualizar políticas RLS para usar tanto usuario_id quanto discipulo_id
DROP POLICY IF EXISTS "Usuários podem gerenciar suas leituras" ON leituras_capitulos;

-- Política para discípulos gerenciarem suas leituras usando discipulo_id
CREATE POLICY "Discípulos podem gerenciar suas leituras via discipulo_id"
ON leituras_capitulos FOR ALL
USING (
  discipulo_id IN (
    SELECT id FROM discipulos WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  discipulo_id IN (
    SELECT id FROM discipulos WHERE user_id = auth.uid()
  )
);

-- Política para compatibilidade com usuario_id
CREATE POLICY "Usuários podem gerenciar suas leituras via usuario_id"
ON leituras_capitulos FOR ALL
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- 5. Adicionar política para discipuladores verem leituras de seus discípulos
CREATE POLICY "Discipuladores podem ver leituras de seus discípulos"
ON leituras_capitulos FOR SELECT
USING (
  discipulo_id IN (
    SELECT id FROM discipulos WHERE discipulador_id IN (
      SELECT id FROM discipulos WHERE user_id = auth.uid()
    )
  )
);

-- 6. Relatório de migração
SELECT 
  'Migração concluída!' as status,
  COUNT(*) as total_registros,
  COUNT(discipulo_id) as registros_com_discipulo_id,
  COUNT(*) - COUNT(discipulo_id) as registros_sem_discipulo_id
FROM leituras_capitulos;

-- 7. Mostrar registros que não foram migrados (se houver)
SELECT 
  lc.id,
  lc.usuario_id,
  au.email
FROM leituras_capitulos lc
LEFT JOIN auth.users au ON lc.usuario_id = au.id
WHERE lc.discipulo_id IS NULL
ORDER BY lc.created_at DESC;
