import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Clock, Sparkles, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AguardandoAprovacaoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*, profiles!inner(*)")
    .eq("user_id", user.id)
    .single()

  if (!discipulo) redirect("/dashboard")

  const passoAtual = discipulo.passo_atual

  // Verificar status do passo
  const { data: reflexoesPasso } = await supabase
    .from("reflexoes_passo")
    .select("tipo, feedbacks")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoAtual)

  const { data: perguntasReflexivas } = await supabase
    .from("perguntas_reflexivas")
    .select("situacao")
    .eq("discipulo_id", discipulo.id)
    .eq("passo_numero", passoAtual)
    .maybeSingle()

  // Check if all videos and articles have feedbacks
  const videoReflexao = reflexoesPasso?.find((r) => r.tipo === "video")
  const artigoReflexao = reflexoesPasso?.find((r) => r.tipo === "artigo")

  const videosAprovados =
    videoReflexao?.feedbacks && Array.isArray(videoReflexao.feedbacks) && videoReflexao.feedbacks.length > 0
  const artigosAprovados =
    artigoReflexao?.feedbacks && Array.isArray(artigoReflexao.feedbacks) && artigoReflexao.feedbacks.length > 0

  const reflexoesAprovadas = videosAprovados && artigosAprovados
  const perguntasAprovadas = perguntasReflexivas?.situacao === "aprovado" || false
  const tudoAprovado = reflexoesAprovadas && perguntasAprovadas

  // Se já foi aprovado, redirecionar
  if (tudoAprovado) {
    redirect(`/dashboard/passo/${passoAtual + 1}`)
  }

  const nome = discipulo.profiles?.nome_completo || "Discípulo"

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="container max-w-4xl">
        <Card className="border-2 border-primary/20 shadow-xl">
          <CardContent className="py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mb-6 animate-pulse">
                <Clock className="w-12 h-12 text-white" />
              </div>

              <h1 className="text-4xl font-bold mb-4">Parabéns, {nome.split(" ")[0]}!</h1>

              <p className="text-xl text-muted-foreground mb-2">Você concluiu o Passo {passoAtual}</p>

              <Badge variant="outline" className="text-lg py-2 px-4">
                <Trophy className="w-5 h-5 mr-2" />
                {discipulo.nivel_atual}
              </Badge>
            </div>

            {/* Escada de Progresso */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex flex-col items-center">
                  {[...Array(passoAtual)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-20 h-12 rounded-lg mb-2 flex items-center justify-center font-bold text-white transition-all ${
                        i < passoAtual - 1
                          ? "bg-green-500"
                          : i === passoAtual - 1
                            ? "bg-primary animate-pulse"
                            : "bg-muted-foreground/20"
                      }`}
                      style={{
                        marginLeft: `${i * 24}px`,
                      }}
                    >
                      {passoAtual - i}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="font-semibold text-lg mb-1">Progresso da Jornada</p>
                <p className="text-muted-foreground">{passoAtual} de 10 passos concluídos</p>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4 mb-12">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/30">
                <Clock className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Aguardando Aprovação</h3>
                  <p className="text-muted-foreground mb-3">
                    Suas respostas e reflexões foram enviadas com sucesso! Seu discipulador está analisando seu trabalho
                    e em breve liberará o próximo passo.
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {reflexoesAprovadas ? (
                        <Badge variant="default" className="bg-green-600">
                          Reflexões Aprovadas
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Aguardando Reflexões
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {perguntasAprovadas ? (
                        <Badge variant="default" className="bg-green-600">
                          Perguntas Aprovadas
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Aguardando Perguntas
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/30">
                <Sparkles className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Continue Crescendo</h3>
                  <p className="text-muted-foreground">
                    Enquanto aguarda, você pode reler os conteúdos, conversar com seu discipulador ou explorar outros
                    recursos disponíveis.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <TrendingUp className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Seu Progresso</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">XP Total</p>
                      <p className="text-2xl font-bold text-primary">{discipulo.xp_total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nível Atual</p>
                      <p className="text-2xl font-bold text-primary">{discipulo.nivel_atual}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-3">
              <Link href="/dashboard/chat">
                <Button size="lg" className="w-full" variant="default">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conversar com Meu Discipulador
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button size="lg" className="w-full bg-transparent" variant="outline">
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
