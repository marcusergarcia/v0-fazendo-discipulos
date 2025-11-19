'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, Loader2, BookOpen } from 'lucide-react'
import { fetchBibleChapter, type ChapterData } from '@/lib/bible-api'

interface BibleReaderProps {
  bookName: string
  startChapter: number
  endChapter: number
}

export function BibleReader({ bookName, startChapter, endChapter }: BibleReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(startChapter)
  const [chapterData, setChapterData] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadChapter(currentChapter)
  }, [currentChapter, bookName])

  const loadChapter = async (chapter: number) => {
    setLoading(true)
    setError(null)
    
    const data = await fetchBibleChapter(bookName, chapter)
    
    if (data) {
      setChapterData(data)
    } else {
      setError('api-error')
    }
    
    setLoading(false)
  }

  const handlePrevChapter = () => {
    if (currentChapter > startChapter) {
      setCurrentChapter(currentChapter - 1)
    }
  }

  const handleNextChapter = () => {
    if (currentChapter < endChapter) {
      setCurrentChapter(currentChapter + 1)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle>
              {bookName} {currentChapter}
            </CardTitle>
          </div>
          <CardDescription>
            Capítulo {currentChapter - startChapter + 1} de {endChapter - startChapter + 1}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">
              Este capítulo ainda não foi adicionado ao banco de dados.
            </p>
            <p className="text-sm text-muted-foreground">
              Por favor, aguarde enquanto populamos a Bíblia completa ACF.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-4">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {chapterData?.text}
              </p>
            </div>
          </ScrollArea>
        )}

        <div className="flex items-center justify-between mt-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevChapter}
            disabled={currentChapter <= startChapter || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentChapter} / {endChapter}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextChapter}
            disabled={currentChapter >= endChapter || loading}
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
