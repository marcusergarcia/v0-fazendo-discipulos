import { NextRequest, NextResponse } from 'next/server'

// Route Handler para buscar texto bíblico sem problemas de CORS
// As requisições são feitas no servidor, então não há restrições de CORS

const BOOK_ABBREVIATIONS: Record<string, string> = {
  'Gênesis': 'gn',
  'Êxodo': 'ex',
  'João': 'jo',
  'Marcos': 'mc',
  'Mateus': 'mt',
  'Lucas': 'lc',
  'Atos': 'at',
  'Romanos': 'rm',
  'Filipenses': 'fp',
  'Efésios': 'ef',
  'Colossenses': 'cl',
  '1 Tessalonicenses': '1ts',
  '1 Coríntios': '1co',
  '2 Coríntios': '2co',
  'Gálatas': 'gl',
  'Hebreus': 'hb',
  'Salmos': 'sl',
  'Provérbios': 'pv',
  'Isaías': 'is',
  'Ezequiel': 'ez',
  'Daniel': 'dn',
  'Apocalipse': 'ap'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const book = searchParams.get('book')
    const chapter = searchParams.get('chapter')

    if (!book || !chapter) {
      return NextResponse.json(
        { error: 'Parâmetros book e chapter são obrigatórios' },
        { status: 400 }
      )
    }

    const bookAbbr = BOOK_ABBREVIATIONS[book]
    
    if (!bookAbbr) {
      return NextResponse.json(
        { error: `Livro não encontrado: ${book}` },
        { status: 404 }
      )
    }

    // Tentar ABíbliaDigital primeiro
    const url = `https://www.abibliadigital.com.br/api/verses/nvi/${bookAbbr}/${chapter}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      throw new Error(`API respondeu com status ${response.status}`)
    }

    const data = await response.json()
    
    // Transformar resposta para formato padrão
    const transformedData = {
      book: data.book?.name || book,
      chapter: data.chapter?.number || parseInt(chapter),
      verses: data.verses?.map((v: any) => ({
        number: v.number,
        text: v.text
      })) || []
    }

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('[v0] Erro ao buscar texto bíblico:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao buscar texto bíblico',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
