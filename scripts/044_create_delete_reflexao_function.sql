-- Criar função para excluir reflexão e notificação associada
CREATE OR REPLACE FUNCTION delete_reflexao_com_notificacao(reflexao_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notificacoes_excluidas integer := 0;
  reflexoes_excluidas integer := 0;
BEGIN
  -- Excluir notificações associadas
  DELETE FROM notificacoes 
  WHERE reflexao_id = reflexao_id_param;
  
  GET DIAGNOSTICS notificacoes_excluidas = ROW_COUNT;
  
  -- Excluir reflexão
  DELETE FROM reflexoes_conteudo 
  WHERE id = reflexao_id_param;
  
  GET DIAGNOSTICS reflexoes_excluidas = ROW_COUNT;
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'notificacoes_excluidas', notificacoes_excluidas,
    'reflexoes_excluidas', reflexoes_excluidas
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Dar permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION delete_reflexao_com_notificacao(uuid) TO authenticated;

COMMENT ON FUNCTION delete_reflexao_com_notificacao IS 'Exclui uma reflexão e suas notificações associadas, bypassando RLS';
