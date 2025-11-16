import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { Trophy, Target, Users, BookOpen, Shield, Award, Lock, CheckCircle2, Clock, Sparkles, LogOut, GitBranch, UserPlus, UsersRound } from 'lucide-react'
import { generateAvatarUrl } from "@/lib/generate-avatar"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
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
  const { data: discipulo, error: discipuloError } = await supabase
    .from("discipulos")
    .select("*")
    .eq("user_id", user.id)
    .single()

  console.log("[v0] Discipulo check - Data:", discipulo?.id, "Error:", discipuloError)

  // Buscar progresso dos passos
  const { data: progressoFases, error: progressoError } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo?.id || "")
    .eq("fase_numero", discipulo?.fase_atual || 1)
    .order("passo_numero")

  console.log("[v0] Progresso check - Count:", progressoFases?.length, "Error:", progressoError)

  // Buscar recompensas
  const { data: recompensas, error: recompensasError } = await supabase
    .from("recompensas")
    .select("*")
    .eq("discipulo_id", discipulo?.id || "")
    .order("conquistado_em", { ascending: false })

  console.log("[v0] Recompensas check - Count:", recompensas?.length, "Error:", recompensasError)

  // Calcular XP para próximo nível baseado nos passos completados
  const passosCompletados = progressoFases?.filter((p) => p.completado).length || 0
  const xpAtual = discipulo?.xp_total || 0
  const xpProximoNivel = 1000

  // Nome do nível
  const nivelNome = discipulo?.nivel_atual || "Explorador"

  // Fase atual
  const faseNome = `FASE ${discipulo?.fase_atual || 1}: ${getFaseNome(discipulo?.fase_atual || 1)}`

  // Passo atual (primeiro não completado)
  const passoAtual = progressoFases?.find((p) => !p.completado)?.passo_numero || 1
  const totalPassos = 10

  const userData = {
    name: profile?.nome_completo || user.email?.split("@")[0] || "Discípulo",
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

  const displayAvatarUrl = avatarUrl || generateAvatarUrl({
    genero: profile?.genero,
    idade: idade || undefined,
    etnia: profile?.etnia
  })

  const { count: notificationCount } = await supabase
    .from("notificacoes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      {searchParams.error === "passo-load-failed" && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mx-4 mt-4">
          <p className="font-medium">Erro ao carregar passo</p>
          <p className="text-sm">Ocorreu um problema ao carregar a página do passo. Por favor, tente novamente.</p>
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Image
                  src="/logo-fazendo-discipulos.png"
                  alt="Ministério Fazendo Discípulos"
                  width={120}
                  height={45}
                  priority
                  className="object-contain"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/discipulador">
                <Button variant="ghost" size="sm" className="gap-2 relative">
                  <UsersRound className="w-4 h-4" />
                  <span className="hidden sm:inline">Discipulador</span>
                  {notificationCount && notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/discipulador/convites">
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Convidar</span>
                </Button>
              </Link>
              <Link href="/dashboard/arvore">
                <Button variant="ghost" size="sm" className="gap-2">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">Árvore</span>
                </Button>
              </Link>
              <Link href="/dashboard/chat">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              </Link>
              <Link href="/dashboard/perfil">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={displayAvatarUrl || "/placeholder.svg"} alt="Foto de perfil" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{userData.name}</span>
                </Button>
              </Link>
              <form
                action={async () => {
                  "use server"
                  const supabase = await createClient()
                  await supabase.auth.signOut()
                  redirect("/auth/login")
                }}
              >
                <Button variant="ghost" size="sm" type="submit" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <Card className="mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">Olá, {userData.name}!</CardTitle>
                <CardDescription className="text-lg">Continue sua jornada de fé</CardDescription>
              </div>
              <Badge className="text-lg px-4 py-2 bg-secondary text-secondary-foreground">
                <Trophy className="w-4 h-4 mr-2" />
                Nível {userData.level}: {userData.levelName}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Experiência</span>
                <span className="text-muted-foreground">
                  {userData.xp} / {userData.xpToNext} XP
                </span>
              </div>
              <Progress value={(userData.xp / userData.xpToNext) * 100} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Current Quest */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Missão Atual
              </CardTitle>
              <CardDescription>{userData.currentPhase}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Passo {userData.currentStep} de {userData.totalSteps}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((passosCompletados / userData.totalSteps) * 100)}% completo
                </span>
              </div>
              <Progress value={(passosCompletados / userData.totalSteps) * 100} className="h-2" />

              <div className="pt-4 space-y-3">
                <h4 className="font-semibold text-lg">
                  Passo {userData.currentStep}: {getPassoNome(userData.currentStep)}
                </h4>
                <p className="text-sm text-muted-foreground">{getPassoDescricao(userData.currentStep)}</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Tempo estimado: 20-30 minutos</span>
                </div>

                <Link href={`/dashboard/passo/${userData.currentStep}`}>
                  <Button className="w-full mt-4" size="lg">
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
                <StatItem
                  icon={<Award />}
                  label="Insígnias"
                  value={recompensas?.filter((r) => r.tipo_recompensa === "insignia").length.toString() || "0"}
                />
                <StatItem
                  icon={<BookOpen />}
                  label="Passos Completos"
                  value={`${passosCompletados}/${userData.totalSteps}`}
                />
                <StatItem icon={<Users />} label="Discipulador" value="Aguardando" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próxima Recompensa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-secondary" />
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
                const stepProgress = progressoFases?.find((p) => p.passo_numero === stepNumber)
                const status = stepProgress?.completado
                  ? "completed"
                  : stepNumber === userData.currentStep
                    ? "current"
                    : "locked"

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
    5: "Jesus é a Solução",
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
    5: "Aprenda como Jesus é a única solução para o pecado.",
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
    5: "Salvador",
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
  const getIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />
      case "current":
        return <Target className="w-6 h-6 text-primary" />
      case "locked":
        return <Lock className="w-6 h-6 text-muted-foreground" />
    }
  }

  const getStyles = () => {
    switch (status) {
      case "completed":
        return "border-green-600 bg-green-50"
      case "current":
        return "border-primary bg-primary/5 ring-2 ring-primary/20"
      case "locked":
        return "opacity-50"
    }
  }

  const getBadge = () => {
    if (status === "completed") {
      return (
        <Badge className="mt-2 bg-green-600 text-white text-xs">
          Aprovado
        </Badge>
      )
    }
    return null
  }

  const content = (
    <div className={`p-4 text-center transition-all hover:shadow-md ${getStyles()} ${href ? "cursor-pointer" : ""}`}>
      <div className="flex justify-center mb-2">{getIcon()}</div>
      <div className="text-lg font-bold mb-1">{number}</div>
      <div className="text-sm font-medium">{title}</div>
      {getBadge()}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
