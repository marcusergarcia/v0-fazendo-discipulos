export const perguntasPorPasso: Record<number, string[]> = {
  1: [
    "Ao refletir sobre os sete dias da criação, onde Deus ordenou o caos e trouxe beleza e propósito a cada elemento, como isso transforma sua visão sobre o mundo ao seu redor? De que maneiras você pode celebrar e cuidar melhor da criação de Deus como um mordomo responsável?",
    "Se você foi criado à imagem e semelhança de Deus com capacidades únicas de raciocínio, amor, criatividade e relacionamento, como essa verdade deve moldar sua identidade e seu valor próprio? Em quais áreas de sua vida você precisa permitir que Cristo restaure a imagem divina que foi distorcida pelo pecado?",
    "Deus desejou relacionamento desde o Éden e continua buscando comunhão íntima conosco. Como está sua resposta a esse convite divino? De que formas você pode investir mais profundamente em seu relacionamento com Deus e também cultivar relacionamentos genuínos e transformadores com outras pessoas?",
  ],
  2: [
    "Como você pode compreender e experimentar pessoalmente a profundidade do amor de Deus revelado no sacrifício de Jesus Cristo? De que maneiras específicas esse amor transformou ou pode transformar sua vida e relacionamentos?",
    "Sabendo que a salvação não pode ser merecida por obras, mas é um presente gratuito de Deus, como isso afeta sua compreensão da graça divina? Como você pode viver em gratidão diária por esse dom inestimável e compartilhá-lo com outros?",
    "A oferta de salvação é universal e inclusiva, estendida a todas as pessoas sem discriminação. Como essa verdade pode influenciar sua maneira de enxergar e tratar as pessoas ao seu redor? Que barreiras (culturais, sociais, pessoais) você precisa derrubar para refletir esse amor inclusivo de Deus?",
  ],
  3: [
    "Como você entende a diferença entre 'estar em estado de pecado' e 'cometer atos pecaminosos'? De que forma essa compreensão muda sua visão sobre santidade e dependência de Deus?",
    "Refletindo sobre a Queda de Adão e Eva, como você identifica o mesmo padrão de tentação (duvidar da Palavra de Deus → desacreditar → autossuficiência → desobediência) em sua própria vida? Que áreas você precisa entregar a Deus?",
    "Quais consequências do pecado você já experimentou pessoalmente? Como o conhecimento do amor e perdão de Deus através de Cristo transforma sua resposta ao pecado?",
  ],
}

export const PERGUNTAS_PASSOS = perguntasPorPasso

export function getPerguntasPasso(numero: number): string[] {
  return perguntasPorPasso[numero] || []
}
