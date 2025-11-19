'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Highlighter } from 'lucide-react'
import { fetchBibleChapter, type ChapterData } from '@/lib/bible-api'
import { cn } from '@/lib/utils'

interface BibleReaderEnhancedProps {
  bookName: string
  startChapter: number
  endChapter: number
  discipuloId: string
  onChapterRead?: (chapter: number) => void
}

const HIGHLIGHT_COLORS = [
  { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-200' },
  { name: 'Verde', value: 'green', class: 'bg-green-200' },
  { name: 'Azul', value: 'blue', class: 'bg-blue-200' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-200' },
  { name: 'Roxo', value: 'purple', class: 'bg-purple-200' },
]

const MIN_READ_TIME_SECONDS = 180

export function BibleReaderEnhanced({ 
  bookName, 
  startChapter, 
  endChapter, 
  discipuloId,
  onChapterRead 
}: BibleReaderEnhancedProps) {
  const [currentChapter, setCurrentChapter] = useState(startChapter)
  const [chapterData, setChapterData] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [chaptersRead, setChaptersRead] = useState<Record<number, boolean>>({})
  const [scrolledToEnd, setScrolledToEnd] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [highlightMode, setHighlightMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState('yellow')
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadChapter(currentChapter)
  }, [currentChapter, bookName])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setReadingTime((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentChapter])

  useEffect(() => {
    if (scrolledToEnd && readingTime >= MIN_READ_TIME_SECONDS && !chaptersRead[currentChapter]) {
      handleCheckChapter(currentChapter, true)
    }
  }, [scrolledToEnd, readingTime, currentChapter])

  const loadChapter = async (chapter: number) => {
    setLoading(true)
    setError(null)
    setScrolledToEnd(false)
    setReadingTime(0)
    
    const data = await fetchBibleChapter(bookName, chapter)
    
    if (data) {
      setChapterData(data)
    } else {
      setError('api-error')
    }
    
    setLoading(false)
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50
    
    if (isAtBottom && !scrolledToEnd) {
      setScrolledToEnd(true)
      console.log('[v0] Usuário rolou até o fim do capítulo')
    }
  }

  const handleCheckChapter = async (chapter: number, checked: boolean) => {
    setChaptersRead((prev) => ({ ...prev, [chapter]: checked }))
    
    if (checked && onChapterRead) {
      onChapterRead(chapter)
    }
    
    // TODO: Salvar no banco de dados
    console.log('[v0] Capítulo marcado:', chapter, checked)
  }

  const handleTextSelection = () => {
    if (!highlightMode) return
    
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString()
      console.log('[v0] Texto selecionado para highlight:', selectedText, 'cor:', selectedColor)
      // TODO: Salvar highlight no banco
    }
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
        
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant={highlightMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHighlightMode(!highlightMode)}
          >
            <Highlighter className="w-4 h-4 mr-2" />
            {highlightMode ? 'Desativar' : 'Ativar'} Marcador
          </Button>
          
          {highlightMode && (
            <div className="flex gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    'w-8 h-8 rounded border-2 transition-all',
                    color.class,
                    selectedColor === color.value ? 'border-black scale-110' : 'border-gray-300'
                  )}
                  title={color.name}
                />
              ))}
            </div>
          )}
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
          <>
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
              {Array.from({ length: endChapter - startChapter + 1 }, (_, i) => {
                const chapterNum = startChapter + i
                return (
                  <div key={chapterNum} className="flex items-center gap-2">
                    <Checkbox
                      id={`chapter-${chapterNum}`}
                      checked={chaptersRead[chapterNum] || false}
                      onCheckedChange={(checked) => handleCheckChapter(chapterNum, checked as boolean)}
                    />
                    <label
                      htmlFor={`chapter-${chapterNum}`}
                      className={cn(
                        'text-sm cursor-pointer',
                        chaptersRead[chapterNum] && 'line-through text-muted-foreground'
                      )}
                    >
                      {chapterNum}
                    </label>
                  </div>
                )
              })}
            </div>

            <ScrollArea 
              ref={scrollRef}
              className="h-[400px] w-full rounded-md border p-4"
              onScroll={handleScroll}
            >
              <div 
                className="space-y-4"
                onMouseUp={handleTextSelection}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap select-text">
                  {chapterData?.text}
                </p>
              </div>
            </ScrollArea>

            <div className="mt-2 text-xs text-muted-foreground text-center">
              {readingTime < MIN_READ_TIME_SECONDS ? (
                <>
                  ⏱️ Tempo de leitura: {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, '0')} 
                  {!scrolledToEnd && ' • Role até o fim para marcar automaticamente'}
                </>
              ) : scrolledToEnd ? (
                '✅ Leitura completa!'
              ) : (
                '⏱️ Role até o fim para marcar como lido'
              )}
            </div>
          </>
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
