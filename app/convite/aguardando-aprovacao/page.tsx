import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AguardandoAprovacaoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 flex items-center justify-center p-6">
      <Card className="max-w-2xl bg-white/10 backdrop-blur border-white/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo-fazendo-discipulos.png" alt="Fazendo Discípulos" width={200} height={75} />
          </div>
          <CardTitle className="text-3xl text-white flex items-center justify-center gap-2">
            <Clock className="h-8 w-8 text-yellow-400" />
            Aguardando Aprovação
          </CardTitle>
          <CardDescription className="text-blue-200 text-lg">Seu cadastro foi concluído com sucesso!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-white">
          <div className="bg-white/5 p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Cadastro Completo</h3>
                <p className="text-blue-100">
                  Você completou todas as etapas do cadastro e aceitou os termos necessários.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Notificação Enviada</h3>
                <p className="text-blue-100">
                  Seu discipulador recebeu uma notificação e em breve analisará seu cadastro.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Próximos Passos</h3>
                <p className="text-blue-100">
                  Assim que seu discipulador aprovar seu cadastro, você receberá um e-mail de confirmação e poderá
                  acessar sua conta para começar a jornada de fé.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 p-4 rounded-lg border-2 border-yellow-500/30">
            <p className="text-sm text-center">
              <strong className="text-yellow-400">Importante:</strong> Verifique sua caixa de entrada e spam para não
              perder a confirmação!
            </p>
          </div>

          <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30" variant="outline">
            <Link href="/">Voltar para Início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
