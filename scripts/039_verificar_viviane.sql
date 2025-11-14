-- Verificar o status atual da Viviane
SELECT 
  id,
  nome_completo_temp,
  email_temporario,
  discipulador_id,
  aprovado_discipulador,
  user_id,
  status,
  created_at
FROM discipulos
WHERE email_temporario = 'vivianegarciia4@gmail.com'
ORDER BY created_at DESC;

-- Verificar notificações relacionadas
SELECT 
  id,
  titulo,
  mensagem,
  link,
  lida,
  created_at,
  user_id
FROM notificacoes
WHERE mensagem ILIKE '%Viviane%'
ORDER BY created_at DESC;

-- Verificar todas as notificações do Marcus
SELECT 
  id,
  titulo,
  mensagem,
  link,
  lida,
  created_at
FROM notificacoes
WHERE user_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a'
ORDER BY created_at DESC;
