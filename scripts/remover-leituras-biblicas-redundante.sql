-- Remover tabela leituras_biblicas que é redundante com o array capitulos_lidos
-- O array capitulos_lidos na tabela leituras_capitulos já rastreia tudo que precisamos

-- Drop políticas RLS primeiro
DROP POLICY IF EXISTS "Discípulos podem ver suas próprias leituras" ON leituras_biblicas;
DROP POLICY IF EXISTS "Discípulos podem inserir suas próprias leituras" ON leituras_biblicas;
DROP POLICY IF EXISTS "Discípulos podem atualizar suas próprias leituras" ON leituras_biblicas;
DROP POLICY IF EXISTS "Discipuladores podem ver leituras de seus discípulos" ON leituras_biblicas;

-- Drop índices
DROP INDEX IF EXISTS idx_leituras_discipulo;
DROP INDEX IF EXISTS idx_leituras_semana;
DROP INDEX IF EXISTS idx_leituras_confirmada;

-- Drop tabela
DROP TABLE IF EXISTS leituras_biblicas;

-- Mensagem de sucesso
SELECT 'Tabela leituras_biblicas removida com sucesso! Agora usando apenas array capitulos_lidos.' as message;
