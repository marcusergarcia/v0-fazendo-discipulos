export interface LeituraSemanal {
  semana: number
  tema: string
  livro: string
  capituloInicio: number
  capituloFim: number
  totalCapitulos: number
  descricao: string
  fase: 'Conhecendo Jesus' | 'Vida Cristã' | 'Doutrina e Maturidade' | 'Sabedoria e AT'
}

export const PLANO_LEITURA_ANUAL: LeituraSemanal[] = [
  // FASE 1: Conhecendo Jesus (Semanas 1-10) - Evangelhos e Atos
  {
    semana: 1,
    tema: 'O Verbo que se fez carne',
    livro: 'João',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Comece conhecendo Jesus através do Evangelho de João',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 2,
    tema: 'Jesus, o Pão da Vida e o Bom Pastor',
    livro: 'João',
    capituloInicio: 8,
    capituloFim: 14,
    totalCapitulos: 7,
    descricao: 'Jesus revela quem Ele é como pastor e amigo',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 3,
    tema: 'O Caminho, a Verdade e a Vida',
    livro: 'João',
    capituloInicio: 15,
    capituloFim: 21,
    totalCapitulos: 7,
    descricao: 'Os últimos ensinamentos, cruz e ressurreição de Jesus',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 4,
    tema: 'Jesus em ação - Parte 1',
    livro: 'Marcos',
    capituloInicio: 1,
    capituloFim: 8,
    totalCapitulos: 8,
    descricao: 'O Evangelho mais direto - Jesus manifesta Seu poder',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 5,
    tema: 'Jesus em ação - Parte 2',
    livro: 'Marcos',
    capituloInicio: 9,
    capituloFim: 16,
    totalCapitulos: 8,
    descricao: 'Jesus ensina sobre servir, crucificação e ressurreição',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 6,
    tema: 'Jesus, o Messias prometido - Parte 1',
    livro: 'Mateus',
    capituloInicio: 1,
    capituloFim: 14,
    totalCapitulos: 14,
    descricao: 'Jesus cumpre as profecias e ensina com autoridade',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 7,
    tema: 'Jesus, o Messias prometido - Parte 2',
    livro: 'Mateus',
    capituloInicio: 15,
    capituloFim: 28,
    totalCapitulos: 14,
    descricao: 'Parábolas, cruz e a Grande Comissão',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 8,
    tema: 'A compaixão de Jesus - Parte 1',
    livro: 'Lucas',
    capituloInicio: 1,
    capituloFim: 12,
    totalCapitulos: 12,
    descricao: 'Jesus revela o coração compassivo de Deus',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 9,
    tema: 'A compaixão de Jesus - Parte 2',
    livro: 'Lucas',
    capituloInicio: 13,
    capituloFim: 24,
    totalCapitulos: 12,
    descricao: 'Parábolas de graça, salvação e ressurreição',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 10,
    tema: 'O nascimento e expansão da Igreja',
    livro: 'Atos',
    capituloInicio: 1,
    capituloFim: 14,
    totalCapitulos: 14,
    descricao: 'Pentecostes e o Evangelho se espalhando',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 11,
    tema: 'Paulo e as viagens missionárias',
    livro: 'Atos',
    capituloInicio: 15,
    capituloFim: 28,
    totalCapitulos: 14,
    descricao: 'Paulo leva o Evangelho até Roma',
    fase: 'Conhecendo Jesus'
  },

  // FASE 2: Vida Cristã (Semanas 12-20) - Cartas práticas
  {
    semana: 12,
    tema: 'Nossa identidade e batalha espiritual',
    livro: 'Efésios',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Descobrindo quem somos em Cristo',
    fase: 'Vida Cristã'
  },
  {
    semana: 13,
    tema: 'Alegria e Cristo como centro',
    livro: 'Filipenses',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'A carta da alegria - Cristo preeminente',
    fase: 'Vida Cristã'
  },
  {
    semana: 14,
    tema: 'Cristo em tudo e esperança futura',
    livro: 'Colossenses',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'Jesus preeminente - vivendo na esperança',
    fase: 'Vida Cristã'
  },
  {
    semana: 15,
    tema: 'Esperança e perseverança',
    livro: '1 Tessalonicenses',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Vivendo na esperança do retorno de Jesus',
    fase: 'Vida Cristã'
  },
  {
    semana: 16,
    tema: 'Liderança e perseverança final',
    livro: '1 Timóteo',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Orientações para líderes e igreja local',
    fase: 'Vida Cristã'
  },
  {
    semana: 17,
    tema: 'Últimas instruções e vida prática',
    livro: '2 Timóteo',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'Perseverando até o fim com fé que age',
    fase: 'Vida Cristã'
  },
  {
    semana: 18,
    tema: 'Graça e vida santa',
    livro: 'Tito',
    capituloInicio: 1,
    capituloFim: 3,
    totalCapitulos: 3,
    descricao: 'Vivendo pela graça com boas obras',
    fase: 'Vida Cristã'
  },
  {
    semana: 19,
    tema: 'Fé prática e amor verdadeiro',
    livro: 'Tiago',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Fé que se manifesta em obras e amor',
    fase: 'Vida Cristã'
  },
  {
    semana: 20,
    tema: 'Amor, verdade e esperança na provação',
    livro: '1 João',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Andando em amor com esperança',
    fase: 'Vida Cristã'
  },
  {
    semana: 21,
    tema: 'Esperança e crescimento espiritual',
    livro: '1 Pedro',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Perseverando e crescendo na graça',
    fase: 'Vida Cristã'
  },
  {
    semana: 22,
    tema: 'Crescimento na graça',
    livro: '2 Pedro',
    capituloInicio: 1,
    capituloFim: 3,
    totalCapitulos: 3,
    descricao: 'Crescendo no conhecimento de Cristo',
    fase: 'Vida Cristã'
  },

  // FASE 3: Doutrina e Maturidade (Semanas 23-32)
  {
    semana: 23,
    tema: 'Salvação pela fé - Parte 1',
    livro: 'Romanos',
    capituloInicio: 1,
    capituloFim: 8,
    totalCapitulos: 8,
    descricao: 'Todos pecaram, justificação e vida no Espírito',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 24,
    tema: 'Salvação pela fé - Parte 2',
    livro: 'Romanos',
    capituloInicio: 9,
    capituloFim: 16,
    totalCapitulos: 8,
    descricao: 'Israel, graça e vida cristã prática',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 25,
    tema: 'Liberdade em Cristo',
    livro: 'Gálatas',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Livres da lei, servos do amor',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 26,
    tema: 'Sabedoria de Deus - Parte 1',
    livro: '1 Coríntios',
    capituloInicio: 1,
    capituloFim: 8,
    totalCapitulos: 8,
    descricao: 'A sabedoria da cruz e santidade',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 27,
    tema: 'Sabedoria de Deus - Parte 2',
    livro: '1 Coríntios',
    capituloInicio: 9,
    capituloFim: 16,
    totalCapitulos: 8,
    descricao: 'Dons espirituais, amor e ressurreição',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 28,
    tema: 'Ministério e sofrimento',
    livro: '2 Coríntios',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Força na fraqueza pelo poder de Deus',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 29,
    tema: 'Generosidade e autoridade apostólica',
    livro: '2 Coríntios',
    capituloInicio: 8,
    capituloFim: 13,
    totalCapitulos: 6,
    descricao: 'Dar com alegria e defender a verdade',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 30,
    tema: 'Cristo, superior a tudo - Parte 1',
    livro: 'Hebreus',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Jesus, nosso sumo sacerdote eterno',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 31,
    tema: 'Cristo, superior a tudo - Parte 2',
    livro: 'Hebreus',
    capituloInicio: 8,
    capituloFim: 13,
    totalCapitulos: 6,
    descricao: 'Fé, perseverança e vida santa',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 32,
    tema: 'Apocalipse - Cartas e visões',
    livro: 'Apocalipse',
    capituloInicio: 1,
    capituloFim: 11,
    totalCapitulos: 11,
    descricao: 'Jesus fala às igrejas e revela os juízos',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 33,
    tema: 'Vitória final de Cristo',
    livro: 'Apocalipse',
    capituloInicio: 12,
    capituloFim: 22,
    totalCapitulos: 11,
    descricao: 'Cristo volta, vence e reina para sempre',
    fase: 'Doutrina e Maturidade'
  },

  // FASE 4: Sabedoria e Antigo Testamento (Semanas 34-52)
  {
    semana: 34,
    tema: 'No princípio Deus criou - Parte 1',
    livro: 'Gênesis',
    capituloInicio: 1,
    capituloFim: 25,
    totalCapitulos: 25,
    descricao: 'Criação, queda, dilúvio e Abraão',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 35,
    tema: 'No princípio Deus criou - Parte 2',
    livro: 'Gênesis',
    capituloInicio: 26,
    capituloFim: 50,
    totalCapitulos: 25,
    descricao: 'Isaque, Jacó, José e providência divina',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 36,
    tema: 'Libertação do Egito - Parte 1',
    livro: 'Êxodo',
    capituloInicio: 1,
    capituloFim: 20,
    totalCapitulos: 20,
    descricao: 'Deus liberta seu povo e entrega os mandamentos',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 37,
    tema: 'Libertação do Egito - Parte 2',
    livro: 'Êxodo',
    capituloInicio: 21,
    capituloFim: 40,
    totalCapitulos: 20,
    descricao: 'Leis, tabernáculo e glória de Deus',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 38,
    tema: 'Leis de santidade',
    livro: 'Levítico',
    capituloInicio: 1,
    capituloFim: 27,
    totalCapitulos: 27,
    descricao: 'Deus ensina seu povo a ser santo',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 39,
    tema: 'Jornada no deserto - Parte 1',
    livro: 'Números',
    capituloInicio: 1,
    capituloFim: 18,
    totalCapitulos: 18,
    descricao: 'Israel no deserto - rebelião e fidelidade',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 40,
    tema: 'Jornada no deserto - Parte 2',
    livro: 'Números',
    capituloInicio: 19,
    capituloFim: 36,
    totalCapitulos: 18,
    descricao: 'Rumo à Terra Prometida',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 41,
    tema: 'Deuteronômio - Segunda Lei',
    livro: 'Deuteronômio',
    capituloInicio: 1,
    capituloFim: 34,
    totalCapitulos: 34,
    descricao: 'Moisés relembra a lei e prepara o povo',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 42,
    tema: 'Conquista da Terra Prometida',
    livro: 'Josué',
    capituloInicio: 1,
    capituloFim: 24,
    totalCapitulos: 24,
    descricao: 'Josué lidera Israel na conquista de Canaã',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 43,
    tema: 'Juízes e salvadores',
    livro: 'Juízes',
    capituloInicio: 1,
    capituloFim: 21,
    totalCapitulos: 21,
    descricao: 'Ciclo de pecado, opressão e libertação',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 44,
    tema: 'Reis de Israel - Parte 1',
    livro: '1 Samuel',
    capituloInicio: 1,
    capituloFim: 31,
    totalCapitulos: 31,
    descricao: 'Samuel, Saul e Davi - início da monarquia',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 45,
    tema: 'Reis de Israel - Parte 2',
    livro: '2 Samuel',
    capituloInicio: 1,
    capituloFim: 24,
    totalCapitulos: 24,
    descricao: 'Reino de Davi - vitórias e falhas',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 46,
    tema: 'Reis de Israel - Parte 3',
    livro: '1 Reis',
    capituloInicio: 1,
    capituloFim: 22,
    totalCapitulos: 22,
    descricao: 'Salomão, divisão do reino e profetas',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 47,
    tema: 'Reis de Israel - Parte 4',
    livro: '2 Reis',
    capituloInicio: 1,
    capituloFim: 25,
    totalCapitulos: 25,
    descricao: 'Profetas, exílio e cativeiro',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 48,
    tema: 'Salmos de adoração - Parte 1',
    livro: 'Salmos',
    capituloInicio: 1,
    capituloFim: 75,
    totalCapitulos: 75,
    descricao: 'Louvores, lamentos e orações',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 49,
    tema: 'Salmos de adoração - Parte 2',
    livro: 'Salmos',
    capituloInicio: 76,
    capituloFim: 150,
    totalCapitulos: 75,
    descricao: 'Confie no Senhor e O louve para sempre',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 50,
    tema: 'Sabedoria prática',
    livro: 'Provérbios',
    capituloInicio: 1,
    capituloFim: 31,
    totalCapitulos: 31,
    descricao: 'Princípios de sabedoria para a vida diária',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 51,
    tema: 'O Messias prometido',
    livro: 'Isaías',
    capituloInicio: 1,
    capituloFim: 66,
    totalCapitulos: 66,
    descricao: 'Profecias sobre Jesus, o Salvador',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 52,
    tema: 'Fidelidade de Deus e restauração',
    livro: 'Daniel',
    capituloInicio: 1,
    capituloFim: 12,
    totalCapitulos: 12,
    descricao: 'Deus é fiel aos seus servos em toda provação',
    fase: 'Sabedoria e AT'
  }
]

export function getLeituraPorSemana(semana: number): LeituraSemanal | undefined {
  return PLANO_LEITURA_ANUAL.find(l => l.semana === semana)
}

export function getLeituraPorPasso(passo: number): LeituraSemanal | undefined {
  return getLeituraPorSemana(passo)
}

export function getSemanaAtual(): number {
  const agora = new Date()
  const inicioAno = new Date(agora.getFullYear(), 0, 1)
  const diff = agora.getTime() - inicioAno.getTime()
  const umDia = 1000 * 60 * 60 * 24
  const diaDoAno = Math.floor(diff / umDia)
  return Math.min(Math.ceil(diaDoAno / 7), 52)
}
