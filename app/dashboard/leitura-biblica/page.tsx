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
import { PLANO_LEITURA_ANUAL, getLeituraPorPasso } from "@/constants/plano-leitura-biblica"
import LeituraBiblicaClient from "./leitura-biblica-client"

export default async function LeituraBiblicaPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  // Buscar discípulo
  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    redirect("/dashboard")
  }

  const { data: leituraData } = await supabase
    .from("leituras_capitulos")
    .select("capitulos_lidos")
    .eq("usuario_id", discipulo.id)
    .single()

  const capitulosLidos = leituraData?.capitulos_lidos || []

  // Calcular quais semanas estão completas
  const semanasConcluidas = new Set<number>()
  const semanasEmProgresso = new Set<number>()

  for (let i = 1; i <= 52; i++) {
    const leituraDaSemana = getLeituraPorPasso(i)
    if (!leituraDaSemana) continue

    // Contar quantos capítulos desta semana foram lidos
    const capitulosDaSemana = capitulosLidos.filter((capId: number) => {
      // Verificar se o capítulo pertence a esta semana
      // (assumindo que os IDs seguem ordem sequencial no banco)
      return true // TODO: implementar lógica correta de verificação
    })

    if (capitulosDaSemana.length === leituraDaSemana.totalCapitulos) {
      semanasConcluidas.add(i)
    } else if (capitulosDaSemana.length > 0) {
      semanasEmProgresso.add(i)
    }
  }

  const leiturasRealizadas = semanasConcluidas.size
  const totalLeituras = 52
  const progressoPercentual = Math.round((leiturasRealizadas / totalLeituras) * 100)

  const params = await searchParams
  const semanaAtual = discipulo.passo_atual || 1
  const semanaSelecionada = params.semana ? Number.parseInt(params.semana) : semanaAtual
  const leituraAtual = getLeituraPorPasso(semanaSelecionada)

  const temSemanaAnterior = semanaSelecionada > 1
  const temProximaSemana = semanaSelecionada < 52

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
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Progresso Anual
            </CardTitle>
            <CardDescription>
              {leiturasRealizadas} de {totalLeituras} semanas completas ({progressoPercentual}%)
            </CardDescription>
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
                <Badge variant="default" className="gap-1 w-8 h-6 justify-center p-0 bg-yellow-500 hover:bg-yellow-500">
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
              {PLANO_LEITURA_ANUAL.map((semana) => {
                const confirmada = semanasConcluidas.has(semana.semana)
                const emProgresso = semanasEmProgresso.has(semana.semana)
                const ehAtual = semana.semana === semanaAtual
                const isPendente = semana.semana < semanaAtual && !confirmada

                // Lógica de cores:
                // Verde: 100% completa
                // Amarelo: atual OU em progresso mas incompleta (pendente)
                // Azul: semana atual e não iniciada
                // Outline: não iniciada e futura

                let badgeClass = ""
                let icon = null

                if (confirmada) {
                  // Verde: completa
                  badgeClass = "bg-green-100 text-green-700 hover:bg-green-100 border-green-300"
                  icon = <CheckCircle2 className="w-3 h-3" />
                } else if (isPendente || (ehAtual && emProgresso)) {
                  // Amarelo: pendente (atrasada) ou atual em progresso
                  badgeClass = "bg-yellow-500 text-white hover:bg-yellow-500"
                  icon = <AlertCircle className="w-3 h-3" />
                } else if (ehAtual) {
                  // Azul: semana atual não iniciada
                  badgeClass = "bg-primary text-primary-foreground hover:bg-primary"
                  icon = <Calendar className="w-3 h-3" />
                } else {
                  // Outline: não iniciada e futura
                  badgeClass = ""
                }

                return (
                  <Link key={semana.semana} href={`/dashboard/leitura-biblica?semana=${semana.semana}`}>
                    <Badge
                      variant={badgeClass ? undefined : "outline"}
                      className={`gap-1 cursor-pointer hover:opacity-80 transition-opacity ${badgeClass}`}
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
                      Voltar para Semana Atual ({semanaAtual})
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
            leituraAtual={leituraAtual}
            discipuloId={discipulo.id}
            leituraJaConfirmada={semanasConcluidas.has(leituraAtual.semana)}
          />
        )}
      </div>
    </div>
  )
}
