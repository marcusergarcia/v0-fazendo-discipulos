"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Users, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { solicitarConvite } from "./actions"

interface Discipulador {
  id: string
  nome_completo: string
  discipulos: { count: number }[]
}

interface SolicitarConviteClientProps {
  discipuladores: Discipulador[]
  emailInicial?: string
}

export default function SolicitarConviteClient({ discipuladores, emailInicial }: SolicitarConviteClientProps) {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState(emailInicial || "")
  const [telefone, setTelefone] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [discipuladorSelecionado, setDiscipuladorSelecionado] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!discipuladorSelecionado) {
      setError("Por favor, selecione um discipulador")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await solicitarConvite({
        nome,
        email,
        telefone,
        mensagem,
        discipuladorId: discipuladorSelecionado,
      })

      if (result.success) {
        router.push("/auth/solicitacao-enviada")
      } else {
        setError(result.error || "Erro ao enviar solicitação")
      }
    } catch (error) {
      setError("Erro ao enviar solicitação")
      console.error("[v0] Erro:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Shield className="h-12 w-12 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Bem-vindo!</h1>
            <p className="text-lg text-blue-200 max-w-xl">
              Para iniciar sua jornada no Fazendo Discípulos, você precisa de um convite de um discipulador.
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Solicitar Convite</CardTitle>
              <CardDescription className="text-blue-200">
                Escolha um discipulador conhecido e envie uma solicitação de convite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome" className="text-white">
                      Nome Completo
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefone" className="text-white">
                      Telefone (opcional)
                    </Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="mensagem" className="text-white">
                      Mensagem (opcional)
                    </Label>
                    <Textarea
                      id="mensagem"
                      placeholder="Conte um pouco sobre você ou como conheceu o discipulador..."
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-white text-lg">Escolha um Discipulador</Label>
                  <p className="text-sm text-blue-200">
                    Selecione alguém que você conhece para ser seu discipulador
                  </p>
                  <div className="grid gap-3 max-h-[300px] overflow-y-auto">
                    {discipuladores.map((discipulador) => (
                      <button
                        key={discipulador.id}
                        type="button"
                        onClick={() => setDiscipuladorSelecionado(discipulador.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          discipuladorSelecionado === discipulador.id
                            ? "border-yellow-400 bg-yellow-400/20"
                            : "border-white/30 bg-white/10 hover:border-white/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                discipuladorSelecionado === discipulador.id
                                  ? "bg-yellow-400 text-blue-950"
                                  : "bg-white/20 text-white"
                              }`}
                            >
                              {discipulador.nome_completo.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{discipulador.nome_completo}</p>
                              <p className="text-sm text-blue-200 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {discipulador.discipulos?.[0]?.count || 0} discípulos
                              </p>
                            </div>
                          </div>
                          {discipuladorSelecionado === discipulador.id && (
                            <Check className="w-6 h-6 text-yellow-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-300 bg-red-500/20 p-3 rounded">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 text-lg py-6"
                  disabled={isLoading || !discipuladorSelecionado}
                >
                  {isLoading ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
