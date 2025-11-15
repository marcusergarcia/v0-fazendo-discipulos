-- Debug: Verificar se há reflexões no banco
SELECT 
  r.id,
  r.discipulo_id,
  r.conteudo_id,
  r.tipo_conteudo,
  r.reflexao,
  r.created_at,
  d.nome_completo_temp as nome_discipulo,
  p.nome_completo as nome_perfil
FROM reflexoes_conteudo r
LEFT JOIN discipulos d ON r.discipulo_id = d.id
LEFT JOIN profiles p ON d.user_id = p.user_id
ORDER BY r.created_at DESC
LIMIT 10;

-- Verificar políticas RLS da tabela reflexoes_conteudo
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reflexoes_conteudo';
