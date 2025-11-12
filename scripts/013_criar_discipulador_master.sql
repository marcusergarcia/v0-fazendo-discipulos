-- Script para criar o primeiro discipulador master do sistema
-- Este script deve ser executado uma única vez para configurar o primeiro discipulador

-- Adicionar constraint UNIQUE em user_id antes de usar ON CONFLICT
ALTER TABLE public.discipulos 
ADD CONSTRAINT discipulos_user_id_key UNIQUE (user_id);

-- Trabalhando com a tabela discipulos ao invés de profiles
-- Se não existir registro em discipulos para o primeiro usuário, criar um
INSERT INTO public.discipulos (user_id, discipulador_id, nivel_atual, xp_total, fase_atual, passo_atual, aprovado_discipulador, data_aprovacao_discipulador)
SELECT 
  id, 
  NULL, -- Master não tem discipulador
  'Multiplicador', -- Nível máximo com armadura completa
  1000, -- XP inicial adequado
  1, -- Começa na fase 1
  1, -- Começa no passo 1
  TRUE, -- Master já está aprovado automaticamente
  NOW() -- Data de aprovação imediata
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.discipulos)
LIMIT 1
ON CONFLICT (user_id) DO UPDATE
SET 
  discipulador_id = NULL,
  xp_total = 1000,
  nivel_atual = 'Multiplicador',
  aprovado_discipulador = TRUE, -- Garante que master está aprovado
  data_aprovacao_discipulador = NOW();

-- Configura o primeiro usuário do sistema como discipulador master sem necessidade de aprovação
