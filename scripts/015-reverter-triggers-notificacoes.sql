-- Script 015: Reverter triggers problemáticos que estavam deletando reflexões

-- Remover os triggers criados no script 014 que estavam causando problemas
DROP TRIGGER IF EXISTS trigger_limpar_notificacao_reflexao ON reflexoes_conteudo;
DROP TRIGGER IF EXISTS trigger_limpar_notificacao_resposta ON historico_respostas_passo;

-- Remover a função problemática
DROP FUNCTION IF EXISTS limpar_notificacao_apos_aprovacao();

-- As políticas RLS de DELETE são mantidas pois estão corretas
-- DROP POLICY "Deletar próprias notificações" ON notificacoes; -- Mantido
-- DROP POLICY "Sistema pode deletar notificações" ON notificacoes; -- Mantido

-- Comentário explicativo
COMMENT ON TABLE notificacoes IS 
  'Notificações são deletadas via código TypeScript quando reflexões/respostas são aprovadas. 
   NÃO use triggers automáticos pois não há campo notificacao_id nas tabelas de origem.';
