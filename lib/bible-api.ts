// Biblioteca para buscar texto bíblico da API ABíbliaDigital
// API gratuita com versão NVI em português

const BIBLE_APIS = [
  {
    name: 'Bible API Portugal',
    baseUrl: 'https://bible-api.deno.dev/api',
    version: 'nvi',
    format: (book: string, chapter: number) => `${book}/${chapter}?version=nvi`
  }
]

// Mapeamento de nomes de livros em português para abreviações da API
const BOOK_ABBREVIATIONS: Record<string, string> = {
  'Gênesis': 'genesis',
  'Êxodo': 'exodus',
  'João': 'john',
  'Marcos': 'mark',
  'Mateus': 'matthew',
  'Lucas': 'luke',
  'Atos': 'acts',
  'Romanos': 'romans',
  'Filipenses': 'philippians',
  'Efésios': 'ephesians',
  'Colossenses': 'colossians',
  '1 Tessalonicenses': '1thessalonians',
  '1 Coríntios': '1corinthians',
  '2 Coríntios': '2corinthians',
  'Gálatas': 'galatians',
  'Hebreus': 'hebrews',
  'Salmos': 'psalms',
  'Provérbios': 'proverbs',
  'Isaías': 'isaiah',
  'Ezequiel': 'ezekiel',
  'Daniel': 'daniel',
  'Apocalipse': 'revelation'
}

export interface VerseData {
  number: number
  text: string
}

export interface ChapterData {
  book: string
  chapter: number
  verses: VerseData[]
}

async function fetchWithFallback(
  bookAbbr: string,
  chapter: number
): Promise<ChapterData | null> {
  // Tentar cada API até uma funcionar
  for (const api of BIBLE_APIS) {
    try {
      const url = `${api.baseUrl}/${api.format(bookAbbr, chapter)}`
      console.log('[v0] Tentando buscar de:', url)
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Dados recebidos:', data)
        
        // Adaptar resposta para formato padrão
        return parseApiResponse(data)
      }
    } catch (error) {
      console.error(`[v0] Erro na API ${api.name}:`, error)
      continue
    }
  }
  
  return null
}

function parseApiResponse(data: any): ChapterData | null {
  try {
    // Se a resposta tem formato { verses: [...] }
    if (data.verses && Array.isArray(data.verses)) {
      return {
        book: data.book || '',
        chapter: data.chapter || 1,
        verses: data.verses.map((v: any) => ({
          number: v.verse || v.number || 1,
          text: v.text || ''
        }))
      }
    }
    
    // Se a resposta tem formato diferente
    return null
  } catch (error) {
    console.error('[v0] Erro ao parsear resposta:', error)
    return null
  }
}

export async function fetchBibleChapter(
  bookName: string,
  chapter: number
): Promise<ChapterData | null> {
  try {
    const bookAbbr = BOOK_ABBREVIATIONS[bookName]
    
    if (!bookAbbr) {
      console.error(`[v0] Livro não encontrado no mapeamento: ${bookName}`)
      return null
    }

    console.log(`[v0] Buscando ${bookName} ${chapter} (${bookAbbr})`)
    
    const data = await fetchWithFallback(bookAbbr, chapter)
    
    if (data) {
      console.log('[v0] Capítulo carregado com sucesso')
      return data
    }
    
    console.error('[v0] Todas as APIs falharam')
    return null
    
  } catch (error) {
    console.error('[v0] Erro ao buscar texto bíblico:', error)
    return null
  }
}

export async function fetchMultipleChapters(
  bookName: string,
  startChapter: number,
  endChapter: number
): Promise<ChapterData[]> {
  const chapters: ChapterData[] = []
  
  for (let chapter = startChapter; chapter <= endChapter; chapter++) {
    const data = await fetchBibleChapter(bookName, chapter)
    if (data) {
      chapters.push(data)
    }
  }
  
  return chapters
}
