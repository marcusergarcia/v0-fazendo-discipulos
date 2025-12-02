"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import { ChapterCheckboxList } from "@/components/chapter-checkbox-list"
import { BibleReaderWithAutoCheck } from "@/components/bible-reader-with-auto-check"
import { LIVROS_MAP } from "@/lib/livros-map"
import { createBrowserClient } from "@supabase/ssr"

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
  console.log("[v0] 🔷 LEITURA BÍBLICA CLIENT MONTADO")
  console.log("[v0] 📊 Props recebidas:", {
    semana: leituraAtual.semana,
    livro: leituraAtual.livro,
    capituloInicio: leituraAtual.capituloInicio,
    capituloFim: leituraAtual.capituloFim,
    discipuloId,
    leituraJaConfirmada,
    capitulosLidosInicialLength: capitulosLidosInicial.length,
  })

  const [chaptersRead, setChaptersRead] = useState(0)
  const [totalChapters, setTotalChapters] = useState(leituraAtual.totalCapitulos)
  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set(capitulosLidosInicial))
  const [leitorAberto, setLeitorAberto] = useState(false)
  const [capituloSelecionado, setCapituloSelecionado] = useState(leituraAtual.capituloInicio)
  const [capituloSelecionadoJaLido, setCapituloSelecionadoJaLido] = useState(false)
  const [carregandoCapitulos, setCarregandoCapitulos] = useState(false)
  const [livroAtual, setLivroAtual] = useState(leituraAtual.livro)
  const [livroIdAtual, setLivroIdAtual] = useState(LIVROS_MAP[leituraAtual.livro] || 1)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    console.log("[v0] 🔄 useEffect capitulosLidosInicial disparado")

    if (capitulosLidosInicial && capitulosLidosInicial.length > 0) {
      console.log("[v0] ✅ Atualizando capítulos lidos:", capitulosLidosInicial.length)
      setCapitulosLidos(new Set(capitulosLidosInicial))

      const capitulosDaSemana = leituraAtual.capitulosSemana || []
      const lidosDaSemana = capitulosLidosInicial.filter((id: number) => capitulosDaSemana.includes(id))
      console.log("[v0] 📊 Lidos da semana:", lidosDaSemana.length)
      setChaptersRead(lidosDaSemana.length)
    }
  }, [capitulosLidosInicial, leituraAtual.capitulosSemana, discipuloId])

  const handleProgressChange = (lidos: number, total: number) => {
    console.log("[v0] 📊 Progress change:", { lidos, total })
    setChaptersRead(lidos)
    setTotalChapters(total)
  }

  const handleChapterRead = (capituloId: number) => {
    console.log("[v0] ✅ Capítulo lido:", capituloId)
    setCapitulosLidos((prev) => new Set([...prev, capituloId]))

    const capitulosDaSemana = leituraAtual.capitulosSemana || []
    const lidosDaSemana = Array.from(capitulosLidos).filter((id) => capitulosDaSemana.includes(id))
    setChaptersRead(lidosDaSemana.length)
  }

  const handleUltimoCapituloLido = (numeroCapitulo: number) => {
    console.log("[v0] 📖 Último capítulo lido:", numeroCapitulo)
    if (numeroCapitulo >= leituraAtual.capituloInicio && numeroCapitulo < leituraAtual.capituloFim) {
      setCapituloSelecionado(numeroCapitulo + 1)
    }
  }

  const abrirCapitulo = (numeroCapitulo: number, isLido = false) => {
    console.log("[v0] 📖 Abrindo capítulo:", { numeroCapitulo, isLido })
    setCapituloSelecionado(numeroCapitulo)
    setCapituloSelecionadoJaLido(isLido)
    setLeitorAberto(true)
  }

  const fecharLeitor = () => {
    console.log("[v0] ❌ Fechando leitor")
    setLeitorAberto(false)
    setLivroAtual(leituraAtual.livro)
    setLivroIdAtual(LIVROS_MAP[leituraAtual.livro] || 1)
    setCapituloSelecionado(leituraAtual.capituloInicio)
  }

  const navegarParaCapitulo = async (novoLivroId: number, novoLivroNome: string, novoCapitulo: number) => {
    console.log("[v0] 🔄 Navegando para:", { novoLivroId, novoLivroNome, novoCapitulo })

    const { data: capituloData } = await supabase
      .from("capitulos_biblia")
      .select("id")
      .eq("livro_id", novoLivroId)
      .eq("numero_capitulo", novoCapitulo)
      .single()

    console.log("[v0] 📊 Capítulo data:", capituloData)

    if (capituloData) {
      const capituloId = capituloData.id
      const isLido = capitulosLidos.has(capituloId)

      console.log("[v0] ✅ Abrindo novo capítulo:", { capituloId, isLido })

      setLivroAtual(novoLivroNome)
      setLivroIdAtual(novoLivroId)
      setCapituloSelecionado(novoCapitulo)
      setCapituloSelecionadoJaLido(isLido)
      setLeitorAberto(true)
    }
  }

  const allChaptersRead = chaptersRead === totalChapters && totalChapters > 0

  console.log("[v0] 📊 Estado atual:", {
    chaptersRead,
    totalChapters,
    allChaptersRead,
    leitorAberto,
    capituloSelecionado,
  })

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
                  bookName={livroAtual}
                  livroId={livroIdAtual}
                  startChapter={livroAtual === leituraAtual.livro ? leituraAtual.capituloInicio : capituloSelecionado}
                  endChapter={livroAtual === leituraAtual.livro ? leituraAtual.capituloFim : capituloSelecionado}
                  capitulosLidos={capitulosLidos}
                  onChapterRead={handleChapterRead}
                  capituloInicialJaLido={capituloSelecionadoJaLido}
                  capitulosSemana={
                    livroAtual === leituraAtual.livro ? leituraAtual.capitulosSemana : [capituloSelecionado]
                  }
                  initialChapter={capituloSelecionado}
                  onClose={fecharLeitor}
                  onNavigateToChapter={navegarParaCapitulo}
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
