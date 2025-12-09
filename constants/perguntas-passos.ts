export const PERGUNTAS_POR_PASSO: Record<number, string[]> = {
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
  4: [
    "Você compreende que nasceu com uma 'culpa herdada' do pecado de Adão (pecado imputado), além da culpa pessoal por seus próprios erros? Como essa verdade impacta sua percepção da necessidade de um Salvador e da graça de Cristo que apaga completamente sua 'ficha criminal espiritual'?",
    "Paulo Washer afirma que a morte espiritual significa estar 'vivo fisicamente, mas completamente morto por dentro' — insensível a Deus, mas hipersensível ao pecado. Você já experimentou essa realidade em sua vida? Como o milagre da regeneração através de Cristo transforma esse estado de morte espiritual em vida abundante?",
    "Tiago 4:4 diz que 'a amizade com o mundo é inimizade com Deus'. Antes de conhecer Cristo, você reconhece que era inimigo de Deus ao amar o pecado? Como Jesus destruiu essa barreira de inimizade na cruz e ofereceu paz e reconciliação? De que formas práticas você demonstra hoje que é amigo de Deus e não do pecado?",
    "Jesus declarou: 'Todo o que comete pecado é escravo do pecado' (João 8:34). Você já se sentiu acorrentado em uma prisão invisível, querendo mudar mas não conseguindo? Quais áreas específicas de sua vida ainda lutam contra essa escravidão? Como Romanos 6:18 ('Libertados do pecado, vocês se tornaram servos da justiça') se aplica à sua jornada de libertação através do poder de Cristo?",
  ],
  5: [
    "Como você compreende a substituição vicária de Cristo na cruz? De que maneiras específicas você tem experimentado a liberdade de saber que Jesus tomou o SEU lugar, carregando a punição que você merecia? Em quais áreas da sua vida você ainda carrega culpa desnecessária, mesmo sabendo que Cristo já pagou completamente por seus pecados?",
    "A ressurreição de Jesus não é apenas sobre Ele vencer a morte — é sobre VOCÊ receber nova vida! Romanos 6:4 diz que 'fomos sepultados com ele na morte, para que, assim como Cristo foi ressuscitado... também nós vivamos uma vida nova'. Quais sinais de 'vida nova' você tem visto em sua jornada? Que áreas da sua vida ainda parecem 'mortas' e precisam do poder da ressurreição de Cristo?",
    "Reconciliação com Deus significa que a guerra acabou — você não é mais inimigo, mas filho amado! Como essa verdade transforma sua maneira de se relacionar com Deus? Você ainda se aproxima Dele com medo e insegurança, ou com confiança de filho reconciliado? De que formas práticas você pode viver essa paz conquistada na cruz em seus relacionamentos diários?",
    "Redenção significa que você foi 'comprado de volta' — você não pertence mais ao pecado, mas a Cristo! 1 Coríntios 6:19-20 declara: 'Vocês não são de si mesmos; foram comprados por alto preço'. Como essa verdade impacta suas escolhas diárias? Em quais áreas da sua vida você precisa lembrar que foi redimido e agora pertence completamente a Jesus? Como você pode honrar esse 'alto preço' que Cristo pagou?",
  ],
  6: [
    "A morte de Jesus não foi um acidente trágico, mas o cumprimento do plano perfeito de Deus para sua salvação. Como essa verdade muda sua perspectiva sobre o sofrimento e o sacrifício? De que maneiras você pode valorizar mais profundamente o preço que Cristo pagou por você na cruz? Que sacrifícios Deus está pedindo de você hoje como resposta ao sacrifício de Jesus?",
    "1 Coríntios 15:14 declara: 'Se Cristo não ressuscitou, é vã a nossa pregação, e vã também a vossa fé'. A ressurreição é a prova definitiva de que Jesus é Deus e de que Ele venceu a morte. Como essa certeza fortalece sua fé nos momentos de dúvida? O que muda na sua vida sabendo que o mesmo poder que ressuscitou Jesus dos mortos está disponível para você hoje?",
    "A morte de Cristo nos traz perdão, e a ressurreição nos dá vida nova e esperança eterna. Romanos 6:4 nos convida a 'viver uma vida nova' pelo poder da ressurreição. Que áreas da sua vida refletem essa 'vida nova' em Cristo? Quais hábitos, pensamentos ou relacionamentos ainda precisam experimentar o poder transformador da ressurreição? Como você pode morrer para o velho homem e ressuscitar para uma nova maneira de viver?",
  ],
}

// Mantendo compatibilidade com código existente
export const perguntasPorPasso = PERGUNTAS_POR_PASSO

export function getPerguntasPasso(numero: number): string[] {
  return PERGUNTAS_POR_PASSO[numero] || []
}
