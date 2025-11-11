import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Shield className="h-20 w-20 text-primary" />
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Página não encontrada</h1>
        <p className="mt-2 text-muted-foreground">
          O passo que você está procurando não existe ou ainda não está disponível.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/dashboard">Voltar ao Dashboard</Link>
      </Button>
    </div>
  )
}
