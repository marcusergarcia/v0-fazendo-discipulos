-- Limpar as perguntas reflexivas da tabela historico_respostas_passo
-- Elas agora serão armazenadas na tabela perguntas_reflexivas

DELETE FROM historico_respostas_passo
WHERE tipo_resposta = 'reflexao_guiada';
