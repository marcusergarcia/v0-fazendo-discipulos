"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] ❌❌❌ ERRO CAPTURADO NA PÁGINA DE LEITURA BÍBLICA ❌❌❌")
    console.error("[v0] 📛 Nome do erro:", error.name)
    console.error("[v0] 📛 Mensagem:", error.message)
    console.error("[v0] 📛 Stack trace:", error.stack)
    console.error("[v0] 📛 Digest:", error.digest)
    console.error("[v0] 📛 Erro completo:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <CardTitle className="text-2xl">Erro ao carregar a página</CardTitle>
          </div>
          <CardDescription>
            Algo deu errado ao carregar a leitura bíblica. Tente novamente ou volte ao dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-mono text-muted-foreground break-all">{error.message || "Erro desconhecido"}</p>
            {error.digest && <p className="text-xs text-muted-foreground mt-2">Digest: {error.digest}</p>}
          </div>

          <div className="text-xs text-muted-foreground p-3 bg-yellow-50 rounded border border-yellow-200">
            💡 Dica: Abra o console do navegador (F12) para ver detalhes técnicos do erro
          </div>

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Home className="w-4 h-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
