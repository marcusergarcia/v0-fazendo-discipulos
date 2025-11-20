import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, BookOpen, CheckCircle2, Trophy, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
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

  // Buscar leituras confirmadas
  const { data: leituras } = await supabase
    .from("leituras_biblicas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .order("semana_numero")

  const leiturasConfirmadas = leituras?.filter((l) => l.confirmada) || []
  const totalLeituras = 52
  const leiturasRealizadas = leiturasConfirmadas.length
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
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {PLANO_LEITURA_ANUAL.map((semana) => {
                const confirmada = leiturasConfirmadas.some((l) => l.semana_numero === semana.semana)
                const ehAtual = semana.semana === semanaAtual
                const isPending = semana.semana > semanaAtual

                return (
                  <Link key={semana.semana} href={`/dashboard/leitura-biblica?semana=${semana.semana}`}>
                    <Badge
                      variant={ehAtual ? "default" : confirmada ? "secondary" : "outline"}
                      className="gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {confirmada && <CheckCircle2 className="w-3 h-3" />}
                      {ehAtual && !confirmada && <Calendar className="w-3 h-3" />}S{semana.semana}
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
            leituraJaConfirmada={leiturasConfirmadas.some((l) => l.semana_numero === leituraAtual.semana)}
          />
        )}
      </div>
    </div>
  )
}
