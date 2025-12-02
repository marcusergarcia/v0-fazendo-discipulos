import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Trophy,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import LeituraBiblicaClient from "./leitura-biblica-client"
import { ProgressoAnualClient } from "./progresso-anual-client"

export default async function LeituraBiblicaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>
}) {
  try {
    console.log("[v0] [SERVER] Iniciando carregamento da página de leitura bíblica")

    const supabase = await createClient()
    console.log("[v0] [SERVER] Cliente Supabase criado")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] [SERVER] User:", user?.id)
    console.log("[v0] [SERVER] Auth error:", authError)

    if (authError || !user) {
      console.log("[v0] [SERVER] Redirecionando para login")
      redirect("/auth/login")
    }

    // Buscar discípulo
    console.log("[v0] [SERVER] Buscando discípulo...")
    const { data: discipulo, error: discipuloError } = await supabase
      .from("discipulos")
      .select("*")
      .eq("user_id", user.id)
      .single()

    console.log("[v0] [SERVER] Discípulo:", discipulo?.id)
    console.log("[v0] [SERVER] Discípulo error:", discipuloError)

    if (!discipulo) {
      console.log("[v0] [SERVER] Discípulo não encontrado, redirecionando")
      redirect("/dashboard")
    }

    console.log("[v0] [SERVER] Buscando plano de leitura...")
    const { data: planoLeitura, error: planoError } = await supabase
      .from("plano_leitura_biblica")
      .select("semana, tema, livro, capitulo_inicio, capitulo_fim, total_capitulos, fase, descricao, capitulos_semana")
      .order("semana", { ascending: true })

    console.log("[v0] [SERVER] Plano de leitura:", planoLeitura?.length, "semanas")
    console.log("[v0] [SERVER] Plano error:", planoError)

    if (!planoLeitura || planoLeitura.length === 0) {
      console.log("[v0] [SERVER] Plano de leitura não encontrado, redirecionando")
      redirect("/dashboard")
    }

    console.log("[v0] [SERVER] Buscando capítulos lidos...")
    const { data: leituraData, error: leituraError } = await supabase
      .from("leituras_capitulos")
      .select("capitulos_lidos")
      .eq("discipulo_id", discipulo.id)
      .single()

    console.log("[v0] [SERVER] Leitura data:", leituraData)
    console.log("[v0] [SERVER] Leitura error:", leituraError)

    let capitulosLidosArray: number[] = []

    if (leituraData?.capitulos_lidos) {
      if (Array.isArray(leituraData.capitulos_lidos)) {
        capitulosLidosArray = leituraData.capitulos_lidos.filter((id) => typeof id === "number")
      } else {
        console.error("[v0] [SERVER] capitulos_lidos não é um array:", leituraData.capitulos_lidos)
      }
    }

    console.log("[v0] [SERVER] Capítulos lidos processados:", capitulosLidosArray.length)

    const capitulosLidos = new Set(capitulosLidosArray)

    const semanasConcluidas = new Set<number>()
    const semanasEmProgresso = new Set<number>()

    console.log("[v0] [SERVER] Processando semanas...")
    for (const semana of planoLeitura) {
      const capitulosDaSemana = semana.capitulos_semana || []

      if (capitulosDaSemana.length === 0) continue

      const todosCapitulosLidos = capitulosDaSemana.every((capId: number) => capitulosLidos.has(capId))

      if (todosCapitulosLidos) {
        semanasConcluidas.add(semana.semana)
      } else {
        const algumCapituloLido = capitulosDaSemana.some((capId: number) => capitulosLidos.has(capId))
        if (algumCapituloLido) {
          semanasEmProgresso.add(semana.semana)
        }
      }
    }

    console.log("[v0] [SERVER] Semanas concluídas:", semanasConcluidas.size)
    console.log("[v0] [SERVER] Semanas em progresso:", semanasEmProgresso.size)

    const leiturasRealizadas = semanasConcluidas.size
    const totalLeituras = 52
    const progressoPercentual = Math.round((leiturasRealizadas / totalLeituras) * 100)

    console.log("[v0] [SERVER] Processando searchParams...")
    const params = await searchParams
    const semanaAtual = discipulo.passo_atual || 1
    const semanaSelecionada = params.semana ? Number.parseInt(params.semana) : semanaAtual
    const leituraAtual = planoLeitura.find((s) => s.semana === semanaSelecionada)

    console.log("[v0] [SERVER] Semana selecionada:", semanaSelecionada)
    console.log("[v0] [SERVER] Leitura atual encontrada:", !!leituraAtual)

    const temSemanaAnterior = semanaSelecionada > 1
    const temProximaSemana = semanaSelecionada < 52

    console.log("[v0] [SERVER] Renderizando página...")

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-primary" />
              Leitura Bíblica em 1 Ano
            </h1>
            <div className="text-muted-foreground text-lg">
              Leia a Bíblia em 1 ano seguindo um plano progressivo e temático
            </div>
          </div>

          {/* Progresso Geral */}
          <Card className="mb-8">
            <CardHeader>
              <ProgressoAnualClient
                capitulosLidos={capitulosLidosArray}
                onChapterRead={(capId) => {
                  console.log("[v0] [CLIENT] Capítulo lido callback:", capId)
                }}
              >
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Progresso Anual
                  </CardTitle>
                  <CardDescription>
                    {leiturasRealizadas} de {totalLeituras} semanas completas ({progressoPercentual}%)
                  </CardDescription>
                </div>
              </ProgressoAnualClient>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="gap-1 w-8 h-6 justify-center p-0 bg-green-100 text-green-700 hover:bg-green-100"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </Badge>
                  <span>Concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="default"
                    className="gap-1 w-8 h-6 justify-center p-0 bg-yellow-500 hover:bg-yellow-500"
                  >
                    <AlertCircle className="w-3 h-3" />
                  </Badge>
                  <span>Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-1 w-8 h-6 justify-center p-0">
                    <Calendar className="w-3 h-3" />
                  </Badge>
                  <span>Atual</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 h-6 justify-center p-0">
                    •
                  </Badge>
                  <span>Não Iniciada</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {planoLeitura.map((semana) => {
                  const confirmada = semanasConcluidas.has(semana.semana)
                  const emProgresso = semanasEmProgresso.has(semana.semana)
                  const ehAtual = semana.semana === semanaAtual
                  const isPendente = semana.semana < semanaAtual && !confirmada

                  let badgeClass = ""
                  let icon = null

                  if (confirmada) {
                    badgeClass = "bg-green-100 text-green-700 hover:bg-green-100 border-green-300"
                    icon = <CheckCircle2 className="w-3 h-3" />
                  } else if (isPendente) {
                    badgeClass = "bg-yellow-500 text-white hover:bg-yellow-500"
                    icon = <AlertCircle className="w-3 h-3" />
                  } else if (ehAtual) {
                    badgeClass = "bg-primary text-primary-foreground hover:bg-primary"
                    icon = <Calendar className="w-3 h-3" />
                  } else {
                    badgeClass = ""
                  }

                  return (
                    <Link key={semana.semana} href={`/dashboard/leitura-biblica?semana=${semana.semana}`}>
                      <Badge
                        variant={badgeClass ? undefined : "outline"}
                        className={`gap-1 cursor-pointer hover:opacity-80 transition-opacity w-8 h-6 justify-center p-0 ${badgeClass}`}
                      >
                        {icon}
                        {semana.semana}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {leituraAtual && (
            <div className="mb-4">
              <div className="flex items-center justify-between gap-4">
                <Link href={`/dashboard/leitura-biblica?semana=${semanaSelecionada - 1}`}>
                  <Button variant="outline" size="sm" disabled={!temSemanaAnterior} className="gap-2 bg-transparent">
                    <ChevronLeft className="w-4 h-4" />
                    Semana Anterior
                  </Button>
                </Link>

                <div className="text-center">
                  {semanaSelecionada !== semanaAtual && (
                    <Link href="/dashboard/leitura-biblica">
                      <Button variant="ghost" size="sm">
                        Atual ({semanaAtual})
                      </Button>
                    </Link>
                  )}
                </div>

                <Link href={`/dashboard/leitura-biblica?semana=${semanaSelecionada + 1}`}>
                  <Button variant="outline" size="sm" disabled={!temProximaSemana} className="gap-2 bg-transparent">
                    Próxima Semana
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Leitura da Semana */}
          {leituraAtual && (
            <LeituraBiblicaClient
              leituraAtual={{
                semana: leituraAtual.semana,
                tema: leituraAtual.tema,
                livro: leituraAtual.livro,
                capituloInicio: leituraAtual.capitulo_inicio,
                capituloFim: leituraAtual.capitulo_fim,
                totalCapitulos: leituraAtual.total_capitulos,
                fase: leituraAtual.fase,
                descricao: leituraAtual.descricao,
                capitulosSemana: leituraAtual.capitulos_semana || [],
              }}
              discipuloId={discipulo.id}
              leituraJaConfirmada={semanasConcluidas.has(leituraAtual.semana)}
              capitulosLidosInicial={capitulosLidosArray}
            />
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] [SERVER] Erro na página de leitura bíblica:", error)
    console.error("[v0] [SERVER] Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    throw error
  }
}
