// Biblioteca para buscar texto bíblico através da nossa Route Handler
// Evita problemas de CORS ao fazer requisições do servidor

export interface VerseData {
  number: number
  text: string
}

export interface ChapterData {
  book: string
  chapter: number
  text: string // Texto completo do capítulo
}

export async function fetchBibleChapter(
  bookName: string,
  chapter: number
): Promise<ChapterData | null> {
  try {
    const response = await fetch(`/api/bible?book=${encodeURIComponent(bookName)}&chapter=${chapter}`)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[v0] Erro ao buscar capítulo:', error)
    return null
  }
}

export async function fetchMultipleChapters(
  bookName: string,
  startChapter: number,
  endChapter: number
): Promise<ChapterData[]> {
  return []
}
