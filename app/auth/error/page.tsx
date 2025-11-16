import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string }
}) {
  const error = searchParams.error || searchParams.message || "Ocorreu um erro desconhecido"

  const getErrorMessage = (errorCode: string) => {
    const errorMessages: Record<string, { title: string; description: string }> = {
      access_denied: {
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar este recurso.",
      },
      server_error: {
        title: "Erro no Servidor",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
      },
      "Email link is invalid or has expired": {
        title: "Link Expirado",
        description: "Este link de confirmação de email expirou. Solicite um novo link de verificação.",
      },
      default: {
        title: "Erro de Autenticação",
        description: error,
      },
    }

    return errorMessages[errorCode] || errorMessages.default
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
          <CardDescription className="text-base mt-2">{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">Voltar para Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/sign-up">Criar Nova Conta</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
