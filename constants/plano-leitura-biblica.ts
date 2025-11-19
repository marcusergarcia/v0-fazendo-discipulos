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
  // FASE 1: Conhecendo Jesus (Semanas 1-13)
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
    tema: 'Jesus em ação',
    livro: 'Marcos',
    capituloInicio: 1,
    capituloFim: 8,
    totalCapitulos: 8,
    descricao: 'O Evangelho mais direto - Jesus manifesta Seu poder',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 5,
    tema: 'O Servo Sofredor',
    livro: 'Marcos',
    capituloInicio: 9,
    capituloFim: 16,
    totalCapitulos: 8,
    descricao: 'Jesus ensina sobre servir, crucificação e ressurreição',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 6,
    tema: 'Jesus, o Messias prometido',
    livro: 'Mateus',
    capituloInicio: 1,
    capituloFim: 10,
    totalCapitulos: 10,
    descricao: 'Jesus cumpre as profecias e ensina com autoridade',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 7,
    tema: 'Parábolas e Ensinos do Reino',
    livro: 'Mateus',
    capituloInicio: 11,
    capituloFim: 20,
    totalCapitulos: 10,
    descricao: 'Jesus revela os mistérios do Reino de Deus',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 8,
    tema: 'A Grande Comissão',
    livro: 'Mateus',
    capituloInicio: 21,
    capituloFim: 28,
    totalCapitulos: 8,
    descricao: 'Jesus envia seus discípulos ao mundo',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 9,
    tema: 'A compaixão de Jesus - Parte 1',
    livro: 'Lucas',
    capituloInicio: 1,
    capituloFim: 9,
    totalCapitulos: 9,
    descricao: 'Jesus revela o coração compassivo de Deus',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 10,
    tema: 'A compaixão de Jesus - Parte 2',
    livro: 'Lucas',
    capituloInicio: 10,
    capituloFim: 16,
    totalCapitulos: 7,
    descricao: 'Parábolas de graça e amor de Deus',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 11,
    tema: 'Salvação e transformação',
    livro: 'Lucas',
    capituloInicio: 17,
    capituloFim: 24,
    totalCapitulos: 8,
    descricao: 'Jesus salva e transforma vidas',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 12,
    tema: 'O nascimento da Igreja',
    livro: 'Atos',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Pentecostes e a Igreja primitiva',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 13,
    tema: 'Expansão do Evangelho',
    livro: 'Atos',
    capituloInicio: 8,
    capituloFim: 14,
    totalCapitulos: 7,
    descricao: 'O Evangelho se espalha pelo mundo',
    fase: 'Conhecendo Jesus'
  },

  // FASE 2: Vida Cristã (Semanas 14-26)
  {
    semana: 14,
    tema: 'Paulo, apóstolo dos gentios',
    livro: 'Atos',
    capituloInicio: 15,
    capituloFim: 21,
    totalCapitulos: 7,
    descricao: 'Viagens missionárias de Paulo',
    fase: 'Vida Cristã'
  },
  {
    semana: 15,
    tema: 'Perseverança na fé',
    livro: 'Atos',
    capituloInicio: 22,
    capituloFim: 28,
    totalCapitulos: 7,
    descricao: 'Paulo enfrenta perseguições com fé',
    fase: 'Vida Cristã'
  },
  {
    semana: 16,
    tema: 'Nossa identidade em Cristo',
    livro: 'Efésios',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Descobrindo quem somos em Cristo',
    fase: 'Vida Cristã'
  },
  {
    semana: 17,
    tema: 'Alegria em Cristo',
    livro: 'Filipenses',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'A carta da alegria',
    fase: 'Vida Cristã'
  },
  {
    semana: 18,
    tema: 'Cristo como centro',
    livro: 'Colossenses',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'Jesus, preeminente em tudo',
    fase: 'Vida Cristã'
  },
  {
    semana: 19,
    tema: 'Esperança na volta de Cristo',
    livro: '1 Tessalonicenses',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Vivendo na esperança do retorno de Jesus',
    fase: 'Vida Cristã'
  },
  {
    semana: 20,
    tema: 'Liderança e ordem na Igreja',
    livro: '1 Timóteo',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Orientações para líderes e igreja local',
    fase: 'Vida Cristã'
  },
  {
    semana: 21,
    tema: 'Fé prática no dia a dia',
    livro: 'Tiago',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Fé que se manifesta em obras',
    fase: 'Vida Cristã'
  },
  {
    semana: 22,
    tema: 'Amor e verdade',
    livro: '1 João',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Andando em amor e verdade',
    fase: 'Vida Cristã'
  },
  {
    semana: 23,
    tema: 'Pedro: Esperança na provação',
    livro: '1 Pedro',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Perseverando nas dificuldades',
    fase: 'Vida Cristã'
  },
  {
    semana: 24,
    tema: 'Crescimento espiritual',
    livro: '2 Pedro',
    capituloInicio: 1,
    capituloFim: 3,
    totalCapitulos: 3,
    descricao: 'Crescendo na graça e conhecimento de Cristo',
    fase: 'Vida Cristã'
  },
  {
    semana: 25,
    tema: 'Últimas instruções de Paulo',
    livro: '2 Timóteo',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'Perseverando até o fim',
    fase: 'Vida Cristã'
  },
  {
    semana: 26,
    tema: 'Graça e boas obras',
    livro: 'Tito',
    capituloInicio: 1,
    capituloFim: 3,
    totalCapitulos: 3,
    descricao: 'Vivendo pela graça com boas obras',
    fase: 'Vida Cristã'
  },

  // FASE 3: Doutrina e Maturidade (Semanas 27-39)
  {
    semana: 27,
    tema: 'Salvação pela fé - Parte 1',
    livro: 'Romanos',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'Todos pecaram e precisam de salvação',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 28,
    tema: 'Salvação pela fé - Parte 2',
    livro: 'Romanos',
    capituloInicio: 5,
    capituloFim: 8,
    totalCapitulos: 4,
    descricao: 'Justificação e vida no Espírito',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 29,
    tema: 'Israel e a graça de Deus',
    livro: 'Romanos',
    capituloInicio: 9,
    capituloFim: 12,
    totalCapitulos: 4,
    descricao: 'A fidelidade de Deus',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 30,
    tema: 'Vida cristã prática',
    livro: 'Romanos',
    capituloInicio: 13,
    capituloFim: 16,
    totalCapitulos: 4,
    descricao: 'Como viver em Cristo no dia a dia',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 31,
    tema: 'Liberdade em Cristo',
    livro: 'Gálatas',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Livres da lei, servos do amor',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 32,
    tema: 'Sabedoria de Deus - Parte 1',
    livro: '1 Coríntios',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'A sabedoria da cruz e santidade',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 33,
    tema: 'Sabedoria de Deus - Parte 2',
    livro: '1 Coríntios',
    capituloInicio: 8,
    capituloFim: 14,
    totalCapitulos: 7,
    descricao: 'Dons espirituais e o caminho do amor',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 34,
    tema: 'Ressurreição e vitória',
    livro: '1 Coríntios',
    capituloInicio: 15,
    capituloFim: 16,
    totalCapitulos: 2,
    descricao: 'Nossa esperança futura em Cristo',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 35,
    tema: 'Ministério e sofrimento',
    livro: '2 Coríntios',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Força na fraqueza pelo poder de Deus',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 36,
    tema: 'Generosidade e autoridade apostólica',
    livro: '2 Coríntios',
    capituloInicio: 8,
    capituloFim: 13,
    totalCapitulos: 6,
    descricao: 'Dar com alegria e defender a verdade',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 37,
    tema: 'Cristo, superior a tudo - Parte 1',
    livro: 'Hebreus',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Jesus, nosso sumo sacerdote eterno',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 38,
    tema: 'Cristo, superior a tudo - Parte 2',
    livro: 'Hebreus',
    capituloInicio: 8,
    capituloFim: 13,
    totalCapitulos: 6,
    descricao: 'Fé, perseverança e vida santa',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 39,
    tema: 'Apocalipse - Cartas às Igrejas',
    livro: 'Apocalipse',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Jesus fala às sete igrejas',
    fase: 'Doutrina e Maturidade'
  },

  // FASE 4: Sabedoria e AT (Semanas 40-52)
  {
    semana: 40,
    tema: 'Visões do trono de Deus',
    livro: 'Apocalipse',
    capituloInicio: 8,
    capituloFim: 14,
    totalCapitulos: 7,
    descricao: 'Revelações celestiais e juízos',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 41,
    tema: 'Vitória final de Cristo',
    livro: 'Apocalipse',
    capituloInicio: 15,
    capituloFim: 22,
    totalCapitulos: 8,
    descricao: 'Cristo volta, vence e reina para sempre',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 42,
    tema: 'Salmos de adoração',
    livro: 'Salmos',
    capituloInicio: 1,
    capituloFim: 20,
    totalCapitulos: 20,
    descricao: 'Louvores e orações ao Senhor',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 43,
    tema: 'Salmos de confiança',
    livro: 'Salmos',
    capituloInicio: 21,
    capituloFim: 40,
    totalCapitulos: 20,
    descricao: 'Confie no Senhor em toda situação',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 44,
    tema: 'Sabedoria prática',
    livro: 'Provérbios',
    capituloInicio: 1,
    capituloFim: 15,
    totalCapitulos: 15,
    descricao: 'Princípios de sabedoria para a vida',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 45,
    tema: 'Mais sabedoria de Salomão',
    livro: 'Provérbios',
    capituloInicio: 16,
    capituloFim: 31,
    totalCapitulos: 16,
    descricao: 'Vivendo com sabedoria divina',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 46,
    tema: 'No princípio Deus criou',
    livro: 'Gênesis',
    capituloInicio: 1,
    capituloFim: 11,
    totalCapitulos: 11,
    descricao: 'Criação e primeiros acontecimentos',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 47,
    tema: 'Abraão, pai da fé',
    livro: 'Gênesis',
    capituloInicio: 12,
    capituloFim: 25,
    totalCapitulos: 14,
    descricao: 'A promessa de Deus a Abraão',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 48,
    tema: 'José e a providência divina',
    livro: 'Gênesis',
    capituloInicio: 37,
    capituloFim: 50,
    totalCapitulos: 14,
    descricao: 'Deus transforma o mal em bem',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 49,
    tema: 'Libertação do Egito',
    livro: 'Êxodo',
    capituloInicio: 1,
    capituloFim: 14,
    totalCapitulos: 14,
    descricao: 'Deus liberta seu povo com poder',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 50,
    tema: 'Os Dez Mandamentos e a Lei',
    livro: 'Êxodo',
    capituloInicio: 19,
    capituloFim: 24,
    totalCapitulos: 6,
    descricao: 'A lei de Deus entregue a Moisés',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 51,
    tema: 'O Messias prometido',
    livro: 'Isaías',
    capituloInicio: 40,
    capituloFim: 55,
    totalCapitulos: 16,
    descricao: 'Profecias sobre Jesus, o Salvador',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 52,
    tema: 'Fidelidade de Deus',
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
