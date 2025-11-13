import { criarDiscipuladorReferencia } from "./actions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CriarDiscipuladorReferenciaPage() {
  async function handleCriar() {
    "use server"
    const result = await criarDiscipuladorReferencia()

    if (result.success) {
      redirect("/dashboard/perfil?msg=discipulador_criado")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Criar Discipulador de Referência</CardTitle>
          <CardDescription>
            Crie o discipulador simbólico "12 Apóstolos" que representa a base apostólica do ministério
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Este discipulador terá:</p>
            <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground">
              <li>Nome: 12 Apóstolos</li>
              <li>Nível: Multiplicador (máximo)</li>
              <li>XP: 10.000 pontos</li>
              <li>Status: Ativo</li>
            </ul>
          </div>

          <form action={handleCriar}>
            <Button type="submit" className="w-full">
              Criar Discipulador "12 Apóstolos"
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
