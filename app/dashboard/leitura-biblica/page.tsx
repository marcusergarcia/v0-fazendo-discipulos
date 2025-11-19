import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle2, Trophy, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { PLANO_LEITURA_ANUAL, getLeituraPorPasso } from '@/constants/plano-leitura-biblica'
import LeituraBiblicaClient from './leitura-biblica-client'

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
    redirect('/auth/login')
  }

  // Buscar discípulo
  const { data: discipulo } = await supabase
    .from('discipulos')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!discipulo) {
    redirect('/dashboard')
  }

  // Buscar leituras confirmadas
  const { data: leituras } = await supabase
    .from('leituras_biblicas')
    .select('*')
    .eq('discipulo_id', discipulo.id)
    .order('semana_numero')

  const leiturasConfirmadas = leituras?.filter(l => l.confirmada) || []
  const totalLeituras = 52
  const leiturasRealizadas = leiturasConfirmadas.length
  const progressoPercentual = Math.round((leiturasRealizadas / totalLeituras) * 100)

  const params = await searchParams
  const semanaAtual = discipulo.passo_atual || 1
  const semanaSelecionada = params.semana ? parseInt(params.semana) : semanaAtual
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
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Seu Progresso Anual
            </CardTitle>
            <CardDescription>
              {leiturasRealizadas} de {totalLeituras} semanas completas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progresso</span>
                <span className="text-muted-foreground">{progressoPercentual}%</span>
              </div>
              <Progress value={progressoPercentual} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                Continue firme! Cada semana de leitura rende 10 XP
              </p>
            </div>
          </CardContent>
        </Card>

        {leituraAtual && (
          <div className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <Link href={`/dashboard/leitura-biblica?semana=${semanaSelecionada - 1}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!temSemanaAnterior}
                  className="gap-2"
                >
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={!temProximaSemana}
                  className="gap-2"
                >
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
            leituraJaConfirmada={leiturasConfirmadas.some(l => l.semana_numero === leituraAtual.semana)}
          />
        )}

        {/* Lista de todas as leituras */}
        <Card>
          <CardHeader>
            <CardTitle>Plano Completo de Leitura</CardTitle>
            <CardDescription>52 semanas de leitura progressiva</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PLANO_LEITURA_ANUAL.map((leitura) => {
                const confirmada = leiturasConfirmadas.some(l => l.semana_numero === leitura.semana)
                const ehAtual = leitura.semana === semanaAtual

                return (
                  <div
                    key={leitura.semana}
                    className={`p-4 border rounded-lg ${
                      ehAtual ? 'border-primary bg-primary/5' : ''
                    } ${confirmada ? 'bg-accent/5 border-accent' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {confirmada ? (
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                        ) : (
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-semibold">
                            Semana {leitura.semana}: {leitura.tema}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {leitura.livro} {leitura.capituloInicio}
                            {leitura.capituloFim !== leitura.capituloInicio
                              ? `-${leitura.capituloFim}`
                              : ''}{' '}
                            ({leitura.totalCapitulos} cap.)
                          </p>
                        </div>
                      </div>
                      <Badge variant={confirmada ? 'default' : 'outline'}>
                        {confirmada ? 'Concluída' : ehAtual ? 'Atual' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
