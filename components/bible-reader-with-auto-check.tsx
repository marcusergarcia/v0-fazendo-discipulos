"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Highlighter, Check } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { marcarCapituloLido } from "@/app/dashboard/leitura-biblica/actions"
import { cn } from "@/lib/utils"

interface BibleReaderWithAutoCheckProps {
  bookName: string
  livroId: number
  startChapter: number
  endChapter: number
  capitulosLidos: Set<number>
  onChapterRead?: (chapter: number) => void
}

interface Highlight {
  texto_selecionado: string
  cor: string
}

const HIGHLIGHT_COLORS = [
  { name: "Amarelo", value: "yellow", class: "bg-yellow-200 dark:bg-yellow-900/30" },
  { name: "Verde", value: "green", class: "bg-green-200 dark:bg-green-900/30" },
  { name: "Azul", value: "blue", class: "bg-blue-200 dark:bg-blue-900/30" },
  { name: "Rosa", value: "pink", class: "bg-pink-200 dark:bg-pink-900/30" },
  { name: "Roxo", value: "purple", class: "bg-purple-200 dark:bg-purple-900/30" },
]

const MIN_READ_TIME_MS = 300000 // 5 minutos em milissegundos

export function BibleReaderWithAutoCheck({
  bookName,
  livroId,
  startChapter,
  endChapter,
  capitulosLidos,
  onChapterRead,
}: BibleReaderWithAutoCheckProps) {
  const [currentChapter, setCurrentChapter] = useState(startChapter)
  const [chapterData, setChapterData] = useState<{ chapter: number; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [autoMarked, setAutoMarked] = useState(false)

  const [highlightMode, setHighlightMode] = useState(false)
  const [selectedColor, setSelectedColor] = useState("yellow")
  const [highlights, setHighlights] = useState<Highlight[]>([])

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [isMounted, setIsMounted] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    loadChapter(currentChapter)
  }, [currentChapter, livroId])

  useEffect(() => {
    if (!loading && chapterData && !capitulosLidos.has(currentChapter)) {
      const startTime = Date.now()
      setReadingStartTime(startTime)
      setScrolledToBottom(false)
      setAutoMarked(false)
      setTimeElapsed(0)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(() => {
        setTimeElapsed(Date.now() - startTime)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [loading, chapterData, currentChapter, capitulosLidos])

  useEffect(() => {
    const shouldAutoMark =
      scrolledToBottom && timeElapsed >= MIN_READ_TIME_MS && !autoMarked && !capitulosLidos.has(currentChapter)

    console.log("[v0] Verificando auto-check:", {
      scrolledToBottom,
      timeElapsed,
      MIN_READ_TIME_MS,
      tempoSuficiente: timeElapsed >= MIN_READ_TIME_MS,
      autoMarked,
      jaLido: capitulosLidos.has(currentChapter),
      shouldAutoMark,
    })

    if (shouldAutoMark) {
      handleAutoMarkAsRead()
    }
  }, [scrolledToBottom, timeElapsed, autoMarked, currentChapter, capitulosLidos])

  const loadChapter = async (chapter: number) => {
    setLoading(true)
    setError(null)
    setReadingStartTime(null)
    setTimeElapsed(0)

    const { data, error: supabaseError } = await supabase
      .from("capitulos_biblia")
      .select("texto, numero_capitulo")
      .eq("livro_id", livroId)
      .eq("numero_capitulo", chapter)
      .single()

    if (data && !supabaseError) {
      setChapterData({
        chapter: data.numero_capitulo,
        text: data.texto || "Texto não disponível",
      })
      await loadHighlights(chapter)
    } else {
      console.error("[v0] Erro ao buscar capítulo:", supabaseError)
      setError("Texto do capítulo não encontrado no banco de dados")
    }

    setLoading(false)
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50

    if (isAtBottom && !scrolledToBottom) {
      console.log("[v0] Usuário rolou até o fim do capítulo")
      setScrolledToBottom(true)
    }
  }

  const handleAutoMarkAsRead = async () => {
    console.log("[v0] ========================================")
    console.log("[v0] AUTO-MARCANDO CAPÍTULO COMO LIDO!")
    console.log("[v0] Capítulo atual:", currentChapter)
    console.log("[v0] Livro ID:", livroId)
    console.log("[v0] Tempo decorrido:", formatTime(timeElapsed))
    console.log("[v0] ========================================")

    setAutoMarked(true)

    const result = await marcarCapituloLido(livroId, currentChapter, timeElapsed)

    console.log("[v0] ========================================")
    console.log("[v0] RESULTADO DA MARCAÇÃO:", result)
    console.log("[v0] Success:", result.success)
    console.log("[v0] XP Ganho:", result.xpGanho)
    console.log("[v0] ========================================")

    if (result.success && result.xpGanho && result.xpGanho > 0) {
      alert(`🎉 Capítulo ${currentChapter} concluído! +${result.xpGanho} XP`)
    }

    if (result.success) {
      console.log("[v0] ========================================")
      console.log("[v0] CHAMANDO onChapterRead!")
      console.log("[v0] onChapterRead existe?", !!onChapterRead)
      console.log("[v0] Passando capítulo:", currentChapter)
      console.log("[v0] ========================================")

      onChapterRead?.(currentChapter)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
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

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const timeRemaining = Math.max(0, MIN_READ_TIME_MS - timeElapsed)
  const progressPercent = Math.min(100, (timeElapsed / MIN_READ_TIME_MS) * 100)

  const handleTextSelection = async () => {
    if (!highlightMode) return

    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      alert("Você precisa estar logado para salvar marcações")
      return
    }

    const selectedText = selection.toString()

    const { error: insertError } = await supabase.from("highlights_biblia").insert({
      usuario_id: user.id,
      livro_id: livroId,
      numero_capitulo: currentChapter,
      numero_versiculo: 1,
      texto_selecionado: selectedText,
      cor: selectedColor,
    })

    if (!insertError) {
      await loadHighlights(currentChapter)
      alert("✨ Texto marcado com sucesso!")
      selection.removeAllRanges()
    } else {
      console.error("[v0] Erro ao salvar highlight:", insertError)
      alert("Erro ao salvar marcação")
    }
  }

  const loadHighlights = async (chapter: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: highlightError } = await supabase
      .from("highlights_biblia")
      .select("texto_selecionado, cor")
      .eq("usuario_id", user.id)
      .eq("livro_id", livroId)
      .eq("numero_capitulo", chapter)

    if (data && !highlightError) {
      setHighlights(data)
    } else {
      setHighlights([])
    }
  }

  const renderTextWithHighlights = (text: string) => {
    if (highlights.length === 0) {
      return text
    }

    const highlightedText = text
    const parts: { text: string; color?: string }[] = []
    let lastIndex = 0

    const sortedHighlights = [...highlights].sort((a, b) => {
      const indexA = text.indexOf(a.texto_selecionado)
      const indexB = text.indexOf(b.texto_selecionado)
      return indexA - indexB
    })

    sortedHighlights.forEach((highlight) => {
      const index = highlightedText.indexOf(highlight.texto_selecionado, lastIndex)
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: highlightedText.slice(lastIndex, index) })
        }
        parts.push({
          text: highlight.texto_selecionado,
          color: highlight.cor,
        })
        lastIndex = index + highlight.texto_selecionado.length
      }
    })

    if (lastIndex < highlightedText.length) {
      parts.push({ text: highlightedText.slice(lastIndex) })
    }

    return parts.map((part, index) => {
      if (part.color) {
        const colorClass = HIGHLIGHT_COLORS.find((c) => c.value === part.color)?.class || ""
        return (
          <span key={index} className={cn("rounded px-0.5", colorClass)}>
            {part.text}
          </span>
        )
      }
      return <span key={index}>{part.text}</span>
    })
  }

  const handleForceMarkAsRead = () => {
    console.log("[v0] FORÇANDO MARCAÇÃO MANUAL VIA BOTÃO DE TESTE")
    handleAutoMarkAsRead()
  }

  if (!isMounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle>
              {bookName} {currentChapter}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
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
            {capitulosLidos.has(currentChapter) && <Check className="w-5 h-5 text-green-500" />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={highlightMode ? "default" : "outline"}
              size="sm"
              onClick={() => setHighlightMode(!highlightMode)}
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!capitulosLidos.has(currentChapter) && !loading && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{scrolledToBottom ? "✓ Rolou até o fim" : "Role até o fim do capítulo"}</span>
              <span>
                {timeElapsed >= MIN_READ_TIME_MS ? "✓ Tempo mínimo atingido" : `${formatTime(timeRemaining)} restantes`}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {highlightMode && (
          <div className="mt-3 flex gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "w-8 h-8 rounded border-2 transition-all",
                  color.class,
                  selectedColor === color.value ? "border-primary scale-110" : "border-transparent",
                )}
                title={color.name}
              />
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] w-full rounded-md border p-4" ref={scrollAreaRef} onScroll={handleScroll}>
            <div
              className={cn(
                "text-base leading-relaxed whitespace-pre-wrap",
                highlightMode && "select-text cursor-text",
              )}
              style={{ userSelect: highlightMode ? "text" : "auto" }}
              onMouseUp={handleTextSelection}
            >
              {renderTextWithHighlights(chapterData?.text || "")}
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

          {!capitulosLidos.has(currentChapter) && !loading && (
            <Button variant="secondary" size="sm" onClick={handleForceMarkAsRead}>
              [DEBUG] Marcar
            </Button>
          )}

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
