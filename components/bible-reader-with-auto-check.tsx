"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  Highlighter,
  Check,
  PlayCircle,
  Undo2,
  Redo2,
} from "lucide-react"
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
  capitulosSemana?: number[]
  initialChapter?: number
}

interface Highlight {
  id: number
  texto: string
  cor: string
}

interface HighlightData {
  id: number
  marcacoes: Highlight[]
}

interface HistoryAction {
  type: "add" | "remove"
  highlight: Highlight
  timestamp: number
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
  capitulosSemana = [],
  initialChapter,
}: BibleReaderWithAutoCheckProps) {
  const [currentChapter, setCurrentChapter] = useState(initialChapter || startChapter)
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

  const [highlightData, setHighlightData] = useState<HighlightData | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])

  const [history, setHistory] = useState<HistoryAction[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [isMounted, setIsMounted] = useState(false)

  const [capituloAtualJaLido, setCapituloAtualJaLido] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const getCapituloIdReal = (numeroCapitulo: number): number => {
    const index = numeroCapitulo - startChapter
    const idReal = capitulosSemana[index]
    console.log(
      `[v0] 🔍 getCapituloIdReal - numeroCapitulo: ${numeroCapitulo} startChapter: ${startChapter} index: ${index} ID real: ${idReal}`,
    )
    return idReal || numeroCapitulo
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setCurrentChapter(initialChapter || startChapter)
  }, [initialChapter, startChapter])

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
    const scrollContainer = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement

    if (scrollContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 20

        if (isAtBottom && !scrolledToBottom) {
          setScrolledToBottom(true)
        }
      }

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
    console.log("[v0] 🔄 VERIFICANDO STATUS DO CAPÍTULO:", currentChapter)
    console.log("[v0] startChapter:", startChapter)
    const indexAtual = currentChapter - startChapter
    console.log("[v0] indexAtual:", indexAtual)
    const idReal = capitulosSemana[indexAtual]
    console.log("[v0] ID real:", idReal)
    const isLido = capitulosLidos.has(idReal)
    console.log("[v0] Status isLido:", isLido)
    console.log("[v0] capitulosLidos Set:", Array.from(capitulosLidos))
    setCapituloAtualJaLido(isLido)
  }, [currentChapter, capitulosLidos, startChapter, capitulosSemana])

  const loadChapter = async (chapter: number) => {
    setLoading(true)
    setError(null)

    const idReal = getCapituloIdReal(chapter)

    const { data, error: supabaseError } = await supabase
      .from("capitulos_biblia")
      .select("texto, numero_capitulo, id")
      .eq("id", idReal)
      .single()

    if (data && !supabaseError) {
      setChapterData({
        chapter: data.numero_capitulo,
        text: data.texto || "Texto não disponível",
      })
      await loadHighlights(chapter)
    } else {
      console.error("[v0] BibleReader: Erro ao buscar texto:", supabaseError)
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
      const idReal = getCapituloIdReal(currentChapter)
      console.log(`[v0] ✅ Capítulo marcado como lido - número: ${currentChapter}, ID real: ${idReal}`)
      onChapterRead?.(idReal)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const iniciarRastreamento = () => {
    console.log("[v0] 🟢 BOTÃO 'LER AGORA' CLICADO")
    console.log("[v0] Capítulo atual:", currentChapter)
    console.log("[v0] Livro ID:", livroId)
    console.log("[v0] Capítulo inicial já lido?", capituloInicialJaLido)
    console.log("[v0] Rastreamento INICIADO")

    setRastreamentoAtivo(true)
  }

  const handlePrevChapter = () => {
    console.log("[v0] ⬅️ BOTÃO 'ANTERIOR' CLICADO")
    console.log("[v0] Capítulo atual:", currentChapter)
    console.log("[v0] Capítulo anterior será:", currentChapter - 1)

    if (currentChapter > startChapter) {
      const novoCapitulo = currentChapter - 1
      const idRealAnterior = getCapituloIdReal(novoCapitulo)
      const jaLidoAnterior = capitulosLidos.has(idRealAnterior)

      console.log("[v0] ID real do capítulo anterior:", idRealAnterior)
      console.log("[v0] Capítulo anterior já lido?", jaLidoAnterior)

      setCurrentChapter(novoCapitulo)
      setCapituloAtualJaLido(jaLidoAnterior)
      setRastreamentoAtivo(false)
      setScrolledToBottom(false)
      setReadingStartTime(null)
      setTimeElapsed(0)
      setAutoMarked(false)
      console.log("[v0] Mudança para capítulo anterior CONCLUÍDA")
    } else {
      console.log("[v0] ⚠ Já está no primeiro capítulo da semana")
    }
  }

  const handleNextChapter = () => {
    console.log("[v0] ➡️ BOTÃO 'PROSSEGUIR' CLICADO")
    console.log("[v0] Capítulo atual:", currentChapter)
    console.log("[v0] Próximo capítulo será:", currentChapter + 1)

    if (currentChapter < endChapter) {
      const novoCapitulo = currentChapter + 1
      const idRealProximo = getCapituloIdReal(novoCapitulo)
      const jaLidoProximo = capitulosLidos.has(idRealProximo)

      console.log("[v0] ID real do próximo capítulo:", idRealProximo)
      console.log("[v0] Próximo capítulo já lido?", jaLidoProximo)

      setCurrentChapter(novoCapitulo)
      setCapituloAtualJaLido(jaLidoProximo)
      setRastreamentoAtivo(false)
      setScrolledToBottom(false)
      setReadingStartTime(null)
      setTimeElapsed(0)
      setAutoMarked(false)
      console.log("[v0] Mudança para próximo capítulo CONCLUÍDA")
    } else {
      console.log("[v0] ⚠ Já está no último capítulo da semana")
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

    const { data: existing } = await supabase
      .from("highlights_biblia")
      .select("id, marcacoes")
      .eq("usuario_id", user.id)
      .eq("livro_id", livroId)
      .eq("numero_capitulo", currentChapter)
      .single()

    const newHighlight: Highlight = {
      id: Date.now(), // ID temporário único
      texto: selectedText,
      cor: selectedColor,
    }

    let updatedMarcacoes: Highlight[] = []

    if (existing) {
      updatedMarcacoes = [...(existing.marcacoes || []), newHighlight]

      const { error: updateError } = await supabase
        .from("highlights_biblia")
        .update({ marcacoes: updatedMarcacoes })
        .eq("id", existing.id)

      if (updateError) {
        toast.error("Erro ao salvar marcação", { duration: 2000 })
        return
      }
    } else {
      updatedMarcacoes = [newHighlight]

      const { error: insertError } = await supabase.from("highlights_biblia").insert({
        usuario_id: user.id,
        livro_id: livroId,
        numero_capitulo: currentChapter,
        marcacoes: updatedMarcacoes,
      })

      if (insertError) {
        toast.error("Erro ao salvar marcação", { duration: 2000 })
        return
      }
    }

    const newAction: HistoryAction = {
      type: "add",
      highlight: {
        texto_selecionado: selectedText,
        cor: selectedColor,
        id: newHighlight.id,
      },
      timestamp: Date.now(),
    }

    const newHistory = history.slice(0, historyIndex + 1)
    setHistory([...newHistory, newAction])
    setHistoryIndex(historyIndex + 1)

    await loadHighlights(currentChapter)
    toast.success("Texto marcado com sucesso!", { duration: 2000 })
    selection.removeAllRanges()
  }

  const handleUndo = async () => {
    if (historyIndex < 0) return

    const action = history[historyIndex]
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (action.type === "add" && action.highlight.id) {
      const { data: existing } = await supabase
        .from("highlights_biblia")
        .select("id, marcacoes")
        .eq("usuario_id", user.id)
        .eq("livro_id", livroId)
        .eq("numero_capitulo", currentChapter)
        .single()

      if (existing) {
        const updatedMarcacoes = (existing.marcacoes || []).filter((h: Highlight) => h.id !== action.highlight.id)

        const { error } = await supabase
          .from("highlights_biblia")
          .update({ marcacoes: updatedMarcacoes })
          .eq("id", existing.id)

        if (!error) {
          setHistoryIndex(historyIndex - 1)
          await loadHighlights(currentChapter)
          toast.success("Marcação desfeita", { duration: 1500 })
        }
      }
    }
  }

  const handleRedo = async () => {
    if (historyIndex >= history.length - 1) return

    const action = history[historyIndex + 1]
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (action.type === "add") {
      const { data: existing } = await supabase
        .from("highlights_biblia")
        .select("id, marcacoes")
        .eq("usuario_id", user.id)
        .eq("livro_id", livroId)
        .eq("numero_capitulo", currentChapter)
        .single()

      if (existing) {
        const newHighlight: Highlight = {
          id: action.highlight.id || Date.now(),
          texto: action.highlight.texto_selecionado,
          cor: action.highlight.cor,
        }

        const updatedMarcacoes = [...(existing.marcacoes || []), newHighlight]

        const { error } = await supabase
          .from("highlights_biblia")
          .update({ marcacoes: updatedMarcacoes })
          .eq("id", existing.id)

        if (!error) {
          setHistoryIndex(historyIndex + 1)
          await loadHighlights(currentChapter)
          toast.success("Marcação refeita", { duration: 1500 })
        }
      }
    }
  }

  const loadHighlights = async (chapter: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error: highlightError } = await supabase
      .from("highlights_biblia")
      .select("id, marcacoes")
      .eq("usuario_id", user.id)
      .eq("livro_id", livroId)
      .eq("numero_capitulo", chapter)
      .single()

    if (data && !highlightError) {
      setHighlightData(data)
      setHighlights(data.marcacoes || [])
    } else {
      setHighlightData(null)
      setHighlights([])
    }
  }

  const renderTextWithHighlights = (text: string, highlights: Highlight[]): React.ReactNode => {
    if (highlights.length === 0) {
      return text
    }

    const parts: { text: string; color?: string }[] = []
    let lastIndex = 0

    const sortedHighlights = [...highlights].sort((a, b) => {
      const indexA = text.indexOf(a.texto)
      const indexB = text.indexOf(b.texto)
      return indexA - indexB
    })

    sortedHighlights.forEach((highlight) => {
      const index = text.indexOf(highlight.texto, lastIndex)
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: text.slice(lastIndex, index) })
        }
        parts.push({
          text: highlight.texto,
          color: highlight.cor,
        })
        lastIndex = index + highlight.texto.length
      }
    })

    if (lastIndex < text.length) {
      parts.push({ text: text.slice(lastIndex) })
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
        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle>
              {bookName} {currentChapter}
            </CardTitle>
            {capituloAtualJaLido && <Check className="w-5 h-5 text-green-500" />}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!capituloAtualJaLido && !loading && !rastreamentoAtivo && (
              <Button size="sm" onClick={iniciarRastreamento} className="gap-2">
                <PlayCircle className="w-4 h-4" />
                Ler Agora
              </Button>
            )}
            {(rastreamentoAtivo || capituloAtualJaLido) && (
              <div className="flex flex-wrap gap-1.5 items-center justify-end sm:justify-start w-full sm:w-auto">
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyIndex < 0}
                    title="Desfazer"
                    className="h-7 w-7 p-0 bg-transparent"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    title="Refazer"
                    className="h-7 w-7 p-0"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </div>

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
                </div>

                <Button
                  variant={highlightMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHighlightMode(!highlightMode)}
                  className="h-7 px-2"
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
              {renderTextWithHighlights(chapterData?.text || "", highlights)}
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
