"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Award, Users, Book } from "lucide-react"

interface PrimeiroAcessoProps {
  onContinuar: () => void
}

export function PrimeiroAcesso({ onContinuar }: PrimeiroAcessoProps) {
  const [etapa, setEtapa] = useState(0)

  const etapas = [
    {
      titulo: "Bem-vindo, Discipulador Master!",
      icone: <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />,
      conteudo: (
        <>
          <p className="text-gray-600 mb-4">
            Você é o primeiro usuário do sistema <strong>Fazendo Discípulos</strong>.
          </p>
          <p className="text-gray-600 mb-4">
            Como discipulador master, você tem a responsabilidade de iniciar a cadeia de discipulado, convidando e
            formando novos discípulos que, por sua vez, formarão outros.
          </p>
        </>
      ),
    },
    {
      titulo: "Suas Responsabilidades",
      icone: <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />,
      conteudo: (
        <ul className="text-left space-y-3 text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Convidar novos discípulos através do sistema de convites</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Acompanhar o progresso de cada discípulo nos passos</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Validar missões e reflexões enviadas</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Manter comunicação regular via chat</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Alertar sobre atrasos (passos acima de 7 dias)</span>
          </li>
        </ul>
      ),
    },
    {
      titulo: "Como Funciona o Convite",
      icone: <Book className="w-16 h-16 text-purple-500 mx-auto mb-4" />,
      conteudo: (
        <div className="text-left space-y-3 text-gray-600">
          <p>
            <strong>1.</strong> Clique no botão "Convidar" no menu principal
          </p>
          <p>
            <strong>2.</strong> Gere um link de convite único
          </p>
          <p>
            <strong>3.</strong> Compartilhe o link com a pessoa que deseja discipular
          </p>
          <p>
            <strong>4.</strong> O convidado verá o sistema, lerá os termos e se cadastrará
          </p>
          <p>
            <strong>5.</strong> Você receberá uma notificação para aprovar o cadastro
          </p>
          <p>
            <strong>6.</strong> Após aprovação, inicia-se a jornada de discipulado!
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="text-center">
            {etapas[etapa].icone}
            <CardTitle className="text-2xl mb-2">{etapas[etapa].titulo}</CardTitle>
            <CardDescription>
              Etapa {etapa + 1} de {etapas.length}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">{etapas[etapa].conteudo}</div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {etapas.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === etapa ? "bg-blue-600" : "bg-gray-300"}`}
                />
              ))}
            </div>

            {etapa < etapas.length - 1 ? (
              <Button onClick={() => setEtapa(etapa + 1)}>Próximo</Button>
            ) : (
              <Button onClick={onContinuar}>Começar a Discipular</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
