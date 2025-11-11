"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error_description") || "Houve um problema ao fazer login"
  const errorCode = searchParams.get("error_code")

  let errorMessage = error
  let errorTitle = "Erro de Autenticação"

  if (errorCode === "otp_expired") {
    errorTitle = "Link Expirado"
    errorMessage =
      "O link de confirmação expirou. Por favor, solicite um novo email de confirmação ou faça login novamente."
  } else if (errorCode === "access_denied") {
    errorTitle = "Acesso Negado"
    errorMessage = "Não foi possível confirmar seu email. Tente fazer login ou solicite um novo link de confirmação."
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Shield className="h-12 w-12 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Fazendo Discípulos</h1>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <CardTitle className="text-2xl text-white">{errorTitle}</CardTitle>
              </div>
              <CardDescription className="text-blue-200">{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950">
                  <Link href="/auth/login">Voltar para Login</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <Link href="/auth/sign-up">Criar Nova Conta</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
