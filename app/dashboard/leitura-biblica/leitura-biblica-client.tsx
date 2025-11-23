"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { ChapterCheckboxList } from "@/components/chapter-checkbox-list"
import { BibleReaderWithAutoCheck } from "@/components/bible-reader-with-auto-check"
import { LIVROS_MAP } from "@/lib/livros-map"

interface LeituraSemanal {
  semana: number
  tema: string
  livro: string
  capituloInicio: number
  capituloFim: number
  totalCapitulos: number
  fase: string
  descricao: string
  capitulosSemana: number[]
}

interface LeituraBiblicaClientProps {
  leituraAtual: LeituraSemanal
  discipuloId: string
  leituraJaConfirmada: boolean
  capitulosLidosInicial?: number[]
}

export default function LeituraBiblicaClient({
  leituraAtual,
  discipuloId,
  leituraJaConfirmada,
  capitulosLidosInicial = [],
}: LeituraBiblicaClientProps) {
  console.log("[v0] 🔵 LeituraBiblicaClient: COMPONENTE CARREGADO")
  console.log("[v0] Dados recebidos:", {
    semana: leituraAtual.semana,
    livro: leituraAtual.livro,
    capituloInicio: leituraAtual.capituloInicio,
    capituloFim: leituraAtual.capituloFim,
    discipuloId,
    capitulosLidosInicial,
    capitulosSemana: leituraAtual.capitulosSemana,
  })

  const [chaptersRead, setChaptersRead] = useState(0)
  const [totalChapters, setTotalChapters] = useState(leituraAtual.totalCapitulos)
  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set(capitulosLidosInicial))
  const [leitorAberto, setLeitorAberto] = useState(false)
  const [capituloSelecionado, setCapituloSelecionado] = useState(leituraAtual.capituloInicio)
  const [capituloSelecionadoJaLido, setCapituloSelecionadoJaLido] = useState(false)
  const [carregandoCapitulos, setCarregandoCapitulos] = useState(false)

  useEffect(() => {
    console.log("[v0] 🟢 USEEFFECT: Inicializando capítulos lidos")
    console.log("[v0] capitulosLidosInicial recebidos:", capitulosLidosInicial)
    console.log("[v0] discipuloId:", discipuloId)

    if (capitulosLidosInicial && capitulosLidosInicial.length > 0) {
      setCapitulosLidos(new Set(capitulosLidosInicial))

      const capitulosDaSemana = leituraAtual.capitulosSemana || []
      const lidosDaSemana = capitulosLidosInicial.filter((id: number) => capitulosDaSemana.includes(id))
      setChaptersRead(lidosDaSemana.length)

      console.log("[v0] Set de capítulos lidos criado:", Array.from(new Set(capitulosLidosInicial)))
      console.log("[v0] Capítulos lidos DA SEMANA:", lidosDaSemana.length, "/", capitulosDaSemana.length)
    }
  }, [capitulosLidosInicial, leituraAtual.capitulosSemana, discipuloId])

  const handleProgressChange = (lidos: number, total: number) => {
    console.log("[v0] 📊 handleProgressChange chamado - lidos:", lidos, "total:", total)
    setChaptersRead(lidos)
    setTotalChapters(total)
  }

  const handleChapterRead = (chapter: number) => {
    console.log("[v0] ✅ handleChapterRead chamado - capítulo ID:", chapter)
    setCapitulosLidos((prev) => {
      const newSet = new Set([...prev, chapter])
      console.log("[v0] Novo Set de capítulos lidos:", Array.from(newSet))
      return newSet
    })
    setChaptersRead((prev) => prev + 1)
  }

  const handleUltimoCapituloLido = (numeroCapitulo: number) => {
    console.log("[v0] 📖 handleUltimoCapituloLido chamado - número:", numeroCapitulo)
    if (numeroCapitulo >= leituraAtual.capituloInicio && numeroCapitulo < leituraAtual.capituloFim) {
      setCapituloSelecionado(numeroCapitulo + 1)
      console.log("[v0] Próximo capítulo selecionado:", numeroCapitulo + 1)
    }
  }

  const abrirCapitulo = (numeroCapitulo: number, isLido = false) => {
    console.log("[v0] 📘 abrirCapitulo CHAMADO")
    console.log("[v0] numeroCapitulo:", numeroCapitulo)
    console.log("[v0] isLido:", isLido)
    console.log("[v0] capitulosLidos atual (Set):", Array.from(capitulosLidos))

    setCapituloSelecionado(numeroCapitulo)
    setCapituloSelecionadoJaLido(isLido)
    setLeitorAberto(true)

    console.log("[v0] Leitor bíblico ABERTO para capítulo", numeroCapitulo)
  }

  const allChaptersRead = chaptersRead === totalChapters && totalChapters > 0

  return (
    <Card className="mb-8 border-2 border-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Leitura da Semana {leituraAtual.semana}</CardTitle>
            <CardDescription className="text-lg mt-1">{leituraAtual.tema}</CardDescription>
          </div>
          <Badge className="text-sm">{leituraAtual.fase}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-lg font-semibold mb-2">
            📖 {leituraAtual.livro} {leituraAtual.capituloInicio}
            {leituraAtual.capituloFim !== leituraAtual.capituloInicio && `-${leituraAtual.capituloFim}`}
          </div>
          <div className="text-muted-foreground">{leituraAtual.descricao}</div>
          <div className="text-sm text-muted-foreground mt-2">
            📚 Total: {totalChapters} capítulo{totalChapters > 1 ? "s" : ""}
            {chaptersRead > 0 && (
              <span className="ml-2 text-primary font-semibold">
                • {chaptersRead} lido{chaptersRead > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {!carregandoCapitulos && (
          <>
            <div className="space-y-3">
              <div className="text-sm font-medium">Clique para acessar os capítulos da semana:</div>
              <ChapterCheckboxList
                livroId={LIVROS_MAP[leituraAtual.livro] || 1}
                capituloInicial={leituraAtual.capituloInicio}
                capituloFinal={leituraAtual.capituloFim}
                onProgressChange={handleProgressChange}
                externalCapitulosLidos={capitulosLidos}
                onUltimoCapituloChange={handleUltimoCapituloLido}
                onCapituloClick={abrirCapitulo}
                capitulosSemana={leituraAtual.capitulosSemana}
              />
            </div>

            {leitorAberto && (
              <div className="mt-4">
                <BibleReaderWithAutoCheck
                  bookName={leituraAtual.livro}
                  livroId={LIVROS_MAP[leituraAtual.livro] || 1}
                  startChapter={leituraAtual.capituloInicio}
                  endChapter={leituraAtual.capituloFim}
                  capitulosLidos={capitulosLidos}
                  onChapterRead={handleChapterRead}
                  capituloInicialJaLido={capituloSelecionadoJaLido}
                  capitulosSemana={leituraAtual.capitulosSemana}
                  initialChapter={capituloSelecionado}
                />
              </div>
            )}
          </>
        )}

        {allChaptersRead && (
          <div className="bg-accent/10 border border-accent rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
            <div>
              <div className="font-semibold text-accent">Todos os capítulos lidos!</div>
              <div className="text-sm text-muted-foreground">
                Parabéns! Você completou a leitura desta semana. XP será creditado automaticamente.
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          💡 Dica: Clique no número do capítulo para visualizar o texto, depois clique em "Ler Agora" para iniciar o
          rastreamento
        </div>
      </CardContent>
    </Card>
  )
}
