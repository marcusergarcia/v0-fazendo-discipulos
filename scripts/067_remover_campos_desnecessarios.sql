-- Script para remover campos desnecessários se você decidir manter progresso_fases
-- OU para limpar após migrar para progresso_discipulo

-- Opção 1: Se quiser usar a nova tabela progresso_discipulo
-- Renomear a antiga e usar a nova
ALTER TABLE IF EXISTS progresso_fases RENAME TO progresso_fases_backup;
ALTER TABLE IF EXISTS progresso_discipulo RENAME TO progresso_fases;

-- Atualizar referências no código (você precisará atualizar os arquivos TypeScript)
COMMENT ON TABLE progresso_fases IS 'Tabela otimizada: UMA linha por discípulo';

-- Opção 2: Se quiser manter progresso_fases e apenas consolidar
-- Remover duplicatas mantendo apenas a linha do passo atual
DELETE FROM progresso_fases_backup pf
WHERE NOT EXISTS (
  SELECT 1 FROM discipulos d
  WHERE d.id = pf.discipulo_id
    AND pf.fase_numero = COALESCE(d.fase_atual, 1)
    AND pf.passo_numero = COALESCE(d.passo_atual, 1)
);

-- Mensagem
DO $$
BEGIN
  RAISE NOTICE 'Migração aplicada! progresso_discipulo agora é progresso_fases.';
  RAISE NOTICE 'A tabela antiga foi renomeada para progresso_fases_backup.';
  RAISE NOTICE 'Você pode deletá-la após confirmar que tudo funciona: DROP TABLE progresso_fases_backup;';
END $$;
