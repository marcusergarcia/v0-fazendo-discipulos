import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Shield className="h-12 w-12 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Fazendo Discípulos</h1>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Mail className="h-16 w-16 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl text-white text-center">Verifique seu email</CardTitle>
              <CardDescription className="text-blue-200 text-center">Confirmação necessária</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-white/80 text-center">
                Enviamos um link de confirmação para o seu email. Por favor, verifique sua caixa de entrada e clique no
                link para ativar sua conta.
              </p>
              <p className="text-xs text-white/60 text-center">
                Não recebeu? Verifique a pasta de spam ou entre em contato com o suporte.
              </p>
              <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950">
                <Link href="/auth/login">Voltar para Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
