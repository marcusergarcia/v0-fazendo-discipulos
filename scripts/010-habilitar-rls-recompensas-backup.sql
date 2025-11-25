-- Habilitar Row Level Security na tabela recompensas_backup (se existir)
ALTER TABLE IF EXISTS recompensas_backup ENABLE ROW LEVEL SECURITY;

-- Política: Apenas administradores e service_role podem acessar backup
CREATE POLICY "Apenas admins podem acessar backup de recompensas"
ON recompensas_backup
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');
