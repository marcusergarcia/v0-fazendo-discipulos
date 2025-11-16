-- Script para verificar notificações criadas

-- Buscar o user_id do Marcus
SELECT 
  id as marcus_user_id,
  email
FROM auth.users
WHERE email = 'marcus.macintel@terra.com.br';

-- Buscar todas as notificações na tabela
SELECT 
  id,
  user_id,
  tipo,
  titulo,
  mensagem,
  link,
  lida,
  created_at
FROM notificacoes
ORDER BY created_at DESC
LIMIT 10;

-- Verificar se há notificações para o Marcus
SELECT 
  n.id,
  n.user_id,
  n.tipo,
  n.titulo,
  n.mensagem,
  n.lida,
  n.created_at,
  u.email as email_destinatario
FROM notificacoes n
JOIN auth.users u ON u.id = n.user_id
WHERE u.email = 'marcus.macintel@terra.com.br'
ORDER BY n.created_at DESC;

-- Verificar o último discípulo cadastrado
SELECT 
  id,
  discipulador_id,
  nome_completo_temp,
  email_temporario,
  aprovado_discipulador,
  status,
  created_at
FROM discipulos
WHERE aprovado_discipulador = false
ORDER BY created_at DESC
LIMIT 1;
