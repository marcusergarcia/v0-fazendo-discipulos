-- Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Discípulos podem criar suas próprias reflexões" ON reflexoes_conteudo;
DROP POLICY IF EXISTS "Discípulos podem ver suas próprias reflexões" ON reflexoes_conteudo;
DROP POLICY IF EXISTS "Discipuladores podem ver reflexões de seus discípulos" ON reflexoes_conteudo;
DROP POLICY IF EXISTS "Discípulos podem atualizar suas próprias reflexões" ON reflexoes_conteudo;

-- Política para INSERT: Discípulo pode inserir reflexões onde o discipulo_id corresponde ao seu registro
CREATE POLICY "discipulos_insert_reflexoes"
ON reflexoes_conteudo
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM discipulos
    WHERE discipulos.id = reflexoes_conteudo.discipulo_id
    AND discipulos.user_id = auth.uid()
  )
);

-- Política para SELECT: Discípulo pode ver suas próprias reflexões
CREATE POLICY "discipulos_select_reflexoes"
ON reflexoes_conteudo
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM discipulos
    WHERE discipulos.id = reflexoes_conteudo.discipulo_id
    AND discipulos.user_id = auth.uid()
  )
);

-- Política para SELECT: Discipulador pode ver reflexões de seus discípulos
CREATE POLICY "discipuladores_select_reflexoes"
ON reflexoes_conteudo
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM discipulos d
    WHERE d.id = reflexoes_conteudo.discipulo_id
    AND d.discipulador_id = auth.uid()
  )
);

-- Política para UPDATE: Discípulo pode atualizar suas próprias reflexões
CREATE POLICY "discipulos_update_reflexoes"
ON reflexoes_conteudo
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM discipulos
    WHERE discipulos.id = reflexoes_conteudo.discipulo_id
    AND discipulos.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM discipulos
    WHERE discipulos.id = reflexoes_conteudo.discipulo_id
    AND discipulos.user_id = auth.uid()
  )
);
