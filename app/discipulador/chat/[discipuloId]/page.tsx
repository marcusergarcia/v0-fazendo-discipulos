import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, MessageCircle } from 'lucide-react'
import Link from "next/link"

export default async function ChatDiscipuladorPage({
  params,
}: {
  params: Promise<{ discipuloId: string }>
}) {
  const { discipuloId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Buscar informações do discípulo pelo user_id ao invés de id
  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*, profiles:user_id(*)")
    .eq("user_id", discipuloId)
    .eq("discipulador_id", user.id)
    .single()

  if (!discipulo) redirect("/discipulador")

  const { data: mensagens } = await supabase
    .from("mensagens")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .order("created_at", { ascending: true })

  const enviarMensagem = async (formData: FormData) => {
    "use server"
    const supabase = await createClient()
    const mensagem = formData.get("mensagem") as string

    if (!mensagem || mensagem.trim().length === 0) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("mensagens").insert({
      discipulo_id: discipuloId,
      remetente_id: user.id,
      mensagem: mensagem,
    })

    redirect(`/discipulador/chat/${discipuloId}`)
  }

  const nomeDiscipulo = 
    discipulo.profiles?.nome_completo || 
    discipulo.nome_completo_temp || 
    discipulo.profiles?.email || 
    discipulo.email_temporario

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/discipulador">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Chat com Discípulo</h1>
              <p className="text-sm text-muted-foreground">{nomeDiscipulo}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {mensagens && mensagens.length > 0 ? (
                mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.remetente_id === user.id ? "bg-primary/10 ml-8" : "bg-muted mr-8"
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">
                      {msg.remetente_id === user.id ? "Você" : nomeDiscipulo}
                    </p>
                    <p className="text-base">{msg.mensagem}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(msg.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma mensagem ainda. Inicie uma conversa!</p>
                </div>
              )}
            </div>

            <form action={enviarMensagem} className="space-y-3">
              <Textarea
                name="mensagem"
                placeholder="Digite sua mensagem..."
                className="min-h-24"
                required
              />
              <Button type="submit" size="lg" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
