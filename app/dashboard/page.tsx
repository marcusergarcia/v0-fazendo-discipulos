import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import Image from "next/image"
import {
  Trophy,
  Target,
  Users,
  BookOpen,
  Shield,
  Award,
  Clock,
  Sparkles,
  LogOut,
  GitBranch,
  UserPlus,
  UsersRound,
  Book,
} from "lucide-react"
import { generateAvatarUrl } from "@/lib/generate-avatar"
import DashboardCelebracaoClient from "@/components/dashboard-celebracao-client"
import { StepBadge } from "@/components/step-badge"

export default async function DashboardPage() {
  console.log("[v0] DashboardPage iniciada")

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("[v0] Auth check - User:", user?.id, "Error:", authError)

  if (authError || !user) {
    console.log("[v0] Sem autenticação, redirecionando para login")
    redirect("/auth/login")
  }

  // Buscar perfil do usuário
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  console.log("[v0] Profile check - Data:", profile?.id, "Error:", profileError)

  // Buscar dados do discípulo
  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) {
    redirect("/auth/login")
  }

  const { data: progressoFases, error: progressoError } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .maybeSingle()

  console.log("[v0] Progresso check - Data:", !!progressoFases, "Error:", progressoError)

  // Buscar recompensas
  const { data: recompensas, error: recompensasError } = await supabase
    .from("recompensas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .order("created_at", { ascending: false })

  console.log("[v0] Recompensas check - Count:", recompensas?.length, "Error:", recompensasError)

  // Se está no passo 2, significa que completou o passo 1
  const passosCompletados = (discipulo.passo_atual || 1) - 1
  const xpAtual = discipulo.xp_total || 0
  const xpProximoNivel = 1000

  // Nome do nível
  const nivelNome = discipulo.nivel_atual || "Explorador"

  // Fase atual
  const faseNome = `FASE ${discipulo.fase_atual || 1}: ${getFaseNome(discipulo.fase_atual || 1)}`

  // Passo atual (primeiro não completado)
  const passoAtual = discipulo.passo_atual || 1
  const totalPassos = 10

  const totalInsignias = recompensas?.[0]?.insignias?.length || 0

  const { data: discipuladorData } = await supabase
    .from("profiles")
    .select("nome_completo")
    .eq("id", discipulo.discipulador_id)
    .single()

  const nomeDiscipulador = discipuladorData?.nome_completo || "Aguardando"

  const userData = {
    name: profile?.nome_completo || "Usuário",
    email: user.email || "",
    level: getLevelNumber(nivelNome),
    levelName: nivelNome,
    xp: xpAtual,
    xpToNext: xpProximoNivel,
    currentPhase: faseNome,
    currentStep: passoAtual,
    totalSteps: totalPassos,
  }

  console.log("[v0] UserData preparado:", userData)

  const avatarUrl = profile?.foto_perfil_url || null

  const calcularIdade = () => {
    if (!profile?.data_nascimento) return null
    const hoje = new Date()
    const nascimento = new Date(profile.data_nascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  const idade = calcularIdade()

  const displayAvatarUrl =
    avatarUrl ||
    generateAvatarUrl({
      genero: profile?.genero,
      idade: idade || undefined,
      etnia: profile?.etnia,
    })

  // Primeiro buscar o ID do perfil do usuário
  const { data: discipuladorProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

  const { count: notificationCount } = await supabase
    .from("notificacoes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", discipuladorProfile?.id || user.id)
    .eq("lida", false)
    .eq("tipo", "mensagem")

  // Buscar discípulos do discipulador se ele for um discipulador
  const { data: meusDiscipulos } = await supabase
    .from("discipulos")
    .select("id")
    .eq("discipulador_id", user.id)
    .eq("aprovado_discipulador", true)

  const meusDiscipuloIds = meusDiscipulos?.map((d) => d.id) || []

  let totalPendentesDiscipulador = 0

  if (meusDiscipuloIds.length > 0) {
    // Buscar reflexões pendentes (enviadas mas não aprovadas)
    const { data: reflexoesPendentes } = await supabase
      .from("reflexoes_passo")
      .select("*")
      .eq("discipulador_id", user.id)
      .eq("situacao", "enviado")

    // Buscar perguntas pendentes (enviadas mas não aprovadas)
    const { data: perguntasPendentes } = await supabase
      .from("perguntas_reflexivas")
      .select("*")
      .in("discipulo_id", meusDiscipuloIds)
      .eq("situacao", "enviado")

    // Buscar novos discípulos aguardando aprovação
    const { data: discipulosPendentes } = await supabase
      .from("discipulos")
      .select("*")
      .eq("discipulador_id", user.id)
      .eq("aprovado_discipulador", false)
      .is("user_id", null)

    totalPendentesDiscipulador =
      (reflexoesPendentes?.length || 0) + (perguntasPendentes?.length || 0) + (discipulosPendentes?.length || 0)
  }

  const { data: progressoAtualData } = await supabase
    .from("progresso_fases")
    .select("pontuacao_passo_atual")
    .eq("discipulo_id", discipulo.id)
    .maybeSingle()

  const passoAnterior = (discipulo.passo_atual || 1) - 1
  const deveMostrarCelebracao = passoAnterior > 0 && progressoFases?.celebracao_vista === false

  console.log(
    "[v0] Verificando celebração - Passo anterior:",
    passoAnterior,
    "Celebracao vista:",
    progressoFases?.celebracao_vista,
    "Deve mostrar:",
    deveMostrarCelebracao,
  )

  const xpGanhoPassoAnterior = progressoFases?.pontuacao_passo_anterior || 90 // XP padrão se não encontrar

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/logo-fazendo-discipulos.png"
                  alt="Ministério Fazendo Discípulos"
                  width={100}
                  height={38}
                  priority
                  className="object-contain w-20 sm:w-28"
                />
              </Link>
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/discipulador">
                      <Button variant="ghost" size="sm" className="gap-1.5 relative h-9 px-2 sm:px-3">
                        <UsersRound className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Discipulador</span>
                        {totalPendentesDiscipulador > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {totalPendentesDiscipulador > 9 ? "9+" : totalPendentesDiscipulador}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Área do Discipulador</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/discipulador/convites">
                      <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-2 sm:px-3">
                        <UserPlus className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Convidar</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Convidar Novo Discípulo</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/arvore">
                      <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-2 sm:px-3">
                        <GitBranch className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Árvore</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Árvore de Discipulado</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/chat">
                      <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-2 sm:px-3">
                        <Users className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Chat</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mensagens</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/leitura-biblica">
                      <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-2 sm:px-3">
                        <Book className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Bíblia</span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Leitura Bíblica Anual</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/perfil">
                      <Button variant="ghost" size="sm" className="gap-1.5 h-9 px-2 sm:px-3">
                        <Avatar className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0">
                          <AvatarImage src={displayAvatarUrl || "/placeholder.svg"} alt="Foto de perfil" />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {userData.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden md:inline text-xs sm:text-sm max-w-[80px] truncate">
                          {userData.name}
                        </span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Meu Perfil</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <form
                      action={async () => {
                        "use server"
                        const supabase = await createClient()
                        await supabase.auth.signOut()
                        redirect("/auth/login")
                      }}
                    >
                      <Button variant="ghost" size="sm" type="submit" className="gap-1.5 h-9 px-2 sm:px-3">
                        <LogOut className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">Sair</span>
                      </Button>
                    </form>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sair do Sistema</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {deveMostrarCelebracao && progressoFases && (
        <DashboardCelebracaoClient
          passoNumero={passoAnterior}
          faseNumero={discipulo.fase_atual || 1}
          discipuloId={discipulo.id}
          xpGanho={xpGanhoPassoAnterior}
        />
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Profile Section */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
              <div className="space-y-1 sm:space-y-2">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl leading-tight break-words">
                  Olá, {userData.name}!
                </CardTitle>
                <CardDescription className="text-base sm:text-lg">Continue sua jornada de fé</CardDescription>
              </div>
              <Badge className="text-sm sm:text-base lg:text-lg px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary text-secondary-foreground whitespace-nowrap flex-shrink-0">
                <Trophy className="w-4 h-4 mr-2" />
                Nível {userData.level}: {userData.levelName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="font-medium">Experiência</span>
                {/* Usar pontuacao_passo_atual ao invés de pontuacao_total */}
                <span className="text-muted-foreground">
                  {userData.xp + (progressoAtualData?.pontuacao_passo_atual || 0)} XP Total
                </span>
              </div>
              <Progress value={(userData.xp / userData.xpToNext) * 100} className="h-2 sm:h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {/* Usar pontuacao_passo_atual ao invés de pontuacao_total */}
                <span>Passo Atual: +{progressoAtualData?.pontuacao_passo_atual || 0} XP</span>
                <span>
                  {userData.xp} / {userData.xpToNext} XP para próximo nível
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Current Quest */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Target className="w-5 h-5 text-primary flex-shrink-0" />
                Missão Atual
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">{userData.currentPhase}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">
                  Passo {userData.currentStep} de {userData.totalSteps}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {Math.round((passosCompletados / userData.totalSteps) * 100)}% completo
                </span>
              </div>
              <Progress value={(passosCompletados / userData.totalSteps) * 100} className="h-2" />

              <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-base sm:text-lg break-words">
                  Passo {userData.currentStep}: {getPassoNome(userData.currentStep)}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{getPassoDescricao(userData.currentStep)}</p>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Tempo estimado: 20-30 minutos</span>
                </div>

                <Link href={`/dashboard/passo/${userData.currentStep}`}>
                  <Button className="w-full mt-3 sm:mt-4" size="lg">
                    Continuar Missão
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatItem icon={<Award />} label="Insígnias" value={totalInsignias.toString()} />
                <StatItem
                  icon={<BookOpen />}
                  label="Passos Completos"
                  value={`${passosCompletados}/${userData.totalSteps}`}
                />
                <StatItem icon={<Users />} label="Discipulador" value={nomeDiscipulador} />
                <StatItem icon={<Shield />} label="Mensagens Não Lidas" value={notificationCount?.toString() || "0"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próxima Recompensa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4">
                  <div className="flex justify-center mb-3">
                    <StepBadge stepNumber={userData.currentStep} status="current" size="lg" />
                  </div>
                  <p className="font-medium">Insígnia: {getRecompensaNome(userData.currentStep)}</p>
                  <p className="text-sm text-muted-foreground mt-1">Complete o Passo {userData.currentStep}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Journey Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Sua Jornada - {userData.currentPhase}</CardTitle>
            <CardDescription>Complete todos os 10 passos para receber a Medalha "Novo Nascimento"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }, (_, i) => {
                const stepNumber = i + 1
                const isCompleted = stepNumber < userData.currentStep
                const isCurrent = stepNumber === userData.currentStep
                const status = isCompleted ? "completed" : isCurrent ? "current" : "locked"

                return (
                  <StepCard
                    key={stepNumber}
                    number={stepNumber}
                    title={getPassoNome(stepNumber)}
                    status={status as "completed" | "current" | "locked"}
                    href={status === "locked" ? undefined : `/dashboard/passo/${stepNumber}`}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getFaseNome(fase: number): string {
  const fases: Record<number, string> = {
    1: "O Evangelho",
    2: "Armadura de Deus",
    3: "Sermão da Montanha",
    4: "Pão Diário",
    5: "Oração",
    6: "Igreja Local",
    7: "Testemunho",
    8: "Treinamento Final",
  }
  return fases[fase] || "O Evangelho"
}

function getPassoNome(passo: number): string {
  const passos: Record<number, string> = {
    1: "Deus nos Criou",
    2: "Deus nos Ama",
    3: "O Pecado Entrou",
    4: "Consequência",
    5: "A Provisão Divina",
    6: "Morte e Ressurreição",
    7: "Graça e Fé",
    8: "Arrependimento",
    9: "Confessar Jesus",
    10: "Novo Nascimento",
  }
  return passos[passo] || "Desconhecido"
}

function getPassoDescricao(passo: number): string {
  const descricoes: Record<number, string> = {
    1: "Entenda como Deus criou o mundo e a humanidade com propósito.",
    2: "Descubra o amor incondicional de Deus pela humanidade.",
    3: "Compreenda como o pecado rompeu o relacionamento com Deus.",
    4: "Conheça as consequências do pecado para a humanidade.",
    5: "Aprenda as quatro provisões que Jesus realizou na cruz.",
    6: "Entenda o sacrifício e a vitória de Cristo na cruz.",
    7: "Descubra como somos salvos pela graça através da fé.",
    8: "Aprenda sobre o arrependimento genuíno.",
    9: "Compreenda a importância de confessar Jesus como Senhor.",
    10: "Celebre o novo nascimento e a vida em Cristo.",
  }
  return descricoes[passo] || "Passo da jornada de fé."
}

function getRecompensaNome(passo: number): string {
  const recompensas: Record<number, string> = {
    1: "Criação",
    2: "Amor Divino",
    3: "Reconhecimento da Verdade",
    4: "Consciência",
    5: "Cristo é o Caminho",
    6: "Cruz e Ressurreição",
    7: "Graça",
    8: "Coração Quebrantado",
    9: "Confissão",
    10: "Novo Nascimento",
  }
  return recompensas[passo] || "Recompensa Especial"
}

function getLevelNumber(levelName: string): number {
  const levels: Record<string, number> = {
    Explorador: 1,
    Discípulo: 2,
    Guerreiro: 3,
    "Servo Mestre": 4,
    Multiplicador: 5,
  }
  return levels[levelName] || 1
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="text-primary">{icon}</div>
        <span>{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function StepCard({
  number,
  title,
  status,
  href,
}: { number: number; title: string; status: "completed" | "current" | "locked"; href?: string }) {
  const getStyles = () => {
    switch (status) {
      case "completed":
        return "border-accent bg-accent/5"
      case "current":
        return "border-primary bg-primary/5 ring-2 ring-primary/20"
      case "locked":
        return "opacity-50"
    }
  }

  const content = (
    <div className={`p-4 text-center transition-all hover:shadow-md ${getStyles()} ${href ? "cursor-pointer" : ""}`}>
      <div className="flex justify-center mb-3">
        <StepBadge stepNumber={number} status={status} size="md" />
      </div>
      <div className="text-lg font-bold mb-1">{number}</div>
      <div className="text-sm font-medium">{title}</div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
