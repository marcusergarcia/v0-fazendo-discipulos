export type BibleVerse = {
  referencia: string
  texto: string
}

// Biblioteca de versículos bíblicos (NVI)
export const VERSICULOS_BIBLICOS: Record<string, BibleVerse> = {
  "Gênesis 1:1": {
    referencia: "Gênesis 1:1",
    texto: "No princípio Deus criou os céus e a terra.",
  },
  "Gênesis 1:26-27": {
    referencia: "Gênesis 1:26-27",
    texto:
      'Então disse Deus: "Façamos o homem à nossa imagem, conforme a nossa semelhança. Domine ele sobre os peixes do mar, sobre as aves do céu, sobre os animais grandes de toda a terra e sobre todos os pequenos animais que se movem rente ao chão". Criou Deus o homem à sua imagem, à imagem de Deus o criou; homem e mulher os criou.',
  },
  "Gênesis 17:1": {
    referencia: "Gênesis 17:1",
    texto:
      'Quando Abraão tinha noventa e nove anos de idade, o Senhor lhe apareceu e disse: "Eu sou o Deus todo-poderoso; ande segundo a minha vontade e seja íntegro.',
  },
  "1 Pedro 1:2": {
    referencia: "1 Pedro 1:2",
    texto:
      "Escolhidos de acordo com a pré-conhecimento de Deus Pai, pela obra santificadora do Espírito, para a obediência a Jesus Cristo e a aspersão do seu sangue: Graça e paz lhes sejam multiplicadas.",
  },
  "João 3:16": {
    referencia: "João 3:16",
    texto:
      "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.",
  },
  "2 João 1:3": {
    referencia: "2 João 1:3",
    texto:
      "A graça, a misericórdia e a paz da parte de Deus Pai e de seu Filho, Jesus Cristo, estarão conosco em verdade e amor.",
  },
  "Mateus 1:20": {
    referencia: "Mateus 1:20",
    texto:
      'Mas, depois de ter pensado nisso, apareceu-lhe um anjo do Senhor em sonho e disse: "José, filho de Davi, não tema receber Maria como sua esposa, pois o que nela foi gerado procede do Espírito Santo.',
  },
  "Isaías 7:14": {
    referencia: "Isaías 7:14",
    texto:
      "Por isso, o Senhor mesmo lhes dará um sinal: a virgem ficará grávida e dará à luz um filho, e o chamará Emanuel.",
  },
  "Mateus 1:25": {
    referencia: "Mateus 1:25",
    texto: "Mas não teve relações com ela enquanto ela não deu à luz um filho. E ele lhe pôs o nome de Jesus.",
  },
  "Marcos 6:3": {
    referencia: "Marcos 6:3",
    texto:
      "Não é este o carpinteiro, filho de Maria e irmão de Tiago, José, Judas e Simão? E as suas irmãs não estão aqui conosco? E ficaram escandalizados por causa dele.",
  },
  "Lucas 3:1": {
    referencia: "Lucas 3:1",
    texto:
      "No décimo quinto ano do reinado de Tibério César, quando Pôncio Pilatos era governador da Judeia, Herodes, tetrarca da Galileia, seu irmão Filipe, tetrarca da região da Ituréia e Traconites, e Lisânias, tetrarca de Abilene...",
  },
  "Lucas 23:1-25": {
    referencia: "Lucas 23:1-25",
    texto:
      'Então toda a assembleia se levantou e o levou a Pilatos. E começaram a acusá-lo, dizendo: "Encontramos este homem subvertendo a nossa nação, proibindo o pagamento de impostos a César e afirmando ser ele mesmo o Cristo, um rei." [...] E Pilatos decidiu atender ao pedido deles. Soltou o homem que fora preso por insurreição e homicídio, aquele que eles pediam, e entregou Jesus à vontade deles.',
  },
  "Marcos 9:31": {
    referencia: "Marcos 9:31",
    texto:
      'Porque estava ensinando os seus discípulos. Dizia-lhes: "O Filho do homem será entregue nas mãos dos homens. Eles o matarão, e três dias depois ele ressuscitará."',
  },
  "Atos 1:10": {
    referencia: "Atos 1:10",
    texto:
      "E estando eles com os olhos fixos no céu, enquanto ele subia, eis que dois homens vestidos de branco se apresentaram junto deles.",
  },
  "Hebreus 1:3": {
    referencia: "Hebreus 1:3",
    texto:
      "O Filho é o resplendor da glória de Deus e a expressão exata do seu ser, sustentando todas as coisas por sua palavra poderosa. Depois de ter realizado a purificação dos pecados, ele se assentou à direita da Majestade nas alturas.",
  },
  "Mateus 25:31-46": {
    referencia: "Mateus 25:31-46",
    texto:
      '"Quando o Filho do homem vier em sua glória, com todos os anjos, assentar-se-á em seu trono na glória celestial. Todas as nações serão reunidas diante dele, e ele separará umas das outras como o pastor separa as ovelhas dos bodes. [...] E estes irão para o castigo eterno, mas os justos para a vida eterna."',
  },
  "2 Timóteo 4:1": {
    referencia: "2 Timóteo 4:1",
    texto:
      "Na presença de Deus e de Cristo Jesus, que há de julgar os vivos e os mortos por sua manifestação e por seu Reino, eu o exorto solenemente:",
  },
  "João 14:26": {
    referencia: "João 14:26",
    texto:
      "Mas o Conselheiro, o Espírito Santo, que o Pai enviará em meu nome, lhes ensinará todas as coisas e lhes fará lembrar tudo o que eu lhes disse.",
  },
  "1 Coríntios 10:16": {
    referencia: "1 Coríntios 10:16",
    texto:
      "Não é verdade que o cálice da bênção que abençoamos é a participação no sangue de Cristo, e que o pão que partimos é a participação no corpo de Cristo?",
  },
  "1 Coríntios 12:27": {
    referencia: "1 Coríntios 12:27",
    texto: "Ora, vocês são o corpo de Cristo, e cada um de vocês, individualmente, é membro desse corpo.",
  },
  "1 João 1:7-9": {
    referencia: "1 João 1:7-9",
    texto:
      "Se, porém, andamos na luz, como ele está na luz, temos comunhão uns com os outros, e o sangue de Jesus, seu Filho, nos purifica de todo pecado. Se afirmarmos que estamos sem pecado, enganamos a nós mesmos, e a verdade não está em nós. Se confessarmos os nossos pecados, ele é fiel e justo para perdoar os nossos pecados e nos purificar de toda injustiça.",
  },
  "Filipenses 3:10-11": {
    referencia: "Filipenses 3:10-11",
    texto:
      "Quero conhecer Cristo, o poder da sua ressurreição e a participação em seus sofrimentos, tornando-me como ele em sua morte para, de alguma forma, alcançar a ressurreição dentre os mortos.",
  },
  "João 6:40": {
    referencia: "João 6:40",
    texto:
      "Porque a vontade de meu Pai é que todo aquele que olhar para o Filho e nele crer tenha a vida eterna, e eu o ressuscitarei no último dia.",
  },
  "Mateus 28:19": {
    referencia: "Mateus 28:19",
    texto:
      "Portanto, vão e façam discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo.",
  },
  "Romanos 5:8": {
    referencia: "Romanos 5:8",
    texto: "Mas Deus demonstra seu amor por nós: Cristo morreu em nosso favor quando ainda éramos pecadores.",
  },
  "1 João 4:7-10": {
    referencia: "1 João 4:7-10",
    texto:
      "Amados, amemos uns aos outros, pois o amor procede de Deus. Aquele que ama é nascido de Deus e conhece a Deus. Quem não ama não conhece a Deus, porque Deus é amor. Foi assim que Deus manifestou o seu amor entre nós: enviou o seu Filho Unigênito ao mundo, para que pudéssemos viver por meio dele. Nisto consiste o amor: não em que nós tenhamos amado a Deus, mas em que ele nos amou e enviou seu Filho como propiciação pelos nossos pecados.",
  },
}

// Regex para detectar referências bíblicas
const BIBLE_REFERENCE_REGEX = /(\d?\s?[A-Za-zÀ-ÿ]+\s+\d+[:.]\d+(?:-\d+)?)/g

export function detectBibleReferences(text: string): { text: string; isReference: boolean; referencia?: string }[] {
  const parts: { text: string; isReference: boolean; referencia?: string }[] = []
  let lastIndex = 0

  const matches = text.matchAll(BIBLE_REFERENCE_REGEX)

  for (const match of matches) {
    // Adicionar texto antes da referência
    if (match.index! > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isReference: false,
      })
    }

    // Adicionar a referência
    const referencia = match[0].trim()
    parts.push({
      text: referencia,
      isReference: true,
      referencia: referencia,
    })

    lastIndex = match.index! + match[0].length
  }

  // Adicionar texto restante
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isReference: false,
    })
  }

  return parts.length > 0 ? parts : [{ text, isReference: false }]
}

export function getVerse(referencia: string): BibleVerse | null {
  return VERSICULOS_BIBLICOS[referencia] || null
}
