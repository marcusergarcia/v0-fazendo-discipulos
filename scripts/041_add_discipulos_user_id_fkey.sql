-- Adiciona foreign key entre discipulos.user_id e profiles.id
ALTER TABLE discipulos
ADD CONSTRAINT discipulos_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Adiciona foreign key entre discipulos.discipulador_id e profiles.id
ALTER TABLE discipulos
ADD CONSTRAINT discipulos_discipulador_id_fkey 
FOREIGN KEY (discipulador_id) 
REFERENCES profiles(id)
ON DELETE SET NULL;
