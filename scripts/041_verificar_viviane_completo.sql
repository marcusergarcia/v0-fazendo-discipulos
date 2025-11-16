-- Verifica todos os dados da Viviane
SELECT 
  'Viviane na tabela discipulos' as origem,
  id,
  discipulador_id,
  user_id,
  nome_completo_temp,
  email_temporario,
  aprovado_discipulador,
  status
FROM discipulos
WHERE email_temporario = 'vivianegarciia4@gmail.com';
