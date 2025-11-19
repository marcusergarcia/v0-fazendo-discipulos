// Biblioteca para buscar texto bíblico através da nossa Route Handler
// Evita problemas de CORS ao fazer requisições do servidor

export interface VerseData {
  number: number
  text: string
}

export interface ChapterData {
  book: string
  chapter: number
  verses: VerseData[]
}

export async function fetchBibleChapter(
  bookName: string,
  chapter: number
): Promise<ChapterData | null> {
  try {
    console.log(`[v0] Buscando ${bookName} capítulo ${chapter}`)
    
    // Chamar nossa própria API Route Handler que não tem problemas de CORS
    const response = await fetch(
      `/api/bible?book=${encodeURIComponent(bookName)}&chapter=${chapter}`
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('[v0] Erro na API:', error)
      return null
    }

    const data = await response.json()
    console.log('[v0] Capítulo carregado com sucesso')
    
    return data
    
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
