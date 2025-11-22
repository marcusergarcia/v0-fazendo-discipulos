"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Loader2, BookOpen, Highlighter, Check, PlayCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { marcarCapituloLido } from "@/app/dashboard/leitura-biblica/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface BibleReaderWithAutoCheckProps {
  bookName: string
  livroId: number
  startChapter: number
  endChapter: number
  capitulosLidos: Set<number>
  onChapterRead?: (chapter: number) => void
  capituloInicialJaLido?: boolean
}

const HIGHLIGHT_COLORS = [
  { name: "Amarelo", value: "yellow", class: "bg-yellow-200 dark:bg-yellow-900/30" },
  { name: "Verde", value: "green", class: "bg-green-200 dark:bg-green-900/30" },
  { name: "Azul", value: "blue", class: "bg-blue-200 dark:bg-blue-900/30" },
  { name: "Rosa", value: "pink", class: "bg-pink-200 dark:bg-pink-900/30" },
  { name: "Roxo", value: "purple", class: "bg-purple-200 dark:bg-purple-900/30" },
]

const MIN_READ_TIME_MS = 120000 // 2 minutos

export function BibleReaderWithAutoCheck({
  bookName,
  livroId,
  startChapter,
  endChapter,
  capitulosLidos,
  onChapterRead,
  capituloInicialJaLido = false,
}: BibleReaderWithAutoCheckProps) {
  const [currentChapter, setCurrentChapter] = useState(startChapter)
  const [chapterData, setChapterData] = useState<{ chapter: number; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [rastreamentoAtivo, setRastreamentoAtivo] = useState(false)

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

  const [capituloAtualJaLido, setCapituloAtualJaLido] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setCurrentChapter(startChapter)
  }, [startChapter])

  useEffect(() => {
    loadChapter(currentChapter)
    setRastreamentoAtivo(false)
  }, [currentChapter, livroId])

  useEffect(() => {
    if (!loading && chapterData && !capitulosLidos.has(currentChapter) && rastreamentoAtivo) {
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
  }, [loading, chapterData, currentChapter, capitulosLidos, rastreamentoAtivo])

  useEffect(() => {
    if (!rastreamentoAtivo) return

    const handleScroll = () => {
      const scrollContainer = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLDivElement

      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 20

        if (isAtBottom && !scrolledToBottom) {
          setScrolledToBottom(true)
        }
      }
    }

    const scrollContainer = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      handleScroll()

      return () => scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [loading, chapterData, currentChapter, rastreamentoAtivo])

  useEffect(() => {
    if (
      scrolledToBottom &&
      timeElapsed >= MIN_READ_TIME_MS &&
      !autoMarked &&
      !capitulosLidos.has(currentChapter) &&
      !loading &&
      rastreamentoAtivo
    ) {
      handleAutoMarkAsRead()
    }
  }, [scrolledToBottom, timeElapsed, autoMarked, currentChapter, capitulosLidos, loading, rastreamentoAtivo])

  useEffect(() => {
    const jaLido = capitulosLidos.has(currentChapter)

    setCapituloAtualJaLido(jaLido)
  }, [currentChapter, capitulosLidos, startChapter, capituloInicialJaLido])

  const loadChapter = async (chapter: number) => {
    setLoading(true)
    setError(null)

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
      setError("Texto do capítulo não encontrado no banco de dados")
    }

    setLoading(false)
  }

  const handleAutoMarkAsRead = async () => {
    setAutoMarked(true)

    const result = await marcarCapituloLido(livroId, currentChapter, timeElapsed)

    if (result.success && result.xpGanho && result.xpGanho > 0) {
      toast.success(`Capítulo ${currentChapter} concluído! +${result.xpGanho} XP`, {
        duration: 2000,
      })
    }

    if (result.success) {
      onChapterRead?.(currentChapter)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const iniciarRastreamento = () => {
    setRastreamentoAtivo(true)
  }

  const handlePrevChapter = () => {
    if (currentChapter > startChapter) {
      setCurrentChapter(currentChapter - 1)
      setRastreamentoAtivo(false)
      setScrolledToBottom(false)
      setReadingStartTime(null)
      setTimeElapsed(0)
      setAutoMarked(false)
    }
  }

  const handleNextChapter = () => {
    if (currentChapter < endChapter) {
      setCurrentChapter(currentChapter + 1)
      setRastreamentoAtivo(false)
      setScrolledToBottom(false)
      setReadingStartTime(null)
      setTimeElapsed(0)
      setAutoMarked(false)
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
      toast.error("Você precisa estar logado para salvar marcações", {
        duration: 2000,
      })
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
      toast.success("Texto marcado com sucesso!", {
        duration: 2000,
      })
      selection.removeAllRanges()
    } else {
      toast.error("Erro ao salvar marcação", {
        duration: 2000,
      })
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
            {capituloAtualJaLido && <Check className="w-5 h-5 text-green-500" />}
          </div>
          <div className="flex items-center gap-2">
            {!capituloAtualJaLido && !loading && !rastreamentoAtivo && (
              <Button size="sm" onClick={iniciarRastreamento} className="gap-2">
                <PlayCircle className="w-4 h-4" />
                Ler Agora
              </Button>
            )}
            {(rastreamentoAtivo || capituloAtualJaLido) && (
              <div className="flex gap-1.5">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setSelectedColor(color.value)
                      setHighlightMode(true)
                    }}
                    className={cn(
                      "w-7 h-7 rounded border-2 transition-all hover:scale-110",
                      color.class,
                      selectedColor === color.value && highlightMode ? "border-primary scale-110" : "border-gray-300",
                    )}
                    title={color.name}
                  />
                ))}
                <Button
                  variant={highlightMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHighlightMode(!highlightMode)}
                >
                  <Highlighter className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {!capituloAtualJaLido && !loading && rastreamentoAtivo && (
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
          <ScrollArea className="h-[400px] w-full rounded-md border p-4" ref={scrollAreaRef}>
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
