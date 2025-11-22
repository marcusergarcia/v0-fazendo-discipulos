-- Script 014: Corrigir políticas RLS de notificações para permitir DELETE
-- e adicionar trigger automático de limpeza

-- Adicionar política para permitir que usuários deletem suas próprias notificações
DROP POLICY IF EXISTS "Deletar próprias notificações" ON notificacoes;
CREATE POLICY "Deletar próprias notificações"
  ON notificacoes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Adicionar política para permitir que o sistema (service role) delete notificações
DROP POLICY IF EXISTS "Sistema pode deletar notificações" ON notificacoes;
CREATE POLICY "Sistema pode deletar notificações"
  ON notificacoes
  FOR DELETE
  TO service_role
  USING (true);

-- Criar função para limpar notificações antigas automaticamente quando reflexão/resposta é aprovada
CREATE OR REPLACE FUNCTION limpar_notificacao_apos_aprovacao()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a situacao mudou para 'aprovado', deletar a notificação associada
  IF NEW.situacao = 'aprovado' AND OLD.situacao != 'aprovado' THEN
    DELETE FROM notificacoes 
    WHERE id = NEW.notificacao_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para reflexoes_conteudo
DROP TRIGGER IF EXISTS trigger_limpar_notificacao_reflexao ON reflexoes_conteudo;
CREATE TRIGGER trigger_limpar_notificacao_reflexao
  AFTER UPDATE ON reflexoes_conteudo
  FOR EACH ROW
  WHEN (NEW.situacao = 'aprovado' AND OLD.situacao IS DISTINCT FROM 'aprovado')
  EXECUTE FUNCTION limpar_notificacao_apos_aprovacao();

-- Criar trigger para historico_respostas_passo
DROP TRIGGER IF EXISTS trigger_limpar_notificacao_resposta ON historico_respostas_passo;
CREATE TRIGGER trigger_limpar_notificacao_resposta
  AFTER UPDATE ON historico_respostas_passo
  FOR EACH ROW
  WHEN (NEW.situacao = 'aprovado' AND OLD.situacao IS DISTINCT FROM 'aprovado')
  EXECUTE FUNCTION limpar_notificacao_apos_aprovacao();

-- Comentários para documentação
COMMENT ON POLICY "Deletar próprias notificações" ON notificacoes IS 
  'Permite que usuários deletem suas próprias notificações';
  
COMMENT ON POLICY "Sistema pode deletar notificações" ON notificacoes IS 
  'Permite que o sistema (service role) delete qualquer notificação';
  
COMMENT ON FUNCTION limpar_notificacao_apos_aprovacao() IS 
  'Remove automaticamente notificações quando reflexões ou respostas são aprovadas';
