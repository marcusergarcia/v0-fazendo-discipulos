-- Remove a tabela recompensas_backup que não é mais utilizada
-- Esta tabela foi criada como backup mas não é referenciada no código

DROP TABLE IF EXISTS recompensas_backup CASCADE;
