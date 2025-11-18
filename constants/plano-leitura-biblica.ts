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
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'Comece conhecendo Jesus através do Evangelho de João',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 2,
    tema: 'Jesus, o Pão da Vida',
    livro: 'João',
    capituloInicio: 5,
    capituloFim: 8,
    totalCapitulos: 4,
    descricao: 'Jesus revela quem Ele é',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 3,
    tema: 'O Bom Pastor',
    livro: 'João',
    capituloInicio: 9,
    capituloFim: 12,
    totalCapitulos: 4,
    descricao: 'Jesus como pastor e amigo',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 4,
    tema: 'O Caminho, a Verdade e a Vida',
    livro: 'João',
    capituloInicio: 13,
    capituloFim: 17,
    totalCapitulos: 5,
    descricao: 'Os últimos ensinamentos de Jesus',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 5,
    tema: 'Cruz e Ressurreição',
    livro: 'João',
    capituloInicio: 18,
    capituloFim: 21,
    totalCapitulos: 4,
    descricao: 'O sacrifício e a vitória de Cristo',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 6,
    tema: 'Jesus em ação',
    livro: 'Marcos',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'O Evangelho mais direto e prático',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 7,
    tema: 'Milagres e poder de Jesus',
    livro: 'Marcos',
    capituloInicio: 5,
    capituloFim: 8,
    totalCapitulos: 4,
    descricao: 'Jesus manifesta Seu poder',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 8,
    tema: 'O Servo Sofredor',
    livro: 'Marcos',
    capituloInicio: 9,
    capituloFim: 12,
    totalCapitulos: 4,
    descricao: 'Jesus ensina sobre servir',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 9,
    tema: 'Paixão e Glória',
    livro: 'Marcos',
    capituloInicio: 13,
    capituloFim: 16,
    totalCapitulos: 4,
    descricao: 'A crucificação e ressurreição',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 10,
    tema: 'Jesus, o Messias prometido',
    livro: 'Mateus',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Jesus cumpre as profecias',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 11,
    tema: 'Autoridade e Ensino',
    livro: 'Mateus',
    capituloInicio: 8,
    capituloFim: 14,
    totalCapitulos: 7,
    descricao: 'Jesus ensina com autoridade',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 12,
    tema: 'O Reino de Deus',
    livro: 'Mateus',
    capituloInicio: 15,
    capituloFim: 21,
    totalCapitulos: 7,
    descricao: 'Parábolas do Reino',
    fase: 'Conhecendo Jesus'
  },
  {
    semana: 13,
    tema: 'A Grande Comissão',
    livro: 'Mateus',
    capituloInicio: 22,
    capituloFim: 28,
    totalCapitulos: 7,
    descricao: 'Jesus envia seus discípulos',
    fase: 'Conhecendo Jesus'
  },

  // FASE 2: Vida Cristã (Semanas 14-26)
  {
    semana: 14,
    tema: 'A compaixão de Jesus',
    livro: 'Lucas',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Jesus revela o coração de Deus',
    fase: 'Vida Cristã'
  },
  {
    semana: 15,
    tema: 'Fé e milagres',
    livro: 'Lucas',
    capituloInicio: 7,
    capituloFim: 12,
    totalCapitulos: 6,
    descricao: 'Jesus manifesta o poder de Deus',
    fase: 'Vida Cristã'
  },
  {
    semana: 16,
    tema: 'Parábolas de graça',
    livro: 'Lucas',
    capituloInicio: 13,
    capituloFim: 18,
    totalCapitulos: 6,
    descricao: 'Jesus ensina sobre o amor de Deus',
    fase: 'Vida Cristã'
  },
  {
    semana: 17,
    tema: 'Salvação e novo nascimento',
    livro: 'Lucas',
    capituloInicio: 19,
    capituloFim: 24,
    totalCapitulos: 6,
    descricao: 'Jesus salva e transforma vidas',
    fase: 'Vida Cristã'
  },
  {
    semana: 18,
    tema: 'O nascimento da Igreja',
    livro: 'Atos',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Pentecostes e a Igreja primitiva',
    fase: 'Vida Cristã'
  },
  {
    semana: 19,
    tema: 'Expansão do Evangelho',
    livro: 'Atos',
    capituloInicio: 6,
    capituloFim: 10,
    totalCapitulos: 5,
    descricao: 'O Evangelho se espalha',
    fase: 'Vida Cristã'
  },
  {
    semana: 20,
    tema: 'Missões e evangelismo',
    livro: 'Atos',
    capituloInicio: 11,
    capituloFim: 15,
    totalCapitulos: 5,
    descricao: 'A Igreja em missão',
    fase: 'Vida Cristã'
  },
  {
    semana: 21,
    tema: 'Paulo, apóstolo dos gentios',
    livro: 'Atos',
    capituloInicio: 16,
    capituloFim: 20,
    totalCapitulos: 5,
    descricao: 'Viagens missionárias de Paulo',
    fase: 'Vida Cristã'
  },
  {
    semana: 22,
    tema: 'Perseverança na fé',
    livro: 'Atos',
    capituloInicio: 21,
    capituloFim: 28,
    totalCapitulos: 8,
    descricao: 'Paulo enfrenta perseguições',
    fase: 'Vida Cristã'
  },
  {
    semana: 23,
    tema: 'Alegria em Cristo',
    livro: 'Filipenses',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'A carta da alegria',
    fase: 'Vida Cristã'
  },
  {
    semana: 24,
    tema: 'Nossa identidade em Cristo',
    livro: 'Efésios',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Quem somos em Cristo',
    fase: 'Vida Cristã'
  },
  {
    semana: 25,
    tema: 'Cristo como centro',
    livro: 'Colossenses',
    capituloInicio: 1,
    capituloFim: 4,
    totalCapitulos: 4,
    descricao: 'Jesus, preeminente em tudo',
    fase: 'Vida Cristã'
  },
  {
    semana: 26,
    tema: 'Esperança e perseverança',
    livro: '1 Tessalonicenses',
    capituloInicio: 1,
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'Vivendo na esperança da volta de Cristo',
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
    descricao: 'Como viver em Cristo',
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
    capituloFim: 5,
    totalCapitulos: 5,
    descricao: 'A sabedoria da cruz',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 33,
    tema: 'Sabedoria de Deus - Parte 2',
    livro: '1 Coríntios',
    capituloInicio: 6,
    capituloFim: 10,
    totalCapitulos: 5,
    descricao: 'Santidade e liberdade cristã',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 34,
    tema: 'Dons espirituais e amor',
    livro: '1 Coríntios',
    capituloInicio: 11,
    capituloFim: 14,
    totalCapitulos: 4,
    descricao: 'O caminho mais excelente',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 35,
    tema: 'Ressurreição e vitória',
    livro: '1 Coríntios',
    capituloInicio: 15,
    capituloFim: 16,
    totalCapitulos: 2,
    descricao: 'Nossa esperança futura',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 36,
    tema: 'Ministério e sofrimento',
    livro: '2 Coríntios',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Força na fraqueza',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 37,
    tema: 'Generosidade e fé',
    livro: '2 Coríntios',
    capituloInicio: 8,
    capituloFim: 13,
    totalCapitulos: 6,
    descricao: 'Dar com alegria',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 38,
    tema: 'Cristo, superior a tudo - Parte 1',
    livro: 'Hebreus',
    capituloInicio: 1,
    capituloFim: 7,
    totalCapitulos: 7,
    descricao: 'Jesus, nosso sumo sacerdote',
    fase: 'Doutrina e Maturidade'
  },
  {
    semana: 39,
    tema: 'Cristo, superior a tudo - Parte 2',
    livro: 'Hebreus',
    capituloInicio: 8,
    capituloFim: 13,
    totalCapitulos: 6,
    descricao: 'Fé e perseverança',
    fase: 'Doutrina e Maturidade'
  },

  // FASE 4: Sabedoria e AT (Semanas 40-52)
  {
    semana: 40,
    tema: 'Salmos de adoração',
    livro: 'Salmos',
    capituloInicio: 1,
    capituloFim: 25,
    totalCapitulos: 25,
    descricao: 'Louvores e orações',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 41,
    tema: 'Salmos de confiança',
    livro: 'Salmos',
    capituloInicio: 26,
    capituloFim: 50,
    totalCapitulos: 25,
    descricao: 'Confie no Senhor',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 42,
    tema: 'Sabedoria prática',
    livro: 'Provérbios',
    capituloInicio: 1,
    capituloFim: 15,
    totalCapitulos: 15,
    descricao: 'Princípios para a vida',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 43,
    tema: 'Mais sabedoria',
    livro: 'Provérbios',
    capituloInicio: 16,
    capituloFim: 31,
    totalCapitulos: 16,
    descricao: 'Vivendo com sabedoria',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 44,
    tema: 'No princípio Deus',
    livro: 'Gênesis',
    capituloInicio: 1,
    capituloFim: 11,
    totalCapitulos: 11,
    descricao: 'Criação e primeiros acontecimentos',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 45,
    tema: 'Abraão, pai da fé',
    livro: 'Gênesis',
    capituloInicio: 12,
    capituloFim: 25,
    totalCapitulos: 14,
    descricao: 'A promessa de Deus a Abraão',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 46,
    tema: 'José e a providência divina',
    livro: 'Gênesis',
    capituloInicio: 37,
    capituloFim: 50,
    totalCapitulos: 14,
    descricao: 'Deus transforma o mal em bem',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 47,
    tema: 'Libertação do Egito',
    livro: 'Êxodo',
    capituloInicio: 1,
    capituloFim: 15,
    totalCapitulos: 15,
    descricao: 'Deus liberta seu povo',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 48,
    tema: 'Os Dez Mandamentos',
    livro: 'Êxodo',
    capituloInicio: 19,
    capituloFim: 24,
    totalCapitulos: 6,
    descricao: 'A lei de Deus',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 49,
    tema: 'O Messias prometido',
    livro: 'Isaías',
    capituloInicio: 40,
    capituloFim: 55,
    totalCapitulos: 16,
    descricao: 'Profecias sobre Jesus',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 50,
    tema: 'Novo coração',
    livro: 'Ezequiel',
    capituloInicio: 36,
    capituloFim: 37,
    totalCapitulos: 2,
    descricao: 'Deus promete renovação',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 51,
    tema: 'Fidelidade de Deus',
    livro: 'Daniel',
    capituloInicio: 1,
    capituloFim: 6,
    totalCapitulos: 6,
    descricao: 'Deus é fiel aos seus servos',
    fase: 'Sabedoria e AT'
  },
  {
    semana: 52,
    tema: 'Apocalipse e vitória final',
    livro: 'Apocalipse',
    capituloInicio: 19,
    capituloFim: 22,
    totalCapitulos: 4,
    descricao: 'Cristo volta e vence',
    fase: 'Sabedoria e AT'
  }
]

export function getLeituraPorSemana(semana: number): LeituraSemanal | undefined {
  return PLANO_LEITURA_ANUAL.find(l => l.semana === semana)
}

export function getLeituraPorPasso(passo: number): LeituraSemanal | undefined {
  // 1 passo = 1 semana, então semana = passo atual
  return getLeituraPorSemana(passo)
}

export function getSemanaAtual(): number {
  // Calcular semana do ano (simples)
  const agora = new Date()
  const inicioAno = new Date(agora.getFullYear(), 0, 1)
  const diff = agora.getTime() - inicioAno.getTime()
  const umDia = 1000 * 60 * 60 * 24
  const diaDoAno = Math.floor(diff / umDia)
  return Math.min(Math.ceil(diaDoAno / 7), 52)
}
