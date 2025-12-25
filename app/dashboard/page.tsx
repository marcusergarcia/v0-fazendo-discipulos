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
  Check,
} from "lucide-react"
import { generateAvatarUrl } from "@/lib/generate-avatar"
import DashboardCelebracaoClient from "@/components/dashboard-celebracao-client"
import { StepBadge } from "@/components/step-badge"
import { ModalDecisaoPorCristo } from "@/components/modal-decisao-por-cristo"
import {
  getFaseNome,
  getRecompensaNome,
  getRecompensaBatismoNome,
  getPassoNome,
  getPassoDescricao,
} from "@/constants/fases-passos"
import { getPassoBatismoNome, getPassoBatismoDescricao } from "@/constants/passos-batismo"

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
  console.log("[v0] Discipulo data:", {
    fase_atual: discipulo.fase_atual,
    passo_atual: discipulo.passo_atual,
    id: discipulo.id,
  })
  console.log("[v0] ProgressoFases data:", {
    fase_atual: progressoFases?.fase_atual,
    passo_atual: progressoFases?.passo_atual,
    fase_1_completa: progressoFases?.fase_1_completa,
  })

  // Buscar recompensas
  const { data: recompensas, error: recompensasError } = await supabase
    .from("recompensas")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .order("created_at", { ascending: false })

  console.log("[v0] Recompensas check - Count:", recompensas?.length, "Error:", recompensasError)

  const estaEmFaseBatismo = discipulo.necessita_fase_batismo && discipulo.fase_atual === 1
  const faseAtualReal = discipulo.fase_atual || progressoFases?.fase_atual || 1
  const passoAtual = discipulo.passo_atual || progressoFases?.passo_atual || 1
  const totalPassos = estaEmFaseBatismo ? 12 : 10

  console.log("[v0] Fase calculada:", {
    faseAtualReal,
    estaEmFaseBatismo,
    necessita_fase_batismo: discipulo.necessita_fase_batismo,
    passoAtual,
    totalPassos,
  })

  const totalInsignias = recompensas?.[0]?.insignias?.length || 0

  console.log("[v0] Insignias debug:", {
    recompensasCount: recompensas?.length,
    primeiraRecompensa: recompensas?.[0],
    insigniasArray: recompensas?.[0]?.insignias,
    totalInsignias,
    passoAtualDiscipulo: discipulo.passo_atual,
    faseAtualDiscipulo: discipulo.fase_atual,
  })

  const { data: discipuladorData } = await supabase
    .from("profiles")
    .select("nome_completo")
    .eq("id", discipulo.discipulador_id)
    .single()

  const nomeDiscipulador = discipuladorData?.nome_completo || "Aguardando"

  const userData = {
    name: profile?.nome_completo || "Usuário",
    email: user.email || "",
    level: getLevelNumber(estaEmFaseBatismo ? "Batismo Cristão" : getFaseNome(faseAtualReal)),
    levelName: estaEmFaseBatismo ? "Batismo Cristão" : getFaseNome(faseAtualReal),
    xp: discipulo.xp_total || 0,
    xpToNext: 1000,
    currentPhase: estaEmFaseBatismo
      ? `FASE INTERMEDIÁRIA: Batismo Cristão`
      : `FASE ${faseAtualReal}: ${getFaseNome(faseAtualReal)}`,
    currentStep: passoAtual,
    totalSteps: totalPassos,
    faseNumero: faseAtualReal,
    estaEmFaseBatismo,
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

  const { data: progressoCheck } = await supabase
    .from("progresso_fases")
    .select("celebracao_vista, pontuacao_passo_anterior, passo_atual, fase_1_completa")
    .eq("discipulo_id", discipulo.id)
    .single()

  // Verificar se completou fase 1 para mostrar modal de decisão
  const fase1Completa = progressoCheck?.fase_1_completa === true
  const deveMostrarDecisaoCristo = fase1Completa && !discipulo.decisao_por_cristo

  // Modal de celebração padrão para passos 1-9
  const deveMostrarCelebracao =
    passoAtual > 1 &&
    progressoCheck?.celebracao_vista === false &&
    !fase1Completa &&
    progressoCheck?.pontuacao_passo_anterior

  console.log(
    "[v0] Verificando modais - Fase 1 completa:",
    fase1Completa,
    "Decisão por Cristo:",
    discipulo.decisao_por_cristo,
    "Deve mostrar decisão:",
    deveMostrarDecisaoCristo,
  )

  console.log(
    "[v0] Verificando celebração - Passo atual:",
    passoAtual,
    "Celebração vista:",
    progressoCheck?.celebracao_vista,
    "Deve mostrar:",
    deveMostrarCelebracao,
  )

  // Calcular progresso corretamente
  const passosCompletados =
    fase1Completa && faseAtualReal === 1
      ? 10
      : estaEmFaseBatismo
        ? Math.max(0, passoAtual - 1)
        : Math.max(0, passoAtual - 1)

  console.log("[v0] Passos completados calculados:", passosCompletados)

  const currentPhaseData = {
    nome: estaEmFaseBatismo ? "Batismo Cristão" : getFaseNome(faseAtualReal),
    passoAtual: passoAtual,
    totalPassos: totalPassos,
    descricaoFase: estaEmFaseBatismo
      ? "Complete todos os 12 passos para aprender sobre o Batismo Cristão e se preparar para ser batizado"
      : `Complete todos os ${totalPassos} passos para aprender sobre ${getFaseNome(faseAtualReal)}`,
    passoTitulo: estaEmFaseBatismo ? getPassoBatismoNome(passoAtual) : getPassoNome(passoAtual),
    passoDescricao: estaEmFaseBatismo ? getPassoBatismoDescricao(passoAtual) : getPassoDescricao(passoAtual),
  }

  const jornada = Array.from({ length: totalPassos }, (_, i) => {
    const stepNumber = i + 1
    const isCompleted = stepNumber < passoAtual
    const isCurrent = stepNumber === passoAtual

    return {
      step: stepNumber,
      title: estaEmFaseBatismo ? getPassoBatismoNome(stepNumber) : getPassoNome(stepNumber),
      isCompleted,
      isCurrent,
      href: `/dashboard/passo/${stepNumber}${estaEmFaseBatismo ? "?fase=batismo" : ""}`,
      recompensa: estaEmFaseBatismo ? getRecompensaBatismoNome(stepNumber) : getRecompensaNome(stepNumber),
    }
  })

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

      {deveMostrarDecisaoCristo && (
        <ModalDecisaoPorCristo open={true} discipuloId={discipulo.id} nomeCompleto={profile?.nome_completo || ""} />
      )}

      {/* Modal de celebração padrão para outros passos */}
      {deveMostrarCelebracao && progressoCheck && (
        <DashboardCelebracaoClient
          passoNumero={passoAtual - 1}
          faseNumero={userData.faseNumero}
          discipuloId={discipulo.id}
          xpGanho={progressoCheck.pontuacao_passo_anterior}
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
                <span className="text-muted-foreground">{userData.xp} XP Total</span>
              </div>
              <Progress value={(userData.xp / userData.xpToNext) * 100} className="h-2 sm:h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {/* Usar pontuacao_passo_atual ao invés de pontuacao_total */}
                <span>Passos Completados: {passosCompletados}</span>
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
                  Passo {userData.currentStep}: {currentPhaseData.passoTitulo}
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">{currentPhaseData.passoDescricao}</p>

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
                  <p className="font-medium">Insígnia: {jornada[userData.currentStep - 1].recompensa}</p>
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
            <CardDescription>{currentPhaseData.descricaoFase}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {jornada.map((step) => (
                <Link
                  key={step.step}
                  href={step.href}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    step.isCompleted
                      ? "bg-primary/10 border-primary"
                      : step.isCurrent
                        ? "bg-primary/5 border-primary/50"
                        : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      step.isCompleted
                        ? "bg-primary text-primary-foreground"
                        : step.isCurrent
                          ? "bg-primary/20 text-primary"
                          : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {step.isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="text-lg font-bold">{step.step}</span>
                    )}
                  </div>
                  <span className="text-xs text-center font-medium text-foreground">{step.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getLevelNumber(levelName: string): number {
  const fases: Record<string, number> = {
    "O Evangelho": 1,
    "Batismo Cristão": 2,
    "Armadura de Deus": 3,
    "Sermão da Montanha": 4,
    "Pão Diário": 5,
    Oração: 6,
    "Igreja Local": 7,
    Testemunho: 8,
    "Treinamento Final": 9,
  }
  return fases[levelName] || 1
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
