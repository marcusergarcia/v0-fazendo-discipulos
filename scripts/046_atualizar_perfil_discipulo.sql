-- Atualizar dados do perfil do discípulo d4d131f7-de70-48e6-943b-840f6fe7c51d
-- Copia os dados temporários da tabela discipulos para a tabela profiles

UPDATE profiles
SET 
  nome_completo = COALESCE(
    (SELECT nome_completo_temp FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    nome_completo
  ),
  email = COALESCE(
    (SELECT email_temporario FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    email
  ),
  telefone = COALESCE(
    (SELECT telefone_temp FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    telefone
  ),
  data_nascimento = COALESCE(
    (SELECT data_nascimento_temp FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    data_nascimento
  ),
  genero = COALESCE(
    (SELECT genero_temp FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    genero
  ),
  etnia = COALESCE(
    (SELECT etnia_temp FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    etnia
  ),
  igreja = COALESCE(
    (SELECT igreja_temp FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    igreja
  ),
  foto_perfil_url = COALESCE(
    (SELECT foto_perfil_url_temp FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    foto_perfil_url
  ),
  data_cadastro = COALESCE(
    (SELECT data_cadastro FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    data_cadastro
  ),
  hora_cadastro = COALESCE(
    (SELECT hora_cadastro FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    hora_cadastro
  ),
  semana_cadastro = COALESCE(
    (SELECT semana_cadastro FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    semana_cadastro
  ),
  localizacao_cadastro = COALESCE(
    (SELECT localizacao_cadastro FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    localizacao_cadastro
  ),
  latitude_cadastro = COALESCE(
    (SELECT latitude_cadastro FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    latitude_cadastro
  ),
  longitude_cadastro = COALESCE(
    (SELECT longitude_cadastro FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    longitude_cadastro
  ),
  aceitou_lgpd = COALESCE(
    (SELECT aceitou_lgpd FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    aceitou_lgpd
  ),
  aceitou_compromisso = COALESCE(
    (SELECT aceitou_compromisso FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    aceitou_compromisso
  ),
  data_aceite_termos = COALESCE(
    (SELECT data_aceite_termos FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    data_aceite_termos
  ),
  status = COALESCE(
    (SELECT status FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d'),
    status
  ),
  updated_at = NOW()
WHERE id = (SELECT user_id FROM discipulos WHERE id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d');

-- Mostrar resultado
SELECT 
  p.id as profile_id,
  p.nome_completo,
  p.email,
  p.telefone,
  p.data_nascimento,
  p.genero,
  p.etnia,
  p.igreja,
  p.status,
  p.updated_at
FROM profiles p
JOIN discipulos d ON d.user_id = p.id
WHERE d.id = 'd4d131f7-de70-48e6-943b-840f6fe7c51d';
