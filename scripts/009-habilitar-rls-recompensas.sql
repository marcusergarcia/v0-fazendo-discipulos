-- Habilitar Row Level Security na tabela recompensas
ALTER TABLE recompensas ENABLE ROW LEVEL SECURITY;

-- Política: Discípulos podem ver apenas suas próprias recompensas
CREATE POLICY "Discípulos podem ver suas próprias recompensas"
ON recompensas
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM discipulos WHERE id = recompensas.discipulo_id
  )
);

-- Política: Apenas o sistema (service_role) pode inserir/atualizar recompensas
CREATE POLICY "Sistema pode gerenciar recompensas"
ON recompensas
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Política: Discipuladores podem ver recompensas de seus discípulos
CREATE POLICY "Discipuladores podem ver recompensas de seus discípulos"
ON recompensas
FOR SELECT
USING (
  auth.uid() IN (
    SELECT d.discipulador_id 
    FROM discipulos d
    WHERE d.id = recompensas.discipulo_id
  )
);
