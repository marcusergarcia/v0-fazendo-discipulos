import { criar12Apostolos } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Criar12ApostolosPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Criar Discipulador de Referência</CardTitle>
          <CardDescription>
            Cria o usuário simbólico "12 Apóstolos" com nível máximo e associa Marcus a ele
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={criar12Apostolos}>
            <Button type="submit" size="lg" className="w-full">
              Criar 12 Apóstolos
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
