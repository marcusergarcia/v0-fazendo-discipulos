-- Adicionar policy de UPDATE para discipuladores atualizarem reflexões
-- Permite que discipuladores atualizem reflexões de seus discípulos

CREATE POLICY "Discipuladores podem atualizar reflexões de seus discípulos"
ON reflexoes_conteudo
FOR UPDATE
TO authenticated
USING (
  discipulador_id = auth.uid()
)
WITH CHECK (
  discipulador_id = auth.uid()
);
