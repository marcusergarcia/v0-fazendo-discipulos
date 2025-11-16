import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, Mail } from 'lucide-react'
import Link from "next/link"

export default function SolicitacaoEnviadaPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Shield className="h-12 w-12 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Solicitação Enviada!</h1>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white text-center">Tudo Certo!</CardTitle>
              <CardDescription className="text-blue-200 text-center text-base">
                Sua solicitação foi enviada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <Mail className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Aguarde a Aprovação</h3>
                    <p className="text-sm text-blue-200">
                      O discipulador escolhido foi notificado e em breve analisará sua solicitação.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Próximos Passos</h3>
                    <p className="text-sm text-blue-200">
                      Assim que sua solicitação for aprovada, você receberá um convite por email para completar seu
                      cadastro e iniciar a jornada.
                    </p>
                  </div>
                </div>
              </div>

              <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950">
                <Link href="/">Voltar para Início</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
