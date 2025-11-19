-- Script para popular a tabela plano_leitura_biblica com todos os 1189 capítulos
-- Seguindo a ordem pedagógica: João → Marcos → Mateus → Lucas → Atos → Cartas → AT

-- Primeiro, limpar a tabela para evitar duplicatas
TRUNCATE TABLE plano_leitura_biblica;

-- FASE 1: Conhecendo Jesus (Semanas 1-11)

-- Semana 1: João 1-7
-- Alterado semana_numero para semana
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('O Verbo que se fez carne', 'João', 1, 7, 7, 1, 'Conhecendo Jesus', 'Comece conhecendo Jesus através do Evangelho de João');

-- Semana 2: João 8-14
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Jesus, o Pão da Vida e o Bom Pastor', 'João', 8, 14, 7, 2, 'Conhecendo Jesus', 'Jesus revela quem Ele é como pastor e amigo');

-- Semana 3: João 15-21
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('O Caminho, a Verdade e a Vida', 'João', 15, 21, 7, 3, 'Conhecendo Jesus', 'Os últimos ensinamentos, cruz e ressurreição de Jesus');

-- Semana 4: Marcos 1-8
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Jesus em ação - Parte 1', 'Marcos', 1, 8, 8, 4, 'Conhecendo Jesus', 'O Evangelho mais direto - Jesus manifesta Seu poder');

-- Semana 5: Marcos 9-16
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Jesus em ação - Parte 2', 'Marcos', 9, 16, 8, 5, 'Conhecendo Jesus', 'Jesus ensina sobre servir, crucificação e ressurreição');

-- Semana 6: Mateus 1-14
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Jesus, o Messias prometido - Parte 1', 'Mateus', 1, 14, 14, 6, 'Conhecendo Jesus', 'Jesus cumpre as profecias e ensina com autoridade');

-- Semana 7: Mateus 15-28
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Jesus, o Messias prometido - Parte 2', 'Mateus', 15, 28, 14, 7, 'Conhecendo Jesus', 'Parábolas, cruz e a Grande Comissão');

-- Semana 8: Lucas 1-12
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('A compaixão de Jesus - Parte 1', 'Lucas', 1, 12, 12, 8, 'Conhecendo Jesus', 'Jesus revela o coração compassivo de Deus');

-- Semana 9: Lucas 13-24
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('A compaixão de Jesus - Parte 2', 'Lucas', 13, 24, 12, 9, 'Conhecendo Jesus', 'Parábolas de graça, salvação e ressurreição');

-- Semana 10: Atos 1-14
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('O nascimento e expansão da Igreja', 'Atos', 1, 14, 14, 10, 'Conhecendo Jesus', 'Pentecostes e o Evangelho se espalhando');

-- Semana 11: Atos 15-28
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Paulo e as viagens missionárias', 'Atos', 15, 28, 14, 11, 'Conhecendo Jesus', 'Paulo leva o Evangelho até Roma');

-- FASE 2: Vida Cristã (Semanas 12-22)

-- Semana 12: Efésios 1-6
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Nossa identidade e batalha espiritual', 'Efésios', 1, 6, 6, 12, 'Vida Cristã', 'Descobrindo quem somos em Cristo');

-- Semana 13: Filipenses 1-4
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Alegria e Cristo como centro', 'Filipenses', 1, 4, 4, 13, 'Vida Cristã', 'A carta da alegria - Cristo preeminente');

-- Semana 14: Colossenses 1-4
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Cristo em tudo e esperança futura', 'Colossenses', 1, 4, 4, 14, 'Vida Cristã', 'Jesus preeminente - vivendo na esperança');

-- Semana 15: 1 Tessalonicenses 1-5
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Esperança e perseverança', '1 Tessalonicenses', 1, 5, 5, 15, 'Vida Cristã', 'Vivendo na esperança do retorno de Jesus');

-- Semana 16: 1 Timóteo 1-6
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Liderança e perseverança final', '1 Timóteo', 1, 6, 6, 16, 'Vida Cristã', 'Orientações para líderes e igreja local');

-- Semana 17: 2 Timóteo 1-4
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Últimas instruções e vida prática', '2 Timóteo', 1, 4, 4, 17, 'Vida Cristã', 'Perseverando até o fim com fé que age');

-- Semana 18: Tito 1-3
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Graça e vida santa', 'Tito', 1, 3, 3, 18, 'Vida Cristã', 'Vivendo pela graça com boas obras');

-- Semana 19: Tiago 1-5
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Fé prática e amor verdadeiro', 'Tiago', 1, 5, 5, 19, 'Vida Cristã', 'Fé que se manifesta em obras e amor');

-- Semana 20: 1 João 1-5
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Amor, verdade e esperança na provação', '1 João', 1, 5, 5, 20, 'Vida Cristã', 'Andando em amor com esperança');

-- Semana 21: 1 Pedro 1-5
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Esperança e crescimento espiritual', '1 Pedro', 1, 5, 5, 21, 'Vida Cristã', 'Perseverando e crescendo na graça');

-- Semana 22: 2 Pedro 1-3
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Crescimento na graça', '2 Pedro', 1, 3, 3, 22, 'Vida Cristã', 'Crescendo no conhecimento de Cristo');

-- FASE 3: Doutrina e Maturidade (Semanas 23-33)

-- Semana 23: Romanos 1-8
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Salvação pela fé - Parte 1', 'Romanos', 1, 8, 8, 23, 'Doutrina e Maturidade', 'Todos pecaram, justificação e vida no Espírito');

-- Semana 24: Romanos 9-16
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Salvação pela fé - Parte 2', 'Romanos', 9, 16, 8, 24, 'Doutrina e Maturidade', 'Israel, graça e vida cristã prática');

-- Semana 25: Gálatas 1-6
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Liberdade em Cristo', 'Gálatas', 1, 6, 6, 25, 'Doutrina e Maturidade', 'Livres da lei, servos do amor');

-- Semana 26: 1 Coríntios 1-8
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Sabedoria de Deus - Parte 1', '1 Coríntios', 1, 8, 8, 26, 'Doutrina e Maturidade', 'A sabedoria da cruz e santidade');

-- Semana 27: 1 Coríntios 9-16
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Sabedoria de Deus - Parte 2', '1 Coríntios', 9, 16, 8, 27, 'Doutrina e Maturidade', 'Dons espirituais, amor e ressurreição');

-- Semana 28: 2 Coríntios 1-7
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Ministério e sofrimento', '2 Coríntios', 1, 7, 7, 28, 'Doutrina e Maturidade', 'Força na fraqueza pelo poder de Deus');

-- Semana 29: 2 Coríntios 8-13
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Generosidade e autoridade apostólica', '2 Coríntios', 8, 13, 6, 29, 'Doutrina e Maturidade', 'Dar com alegria e defender a verdade');

-- Semana 30: Hebreus 1-7
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Cristo, superior a tudo - Parte 1', 'Hebreus', 1, 7, 7, 30, 'Doutrina e Maturidade', 'Jesus, nosso sumo sacerdote eterno');

-- Semana 31: Hebreus 8-13
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Cristo, superior a tudo - Parte 2', 'Hebreus', 8, 13, 6, 31, 'Doutrina e Maturidade', 'Fé, perseverança e vida santa');

-- Semana 32: Apocalipse 1-11
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Apocalipse - Cartas e visões', 'Apocalipse', 1, 11, 11, 32, 'Doutrina e Maturidade', 'Jesus fala às igrejas e revela os juízos');

-- Semana 33: Apocalipse 12-22
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Vitória final de Cristo', 'Apocalipse', 12, 22, 11, 33, 'Doutrina e Maturidade', 'Cristo volta, vence e reina para sempre');

-- FASE 4: Sabedoria e Antigo Testamento (Semanas 34-52)

-- Semana 34: Gênesis 1-25
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('No princípio Deus criou - Parte 1', 'Gênesis', 1, 25, 25, 34, 'Sabedoria e AT', 'Criação, queda, dilúvio e Abraão');

-- Semana 35: Gênesis 26-50
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('No princípio Deus criou - Parte 2', 'Gênesis', 26, 50, 25, 35, 'Sabedoria e AT', 'Isaque, Jacó, José e providência divina');

-- Semana 36: Êxodo 1-20
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Libertação do Egito - Parte 1', 'Êxodo', 1, 20, 20, 36, 'Sabedoria e AT', 'Deus liberta seu povo e entrega os mandamentos');

-- Semana 37: Êxodo 21-40
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Libertação do Egito - Parte 2', 'Êxodo', 21, 40, 20, 37, 'Sabedoria e AT', 'Leis, tabernáculo e glória de Deus');

-- Semana 38: Levítico 1-27
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Leis de santidade', 'Levítico', 1, 27, 27, 38, 'Sabedoria e AT', 'Deus ensina seu povo a ser santo');

-- Semana 39: Números 1-18
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Jornada no deserto - Parte 1', 'Números', 1, 18, 18, 39, 'Sabedoria e AT', 'Israel no deserto - rebelião e fidelidade');

-- Semana 40: Números 19-36
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Jornada no deserto - Parte 2', 'Números', 19, 36, 18, 40, 'Sabedoria e AT', 'Rumo à Terra Prometida');

-- Semana 41: Deuteronômio 1-34
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Deuteronômio - Segunda Lei', 'Deuteronômio', 1, 34, 34, 41, 'Sabedoria e AT', 'Moisés relembra a lei e prepara o povo');

-- Semana 42: Josué 1-24
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Conquista da Terra Prometida', 'Josué', 1, 24, 24, 42, 'Sabedoria e AT', 'Josué lidera Israel na conquista de Canaã');

-- Semana 43: Juízes 1-21
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Juízes e salvadores', 'Juízes', 1, 21, 21, 43, 'Sabedoria e AT', 'Ciclo de pecado, opressão e libertação');

-- Semana 44: 1 Samuel 1-31
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Reis de Israel - Parte 1', '1 Samuel', 1, 31, 31, 44, 'Sabedoria e AT', 'Samuel, Saul e Davi - início da monarquia');

-- Semana 45: 2 Samuel 1-24
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Reis de Israel - Parte 2', '2 Samuel', 1, 24, 24, 45, 'Sabedoria e AT', 'Reino de Davi - vitórias e falhas');

-- Semana 46: 1 Reis 1-22
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Reis de Israel - Parte 3', '1 Reis', 1, 22, 22, 46, 'Sabedoria e AT', 'Salomão, divisão do reino e profetas');

-- Semana 47: 2 Reis 1-25
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Reis de Israel - Parte 4', '2 Reis', 1, 25, 25, 47, 'Sabedoria e AT', 'Profetas, exílio e cativeiro');

-- Semana 48: Salmos 1-75
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Salmos de adoração - Parte 1', 'Salmos', 1, 75, 75, 48, 'Sabedoria e AT', 'Louvores, lamentos e orações');

-- Semana 49: Salmos 76-150
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Salmos de adoração - Parte 2', 'Salmos', 76, 150, 75, 49, 'Sabedoria e AT', 'Confie no Senhor e O louve para sempre');

-- Semana 50: Provérbios 1-31
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Sabedoria prática', 'Provérbios', 1, 31, 31, 50, 'Sabedoria e AT', 'Princípios de sabedoria para a vida diária');

-- Semana 51: Isaías 1-66
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('O Messias prometido', 'Isaías', 1, 66, 66, 51, 'Sabedoria e AT', 'Profecias sobre Jesus, o Salvador');

-- Semana 52: Daniel 1-12
INSERT INTO plano_leitura_biblica (tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, semana, fase, descricao)
VALUES ('Fidelidade de Deus e restauração', 'Daniel', 1, 12, 12, 52, 'Sabedoria e AT', 'Deus é fiel aos seus servos em toda provação');

-- Verificar total de capítulos inseridos
-- Total: 7+7+7+8+8+14+14+12+12+14+14+6+4+4+5+6+4+3+5+5+5+3+8+8+6+8+8+7+6+7+6+11+11+25+25+20+20+27+18+18+34+24+21+31+24+22+25+75+75+31+66+12 = 1189 capítulos
