-- Dump completo dos dados da Viviane para ver o que realmente existe no banco

DO $$
DECLARE
  viviane_user_id uuid := 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';
BEGIN
  RAISE NOTICE '=== DUMP COMPLETO DOS DADOS DA VIVIANE ===';
  RAISE NOTICE '';
  RAISE NOTICE 'User ID da Viviane: %', viviane_user_id;
  RAISE NOTICE '';
END $$;

-- Corrigir coluna "nome" para "nome_completo_temp" e adicionar mais colunas
-- 1. Dados da tabela discipulos
SELECT 
  'TABELA DISCIPULOS' as tabela,
  id,
  user_id,
  discipulador_id,
  nome_completo_temp,
  fase_atual,
  passo_atual,
  xp_total,
  status
FROM public.discipulos
WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c';

-- Corrigir colunas de progresso_fases conforme schema real
-- 2. Dados da tabela progresso_fases
SELECT 
  'TABELA PROGRESSO_FASES' as tabela,
  id,
  discipulo_id,
  fase_numero,
  passo_numero,
  completado,
  enviado_para_validacao,
  status_validacao,
  resposta_missao,
  resposta_pergunta,
  data_envio_validacao,
  data_completado
FROM public.progresso_fases
WHERE discipulo_id IN (
  SELECT id FROM public.discipulos 
  WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
)
ORDER BY fase_numero, passo_numero;

-- Adicionar mais colunas de reflexoes_conteudo
-- 3. Dados da tabela reflexoes_conteudo
SELECT 
  'TABELA REFLEXOES_CONTEUDO' as tabela,
  id,
  discipulo_id,
  fase_numero,
  passo_numero,
  tipo,
  conteudo_id,
  reflexao,
  data_criacao
FROM public.reflexoes_conteudo
WHERE discipulo_id IN (
  SELECT id FROM public.discipulos 
  WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
)
ORDER BY data_criacao DESC;

-- Adicionar mais colunas de notificacoes
-- 4. Dados da tabela notificacoes
SELECT 
  'TABELA NOTIFICACOES' as tabela,
  id,
  user_id,
  tipo,
  titulo,
  mensagem,
  lida,
  link,
  created_at
FROM public.notificacoes
WHERE user_id = 'f7ff6309-32a3-45c8-96a6-b76a687f2e7a' -- Marcus (discipulador)
ORDER BY created_at DESC
LIMIT 10;

-- 5. Dados da tabela mensagens
SELECT 
  'TABELA MENSAGENS' as tabela,
  id,
  discipulo_id,
  remetente_id,
  mensagem,
  created_at
FROM public.mensagens
WHERE discipulo_id IN (
  SELECT id FROM public.discipulos 
  WHERE user_id = 'a0e1c579-92f5-42a8-84cc-faf1bbebd73c'
)
ORDER BY created_at DESC
LIMIT 10;
