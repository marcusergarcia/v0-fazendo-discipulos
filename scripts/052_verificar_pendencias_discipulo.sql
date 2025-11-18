-- Verificar o que está faltando para o Pr. Marcus Emerson (user_id: f7ff6309-32a3-45c8-96a6-b76a687f2e7a)
-- Discípulo ID: d4d131f7-de70-48e6-943b-840f6fe7c51d

-- 1. Verificar reflexões do passo 1
SELECT 
  'REFLEXOES' as tipo,
  id,
  titulo,
  tipo as tipo_conteudo,
  conteudo_id,
  situacao,
  xp_ganho,
  data_criacao
FROM reflexoes_conteudo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND passo_numero = 1
ORDER BY data_criacao DESC;

-- 2. Verificar respostas das perguntas e missões do passo 1
SELECT 
  'RESPOSTAS' as tipo,
  id,
  pergunta,
  resposta_pergunta,
  missao_pratica,
  resposta_missao,
  situacao,
  xp_ganho,
  data_envio
FROM historico_respostas_passo
WHERE discipulo_id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'
  AND passo_numero = 1
ORDER BY data_envio DESC;

-- 3. Verificar progresso atual
SELECT 
  passo_atual,
  fase_atual,
  xp_total,
  status
FROM discipulos
WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';

-- 4. Resumo do que falta para liberar o passo 2:
-- Para liberar o passo 2, é necessário:
-- - Todas as reflexões do passo 1 devem ter situacao = 'aprovado'
-- - As respostas das perguntas/missões do passo 1 devem ter situacao = 'aprovado'
-- Se tudo estiver aprovado, execute o UPDATE abaixo:

-- DESCOMENTE A LINHA ABAIXO APÓS CONFIRMAR QUE TUDO ESTÁ APROVADO:
-- UPDATE discipulos SET passo_atual = 2 WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
