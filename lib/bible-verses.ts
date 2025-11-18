export type BibleVerse = {
  referencia: string
  texto: string
}

// Biblioteca de versículos bíblicos (NVI)
export const VERSICULOS_BIBLICOS: Record<string, BibleVerse> = {
  "Gênesis 1:1": {
    referencia: "Gênesis 1:1",
    texto: "No princípio Deus criou os céus e a terra."
  },
  "Gênesis 1:26-27": {
    referencia: "Gênesis 1:26-27",
    texto: "Então disse Deus: \"Façamos o homem à nossa imagem, conforme a nossa semelhança. Domine ele sobre os peixes do mar, sobre as aves do céu, sobre os animais grandes de toda a terra e sobre todos os pequenos animais que se movem rente ao chão\". Criou Deus o homem à sua imagem, à imagem de Deus o criou; homem e mulher os criou."
  },
  "João 3:16": {
    referencia: "João 3:16",
    texto: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna."
  },
  "Romanos 5:8": {
    referencia: "Romanos 5:8",
    texto: "Mas Deus demonstra seu amor por nós: Cristo morreu em nosso favor quando ainda éramos pecadores."
  },
  "1 João 4:7-10": {
    referencia: "1 João 4:7-10",
    texto: "Amados, amemos uns aos outros, pois o amor procede de Deus. Aquele que ama é nascido de Deus e conhece a Deus. Quem não ama não conhece a Deus, porque Deus é amor. Foi assim que Deus manifestou o seu amor entre nós: enviou o seu Filho Unigênito ao mundo, para que pudéssemos viver por meio dele. Nisto consiste o amor: não em que nós tenhamos amado a Deus, mas em que ele nos amou e enviou seu Filho como propiciação pelos nossos pecados."
  },
}

// Regex para detectar referências bíblicas
const BIBLE_REFERENCE_REGEX = /(\d?\s?[A-Za-zÀ-ÿ]+\s+\d+:\d+(?:-\d+)?)/g

export function detectBibleReferences(text: string): { text: string; isReference: boolean; referencia?: string }[] {
  const parts: { text: string; isReference: boolean; referencia?: string }[] = []
  let lastIndex = 0

  const matches = text.matchAll(BIBLE_REFERENCE_REGEX)
  
  for (const match of matches) {
    // Adicionar texto antes da referência
    if (match.index! > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, match.index),
        isReference: false
      })
    }
    
    // Adicionar a referência
    const referencia = match[0].trim()
    parts.push({
      text: referencia,
      isReference: true,
      referencia: referencia
    })
    
    lastIndex = match.index! + match[0].length
  }
  
  // Adicionar texto restante
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isReference: false
    })
  }
  
  return parts.length > 0 ? parts : [{ text, isReference: false }]
}

export function getVerse(referencia: string): BibleVerse | null {
  return VERSICULOS_BIBLICOS[referencia] || null
}
