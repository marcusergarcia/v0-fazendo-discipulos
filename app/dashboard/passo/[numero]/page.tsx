import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, CheckCircle2, Sparkles, Award, Target } from "lucide-react"
import Link from "next/link"

const PASSOS_CONTEUDO = {
  1: {
    titulo: "Deus nos Criou",
    fase: "FASE 1: O Evangelho",
    conteudo: "Deus é Criador, soberano e pessoal",
    versiculos: [
      { texto: "No princípio, criou Deus os céus e a terra.", referencia: "Gênesis 1:1" },
      {
        texto: "Também disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança.",
        referencia: "Gênesis 1:26-27",
      },
    ],
    perguntaChave: "Qual o propósito da criação do ser humano?",
    missao: 'Escreva em uma frase: "Por que eu existo?"',
    recompensa: "Insígnia Identidade dada por Deus",
    reflexao:
      "Você foi criado(a) à imagem e semelhança de Deus. Isso significa que você tem valor imensurável, propósito eterno e foi feito(a) para se relacionar com o Criador. Antes de tudo existir, Deus já pensava em você.",
    xp: 100,
  },
}

export default async function PassoPage({ params }: { params: { numero: string } }) {
  const numeroParam = await Promise.resolve(params.numero)
  const numero = Number.parseInt(numeroParam)
  const supabase = await createClient()

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Buscar dados do discípulo
  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) redirect("/dashboard")

  // Buscar progresso deste passo
  const { data: progresso } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .single()

  const passo = PASSOS_CONTEUDO[numero as keyof typeof PASSOS_CONTEUDO]
  if (!passo) redirect("/dashboard")

  // Buscar total de passos completados
  const { data: todosPassos } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)

  const passosCompletados = todosPassos?.filter((p) => p.completado).length || 0

  const handleCompletar = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const resposta = formData.get("resposta") as string

    if (!resposta || resposta.trim().length < 10) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

    if (!discipulo) return

    // Atualizar progresso
    await supabase
      .from("progresso_fases")
      .update({
        completado: true,
        resposta_pergunta: resposta,
        data_completado: new Date().toISOString(),
      })
      .eq("discipulo_id", discipulo.id)
      .eq("fase_numero", 1)
      .eq("passo_numero", numero)

    // Adicionar XP
    const novoXP = discipulo.xp_total + passo.xp
    await supabase
      .from("discipulos")
      .update({
        xp_total: novoXP,
        passo_atual: numero + 1,
      })
      .eq("id", discipulo.id)

    // Criar recompensa
    await supabase.from("recompensas").insert({
      discipulo_id: discipulo.id,
      tipo_recompensa: "insignia",
      nome_recompensa: passo.recompensa,
      descricao: `Completou o passo ${numero}: ${passo.titulo}`,
    })

    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{passo.fase}</h1>
              <p className="text-sm text-muted-foreground">
                Passo {numero} de 10 • {passosCompletados} completados
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Target className="w-3 h-3 mr-1" />+{passo.xp} XP
            </Badge>
          </div>
          <Progress value={(passosCompletados / 10) * 100} className="h-1 mt-3" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {progresso?.completado && (
          <Card className="mb-6 border-accent bg-accent/5">
            <CardContent className="py-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <p className="font-medium">Você já completou este passo! Revise o conteúdo quando quiser.</p>
            </CardContent>
          </Card>
        )}

        {/* Título do Passo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-2">{passo.titulo}</h2>
          <p className="text-xl text-muted-foreground">{passo.conteudo}</p>
        </div>

        {/* Versículos */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Palavra de Deus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {passo.versiculos.map((v, i) => (
              <div key={i} className="space-y-2">
                <p className="text-lg italic leading-relaxed">"{v.texto}"</p>
                <p className="text-sm font-semibold text-primary">— {v.referencia}</p>
                {i < passo.versiculos.length - 1 && <div className="border-t pt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reflexão */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reflexão</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{passo.reflexao}</p>
          </CardContent>
        </Card>

        {/* Pergunta Chave */}
        <Card className="mb-6 border-secondary">
          <CardHeader>
            <CardTitle className="text-secondary">Pergunta Chave</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{passo.perguntaChave}</p>
          </CardContent>
        </Card>

        {/* Missão */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Sua Missão
            </CardTitle>
            <CardDescription>{passo.missao}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCompletar} className="space-y-4">
              <Textarea
                name="resposta"
                placeholder="Escreva sua resposta aqui... Seja honesto(a) e reflexivo(a)."
                className="min-h-32 text-base"
                defaultValue={progresso?.resposta_pergunta || ""}
                disabled={progresso?.completado}
                required
              />

              {!progresso?.completado && (
                <Button type="submit" size="lg" className="w-full">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Completar Passo
                </Button>
              )}

              {progresso?.completado && (
                <div className="bg-accent/10 border border-accent rounded-lg p-4 flex items-start gap-3">
                  <Award className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-semibold text-accent mb-1">Recompensa Conquistada!</p>
                    <p className="text-sm text-muted-foreground">{passo.recompensa}</p>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between mt-8">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          {numero < 10 && progresso?.completado && (
            <Link href={`/dashboard/passo/${numero + 1}`}>
              <Button>
                Próximo Passo
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
