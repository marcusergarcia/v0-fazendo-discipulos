"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, LinkIcon, Mail, Check, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Convite {
  id: string
  codigo_convite: string
  email_convidado: string | null
  usado: boolean
  data_criacao: string
  data_uso: string | null
  expira_em: string
}

export default function ConvitesClient({
  convites: initialConvites,
  userId,
}: {
  convites: Convite[]
  userId: string
}) {
  const [convites, setConvites] = useState(initialConvites)
  const [email, setEmail] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  const criarConvite = async () => {
    setIsCreating(true)
    try {
      console.log("[v0] Iniciando criação de convite para userId:", userId)

      // Gerar código único
      const codigo = Math.random().toString(36).substring(2, 10).toUpperCase()
      console.log("[v0] Código gerado:", codigo)

      const { data, error } = await supabase
        .from("convites")
        .insert({
          discipulador_id: userId,
          codigo_convite: codigo,
          email_convidado: email || null,
          usado: false,
          expira_em: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        })
        .select()
        .single()

      console.log("[v0] Resultado do insert:", { data, error })

      if (error) {
        console.error("[v0] Erro detalhado ao criar convite:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw error
      }

      console.log("[v0] Convite criado com sucesso:", data)
      setConvites([data, ...convites])
      setEmail("")
      alert("Convite criado com sucesso!")
    } catch (error) {
      console.error("[v0] Erro ao criar convite:", error)
      alert(`Erro ao criar convite: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setIsCreating(false)
    }
  }

  const copiarLink = (codigo: string) => {
    const link = `${window.location.origin}/convite/${codigo}`
    navigator.clipboard.writeText(link)
    setCopiedId(codigo)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gerenciar Convites</h1>
          <p className="text-slate-600">Convide novos discípulos para sua jornada</p>
        </div>

        {/* Criar Novo Convite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Convite
            </CardTitle>
            <CardDescription>Gere um link de convite para compartilhar com novos discípulos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="email">Email do Convidado (Opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={criarConvite} disabled={isCreating} className="mt-6">
                {isCreating ? "Criando..." : "Criar Convite"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Convites */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Convites Criados</h2>
          {convites.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                Nenhum convite criado ainda. Crie seu primeiro convite acima!
              </CardContent>
            </Card>
          ) : (
            convites.map((convite) => (
              <Card key={convite.id} className={convite.usado ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-slate-500" />
                        <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                          {convite.codigo_convite}
                        </code>
                        {convite.usado && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Usado</span>
                        )}
                      </div>
                      {convite.email_convidado && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3 w-3" />
                          {convite.email_convidado}
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        Criado em {new Date(convite.data_criacao).toLocaleDateString("pt-BR")}
                        {convite.usado &&
                          convite.data_uso &&
                          ` • Usado em ${new Date(convite.data_uso).toLocaleDateString("pt-BR")}`}
                      </p>
                    </div>
                    {!convite.usado && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copiarLink(convite.codigo_convite)}
                        className="gap-2"
                      >
                        {copiedId === convite.codigo_convite ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copiar Link
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
