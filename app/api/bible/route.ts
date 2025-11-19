import { NextRequest, NextResponse } from 'next/server'
import { bibleData } from '@/lib/bible-data'

const BOOK_ABBREVIATIONS: Record<string, string> = {
  'Gênesis': 'gn',
  'Genesis': 'gn',
  'Êxodo': 'ex',
  'Exodo': 'ex',
  'João': 'jo',
  'Joao': 'jo',
  'Marcos': 'mc',
  'Mateus': 'mt',
  'Lucas': 'lc',
  'Atos': 'at',
  'Romanos': 'rm',
  'Filipenses': 'fp',
  'Efésios': 'ef',
  'Efesios': 'ef',
  'Colossenses': 'cl',
  '1 Tessalonicenses': '1ts',
  '1 Coríntios': '1co',
  '1 Corinthios': '1co',
  '2 Coríntios': '2co',
  '2 Corinthios': '2co',
  'Gálatas': 'gl',
  'Galatas': 'gl',
  'Hebreus': 'hb',
  'Salmos': 'sl',
  'Provérbios': 'pv',
  'Proverbios': 'pv',
  'Isaías': 'is',
  'Isaias': 'is',
  'Ezequiel': 'ez',
  'Daniel': 'dn',
  'Apocalipse': 'ap'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const book = searchParams.get('book')
    const chapter = searchParams.get('chapter')

    console.log('[v0] ===== BIBLE API REQUEST =====')
    console.log('[v0] Raw book param:', book)
    console.log('[v0] Raw chapter param:', chapter)
    console.log('[v0] Book type:', typeof book)
    console.log('[v0] Chapter type:', typeof chapter)

    if (!book || !chapter) {
      console.log('[v0] Missing parameters!')
      return NextResponse.json(
        { error: 'Parâmetros book e chapter são obrigatórios' },
        { status: 400 }
      )
    }

    const normalizedBook = book.trim().toLowerCase()
    console.log('[v0] Normalized book:', normalizedBook)
    console.log('[v0] Available books in mapping:', Object.keys(BOOK_ABBREVIATIONS))
    
    const bookData = bibleData.find(b => 
      b.name.toLowerCase() === normalizedBook ||
      b.abbrev.pt.toLowerCase() === normalizedBook
    )

    if (!bookData) {
      console.error('[v0] Book not found in local data!')
      console.log('[v0] Tried:', normalizedBook)
      return NextResponse.json(
        { error: `Livro "${book}" não encontrado` },
        { status: 404 }
      )
    }

    // Encontrar o capítulo
    const chapterData = bookData.chapters.find(c => c.number === parseInt(chapter))

    if (!chapterData) {
      console.error('[v0] Chapter not found in local data!')
      console.log('[v0] Tried:', chapter)
      return NextResponse.json(
        { error: `Capítulo ${chapter} não encontrado no livro ${bookData.name}` },
        { status: 404 }
      )
    }

    // Retornar no formato esperado pelo componente
    const transformedData = {
      book: bookData.name,
      chapter: parseInt(chapter),
      verses: chapterData.verses
    }

    console.log('[v0] Transformed data:', JSON.stringify(transformedData, null, 2))
    console.log('[v0] ===== END BIBLE API REQUEST =====')

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('[v0] ===== BIBLE API ERROR =====')
    console.error('[v0] Error:', error)
    console.error('[v0] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { 
        error: 'Erro ao buscar texto bíblico',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
