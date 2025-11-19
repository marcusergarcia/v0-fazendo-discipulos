-- Script para deletar notificações de "Novo Discípulo Aguardando Aprovação" 
-- Este script é útil para testar o fluxo de notificações novamente

-- Deletar todas as notificações de tipo "novo_discipulo" ou que contenham "Aguardando Aprovação" no título
DELETE FROM notificacoes 
WHERE tipo = 'novo_discipulo' 
   OR titulo ILIKE '%Aguardando Aprovação%'
   OR titulo ILIKE '%aguardando aprovação%';

-- Ou se preferir deletar apenas as notificações não lidas:
-- DELETE FROM notificacoes 
-- WHERE (tipo = 'novo_discipulo' OR titulo ILIKE '%Aguardando Aprovação%')
--   AND lida = false;

-- Ou se preferir deletar notificações de um discipulador específico:
-- DELETE FROM notificacoes 
-- WHERE (tipo = 'novo_discipulo' OR titulo ILIKE '%Aguardando Aprovação%')
--   AND user_id = 'SEU_USER_ID_AQUI';
