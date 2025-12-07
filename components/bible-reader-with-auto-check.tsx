"use client"

import React, { useMemo } from "react"

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
  X,
  Menu,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import { marcarCapituloLido } from "@/app/dashboard/leitura-biblica/actions"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BibleNavigationMenu } from "@/components/bible-navigation-menu"

interface BibleReaderWithAutoCheckProps {
  bookName: string
  livroId: number
  startChapter: number
  endChapter: number
  capitulosLidos: Set<number>
  onChapterRead: (capituloId: number) => void
  capituloInicialJaLido: boolean
  capitulosSemana: number[]
  initialChapter?: number
  onClose?: () => void
  onNavigateToChapter?: (livroId: number, livroNome: string, capitulo: number) => void
  modoNavegacaoLivre?: boolean // Nova prop para indicar modo de navegação livre
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
  capituloInicialJaLido,
  capitulosSemana,
  initialChapter,
  onClose,
  onNavigateToChapter,
  modoNavegacaoLivre = false, // Default false para manter compatibilidade
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

  const [menuAberto, setMenuAberto] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [isMounted, setIsMounted] = useState(false)

  const [capituloAtualJaLido, setCapituloAtualJaLido] = useState(false)

  const [currentSelection, setCurrentSelection] = useState<{
    text: string
    range: Range | null
  } | null>(null)

  const [fontSize, setFontSize] = useState(16)

  const isLoadingRef = useRef(false)

  const [isMobile, setIsMobile] = useState(false)

  const [capituloIdReal, setCapituloIdReal] = useState<number | undefined>(undefined)

  const capituloAtualJaLidoMemo = useMemo(() => {
    if (capituloIdReal === undefined) {
      return false // Ainda não carregou o ID
    }

    const jaLido = capitulosLidos.has(capituloIdReal)
    console.log(
      "[v0] 🔍 Verificando se capítulo está lido - Capítulo:",
      currentChapter,
      "ID real:",
      capituloIdReal,
      "Já lido:",
      jaLido,
    )
    return jaLido
  }, [capituloIdReal, capitulosLidos, currentChapter])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setCurrentChapter(initialChapter || startChapter)
  }, [initialChapter, startChapter])

  useEffect(() => {
    const buscarIdRealCapitulo = async () => {
      if (modoNavegacaoLivre) {
        console.log("[v0] 🔍 Buscando ID real do capítulo:", currentChapter, "do livro:", livroId)

        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data, error } = await supabase
          .from("capitulos_biblia")
          .select("id")
          .eq("livro_id", livroId)
          .eq("numero_capitulo", currentChapter)
          .single()

        if (!error && data) {
          console.log("[v0] ✅ ID real encontrado:", data.id)
          setCapituloIdReal(data.id)
        } else {
          console.error("[v0] ❌ Erro ao buscar ID real:", error)
          setCapituloIdReal(undefined)
        }
      } else {
        // Modo leitura semanal usa o ID da lista de capítulos da semana
        const idReal = getCapituloIdReal(currentChapter)
        setCapituloIdReal(idReal)
      }
    }

    buscarIdRealCapitulo()
  }, [currentChapter, livroId, modoNavegacaoLivre])

  useEffect(() => {
    loadChapter(currentChapter)
    setRastreamentoAtivo(false)
  }, [currentChapter, livroId])

  useEffect(() => {
    if (!loading && chapterData && !capituloAtualJaLido && rastreamentoAtivo) {
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
  }, [loading, chapterData, rastreamentoAtivo])

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement

    if (scrollContainer && rastreamentoAtivo) {
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
  }, [loading, chapterData, currentChapter, rastreamentoAtivo, scrolledToBottom])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    // Verifica se ambas as condições foram atendidas e ainda não marcou
    if (
      rastreamentoAtivo &&
      scrolledToBottom &&
      timeElapsed >= MIN_READ_TIME_MS &&
      !autoMarked &&
      !capituloAtualJaLidoMemo
    ) {
      console.log("[v0] ✅ Condições atendidas! Marcando capítulo automaticamente...")
      console.log("[v0] - Scroll até o fim:", scrolledToBottom)
      console.log("[v0] - Tempo decorrido:", timeElapsed, "ms (mínimo:", MIN_READ_TIME_MS, "ms)")
      console.log("[v0] - Já marcado?", autoMarked)

      handleAutoMarkAsRead()
    }
  }, [scrolledToBottom, timeElapsed, rastreamentoAtivo, autoMarked, capituloAtualJaLidoMemo])

  const loadChapter = async (chapter: number) => {
    setLoading(true)
    setError(null)

    await fetchBibleText(chapter)

    const idReal = getCapituloIdReal(chapter)
    if (idReal !== undefined) {
      await loadHighlights(chapter)
    }
  }

  const handleAutoMarkAsRead = async () => {
    setAutoMarked(true)

    console.log("[v0] 🎯 Marcando capítulo como lido - livroId:", livroId, "capítulo:", currentChapter)
    const result = await marcarCapituloLido(livroId, currentChapter, timeElapsed)

    if (result.success && result.xpGanho && result.xpGanho > 0) {
      toast.success(`Capítulo ${currentChapter} concluído! +${result.xpGanho} XP`, {
        duration: 2000,
      })
    }

    if (result.success) {
      console.log("[v0] ✅ Capítulo marcado como lido - número:", currentChapter, "ID real:", capituloIdReal)
      if (capituloIdReal) {
        onChapterRead(capituloIdReal)
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    } else {
      console.error("[v0] ❌ Erro ao marcar capítulo:", result.error)
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

    const limiteInferior = modoNavegacaoLivre ? 1 : startChapter

    if (currentChapter > limiteInferior) {
      const novoCapitulo = currentChapter - 1

      if (!modoNavegacaoLivre) {
        const idRealAnterior = getCapituloIdReal(novoCapitulo)
        const jaLidoAnterior = capitulosLidos.has(idRealAnterior)
        console.log("[v0] ID real do capítulo anterior:", idRealAnterior)
        console.log("[v0] Capítulo anterior já lido?", jaLidoAnterior)
      }

      handleChapterChange(novoCapitulo)
    } else {
      console.log("[v0] ⚠ Já está no primeiro capítulo", modoNavegacaoLivre ? "do livro" : "da semana")
    }
  }

  const handleNextChapter = () => {
    console.log("[v0] ➡️ BOTÃO 'PROSSEGUIR' CLICADO")
    console.log("[v0] Capítulo atual:", currentChapter)
    console.log("[v0] Próximo capítulo será:", currentChapter + 1)

    const limiteSuperior = modoNavegacaoLivre ? 150 : endChapter

    if (currentChapter < limiteSuperior) {
      const novoCapitulo = currentChapter + 1

      if (!modoNavegacaoLivre) {
        const idRealProximo = getCapituloIdReal(novoCapitulo)
        const jaLidoProximo = capitulosLidos.has(idRealProximo)
        console.log("[v0] ID real do próximo capítulo:", idRealProximo)
        console.log("[v0] Próximo capítulo já lido?", jaLidoProximo)
      }

      handleChapterChange(novoCapitulo)
    } else {
      console.log("[v0] ⚠ Já está no último capítulo", modoNavegacaoLivre ? "do livro" : "da semana")
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

  const captureSelection = () => {
    if (!highlightMode) return

    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === "") {
      setCurrentSelection(null)
      return
    }

    const selectedText = selection.toString().trim()
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null

    console.log("[v0] 📝 Seleção capturada:", selectedText)
    setCurrentSelection({
      text: selectedText,
      range,
    })
  }

  const handleTextSelection = async () => {
    if (!highlightMode) return

    if (!currentSelection || !currentSelection.text) {
      console.log("[v0] ⚠️ Nenhuma seleção armazenada")
      return
    }

    const {
      data: { user },
    } = await createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ).auth.getUser()
    if (!user) {
      toast.error("Você precisa estar logado para salvar marcações", {
        duration: 2000,
      })
      return
    }

    const selectedText = currentSelection.text
    console.log("[v0] 💾 Salvando highlight:", selectedText, "cor:", selectedColor)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: existing } = await supabase
      .from("highlights_biblia")
      .select("id, marcacoes")
      .eq("usuario_id", user.id)
      .eq("livro_id", livroId)
      .eq("numero_capitulo", currentChapter)
      .single()

    const newHighlight: Highlight = {
      id: Date.now(),
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

    setCurrentSelection(null)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
    console.log("[v0] ✅ Highlight aplicado e seleção limpa")
  }

  const handleUndo = async () => {
    if (historyIndex < 0) return

    const action = history[historyIndex]
    const {
      data: { user },
    } = await createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ).auth.getUser()
    if (!user) return

    if (action.type === "add" && action.highlight.id) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
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
    } = await createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ).auth.getUser()
    if (!user) return

    if (action.type === "add") {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
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
    } = await createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ).auth.getUser()

    if (!user) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
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
      return parseMarkdownBold(text)
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
            {parseMarkdownBold(part.text)}
          </span>
        )
      }
      return <span key={index}>{parseMarkdownBold(part.text)}</span>
    })
  }

  const parseMarkdownBold = (text: string): React.ReactNode => {
    const lines = text.split("\n")

    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\*\*\d+\*\*)/g)

      const lineContent = parts.map((part, partIndex) => {
        const match = part.match(/^\*\*(\d+)\*\*$/)
        if (match) {
          const numero = match[1]
          return (
            <strong key={`${lineIndex}-${partIndex}`} className="text-[0.7em] align-super font-bold mr-0.5">
              {numero}
            </strong>
          )
        }
        return <span key={`${lineIndex}-${partIndex}`}>{part}</span>
      })

      // Add line break after each line except the last one
      if (lineIndex < lines.length - 1) {
        return (
          <React.Fragment key={lineIndex}>
            {lineContent}
            <br />
          </React.Fragment>
        )
      }

      return <React.Fragment key={lineIndex}>{lineContent}</React.Fragment>
    })
  }

  const getCapituloIdReal = (numeroCapitulo: number): number | undefined => {
    if (modoNavegacaoLivre) {
      // No modo de navegação livre, buscamos o ID diretamente do banco
      return undefined // Será buscado pelo fetchBibleText
    }

    const index = numeroCapitulo - startChapter
    const idReal = capitulosSemana[index]
    console.log(
      `[v0] 🔍 getCapituloIdReal - numeroCapitulo: ${numeroCapitulo} startChapter: ${startChapter} index: ${index} ID real: ${idReal}`,
    )
    return idReal || numeroCapitulo
  }

  const handleNavigateToChapter = async (novoLivroId: number, novoLivroNome: string, novoCapitulo: number) => {
    console.log("[v0] 📚 Navegando para:", novoLivroNome, "capítulo", novoCapitulo)

    if (onNavigateToChapter) {
      onNavigateToChapter(novoLivroId, novoLivroNome, novoCapitulo)
    } else {
      // Se não tem callback, atualiza localmente
      setCurrentChapter(novoCapitulo)
      setCapituloAtualJaLido(capitulosLidos.has(novoCapitulo))
      await loadChapter(novoLivroId, novoCapitulo)
    }
  }

  const fetchBibleText = async (chapter: number) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      let capituloId = getCapituloIdReal(chapter)

      if (capituloId === undefined) {
        const { data: capituloData, error: capituloError } = await supabase
          .from("capitulos_biblia")
          .select("id")
          .eq("livro_id", livroId)
          .eq("numero_capitulo", chapter)
          .single()

        if (capituloError) {
          console.error("[v0] ❌ Erro ao buscar ID do capítulo:", capituloError)
          throw new Error("Erro ao buscar capítulo")
        }

        capituloId = capituloData.id
        console.log(`[v0] 🔍 ID do capítulo buscado do banco: ${capituloId}`)
      }

      const { data, error } = await supabase
        .from("capitulos_biblia")
        .select("texto, versao, numero_capitulo")
        .eq("id", capituloId)
        .single()

      if (data && !error) {
        setChapterData({
          chapter: data.numero_capitulo,
          text: data.texto || "Texto não disponível",
        })
      } else {
        console.error("[v0] BibleReader: Erro ao buscar texto:", error)
        setError("Texto do capítulo não encontrado no banco de dados")
      }
    } catch (err) {
      console.error("[v0] ❌ Erro ao buscar texto:", err)
      setError("Erro ao buscar texto")
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }

  const handleChapterChange = (newChapter: number) => {
    if (modoNavegacaoLivre) {
      console.log("[v0] 📖 Mudando para capítulo", newChapter, "- reiniciando rastreamento")
      setScrolledToBottom(false)
      setReadingStartTime(Date.now())
      setTimeElapsed(0)
      setAutoMarked(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      const interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1000)
      }, 1000)

      timerRef.current = interval
    }

    setCurrentChapter(newChapter)
    setError(null)
    loadChapter(newChapter)
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

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Header com botão voltar */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold">
              {bookName} {currentChapter}
            </h2>
          </div>
          {modoNavegacaoLivre && (
            <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4 mr-2" />
                  Menu
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96 p-0">
                <BibleNavigationMenu
                  onNavigate={handleNavigateToChapter}
                  currentLivroId={livroId}
                  currentCapitulo={currentChapter}
                  onClose={() => setMenuAberto(false)}
                />
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Conteúdo do capítulo */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4">
                {/* Paleta de cores para highlight */}
                {(rastreamentoAtivo || capituloAtualJaLidoMemo) && (
                  <div className="mb-4 flex flex-wrap gap-2 items-center justify-center sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 border-b">
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={historyIndex < 0}
                        title="Desfazer"
                        className="h-8 w-8 p-0 bg-transparent"
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        title="Refazer"
                        className="h-8 w-8 p-0"
                      >
                        <Redo2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-1.5">
                      {HIGHLIGHT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={async (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedColor(color.value)
                            setHighlightMode(true)

                            if (currentSelection && currentSelection.text) {
                              await handleTextSelection()
                              setTimeout(() => {
                                const selection = window.getSelection()
                                if (selection) {
                                  selection.removeAllRanges()
                                }
                                setCurrentSelection(null)
                              }, 100)
                            }
                          }}
                          className={cn(
                            "w-8 h-8 rounded border-2 transition-all active:scale-95",
                            color.class,
                            selectedColor === color.value && highlightMode
                              ? "border-primary scale-110"
                              : "border-gray-300",
                          )}
                          title={color.name}
                        />
                      ))}
                    </div>

                    <Button
                      variant={highlightMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHighlightMode(!highlightMode)}
                      className="h-8 px-3"
                    >
                      <Highlighter className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Texto do capítulo */}
                <div
                  className={cn(
                    "prose prose-sm max-w-none leading-relaxed",
                    highlightMode && "cursor-text select-text",
                  )}
                  onMouseUp={captureSelection}
                  onTouchEnd={captureSelection}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: "1.8",
                    userSelect: highlightMode ? "text" : "auto",
                    WebkitUserSelect: highlightMode ? "text" : "auto",
                    whiteSpace: "pre-line",
                  }}
                >
                  {renderTextWithHighlights(chapterData?.text || "", highlights)}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer com botões de navegação e Ler Agora */}
        <div className="border-t bg-card p-4 space-y-3">
          {/* Barra de progresso */}
          {rastreamentoAtivo && !capituloAtualJaLidoMemo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{scrolledToBottom ? "✓ Rolou até o fim" : "Role até o fim"}</span>
                <span>
                  {timeElapsed >= MIN_READ_TIME_MS ? "✓ Tempo atingido" : `${formatTime(timeRemaining)} restantes`}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Botão Ler Agora ou Marcador */}
          {!capituloAtualJaLidoMemo && !loading && !rastreamentoAtivo && (
            <Button onClick={iniciarRastreamento} className="w-full gap-2" size="lg">
              <PlayCircle className="w-5 h-5" />
              Ler Agora
            </Button>
          )}

          {capituloAtualJaLidoMemo && (
            <div className="flex items-center justify-center gap-2 py-2 text-green-600 font-medium">
              <Check className="w-5 h-5" />
              <span>Capítulo Lido</span>
            </div>
          )}

          {/* Navegação entre capítulos */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevChapter}
              disabled={modoNavegacaoLivre ? currentChapter <= 1 || loading : currentChapter <= startChapter || loading}
              className="flex-1 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <span className="text-sm text-muted-foreground whitespace-nowrap px-2">
              {modoNavegacaoLivre ? `Cap. ${currentChapter}` : `${currentChapter} / ${endChapter}`}
            </span>

            <Button
              variant="outline"
              onClick={handleNextChapter}
              disabled={modoNavegacaoLivre ? loading : currentChapter >= endChapter || loading}
              className="flex-1"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Desktop: mantém o Card original
  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
        {/* Menu hamburguer */}
        {modoNavegacaoLivre && (
          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="w-4 h-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-96 p-0">
              <BibleNavigationMenu
                onNavigate={handleNavigateToChapter}
                currentLivroId={livroId}
                currentCapitulo={currentChapter}
                onClose={() => setMenuAberto(false)}
              />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 text-center">
          <h2 className="text-lg font-semibold">
            {bookName} {currentChapter}
          </h2>
        </div>

        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Card className="flex-1">
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
                  "prose prose-sm sm:prose max-w-none leading-relaxed",
                  highlightMode && "cursor-text select-text",
                )}
                onMouseUp={captureSelection}
                onTouchEnd={captureSelection}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: "1.8",
                  userSelect: highlightMode ? "text" : "auto",
                  WebkitUserSelect: highlightMode ? "text" : "auto",
                  whiteSpace: "pre-line",
                }}
              >
                {renderTextWithHighlights(chapterData?.text || "", highlights)}
              </div>
            </ScrollArea>
          )}

          {/* Barra de progresso e botão Ler Agora na versão desktop */}
          <div className="mt-4 space-y-3">
            {/* Barra de progresso */}
            {rastreamentoAtivo && !capituloAtualJaLidoMemo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{scrolledToBottom ? "✓ Rolou até o fim" : "Role até o fim"}</span>
                  <span>
                    {timeElapsed >= MIN_READ_TIME_MS ? "✓ Tempo atingido" : `${formatTime(timeRemaining)} restantes`}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Botão Ler Agora */}
            {!capituloAtualJaLidoMemo && !loading && !rastreamentoAtivo && (
              <Button onClick={iniciarRastreamento} className="w-full gap-2" size="lg">
                <PlayCircle className="w-5 h-5" />
                Ler Agora
              </Button>
            )}

            {/* Status de capítulo lido */}
            {capituloAtualJaLidoMemo && (
              <div className="flex items-center justify-center gap-2 py-2 text-green-600 font-medium">
                <Check className="w-5 h-5" />
                <span>Capítulo Lido</span>
              </div>
            )}

            {/* Navegação entre capítulos */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevChapter}
                disabled={
                  modoNavegacaoLivre ? currentChapter <= 1 || loading : currentChapter <= startChapter || loading
                }
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>

              <span className="text-sm text-muted-foreground">
                {modoNavegacaoLivre ? `Cap. ${currentChapter}` : `${currentChapter} / ${endChapter}`}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextChapter}
                disabled={modoNavegacaoLivre ? loading : currentChapter >= endChapter || loading}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
