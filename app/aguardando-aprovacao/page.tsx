import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, Mail } from "lucide-react"
import Image from "next/image"

export default async function AguardandoAprovacaoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar status de aprovação
  const { data: discipulo } = await supabase
    .from("discipulos")
    .select("*, discipulador:discipulador_id(nome_completo)")
    .eq("user_id", user.id)
    .single()

  // Se já foi aprovado, redirecionar para dashboard
  if (discipulo?.aprovado_discipulador) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("nome_completo").eq("id", user.id).single()

  const discipuladorNome = (discipulo?.discipulador as any)?.nome_completo || "seu discipulador"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <Image
                src="/logo-fazendo-discipulos.png"
                alt="Fazendo Discípulos"
                width={200}
                height={75}
                className="object-contain"
              />
            </div>
          </div>
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Aguardando Aprovação</CardTitle>
          <CardDescription className="text-base">
            Olá, {profile?.nome_completo}! Seu cadastro foi realizado com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="bg-muted p-6 rounded-lg space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="w-5 h-5" />
              <p className="font-medium">Notificação Enviada</p>
            </div>
            <p className="text-sm">
              <strong>{discipuladorNome}</strong> recebeu uma notificação sobre seu cadastro e em breve irá aprovar seu
              acesso ao sistema.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Cadastro Completo</p>
                <p className="text-sm text-muted-foreground">Todas as suas informações foram registradas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium">Aguardando Aprovação</p>
                <p className="text-sm text-muted-foreground">
                  Seu discipulador precisa aprovar seu acesso antes de começar
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Você receberá um email assim que seu acesso for aprovado. Fique atento!
            </p>
            <form
              action={async () => {
                "use server"
                const supabase = await createClient()
                await supabase.auth.signOut()
                redirect("/auth/login")
              }}
            >
              <Button variant="outline" className="w-full bg-transparent" type="submit">
                Sair
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
