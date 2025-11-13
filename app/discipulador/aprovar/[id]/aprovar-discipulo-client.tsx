"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, User, Mail, Phone, Church, Calendar, MapPin, Clock } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface AprovarDiscipuloClientProps {
  discipulo: {
    id: string
    nome_completo: string
    email: string
    telefone: string | null
    igreja: string | null
    genero: string | null
    etnia: string | null
    data_nascimento: string | null
    foto_perfil_url: string | null
    localizacao_cadastro: string | null
    data_cadastro: string | null
    hora_cadastro: string | null
    semana_cadastro: string | null
    aceitou_lgpd: boolean
    aceitou_compromisso: boolean
    data_aceite_termos: string | null
  }
  discipuloData: {
    id: string
    user_id: string
    discipulador_id: string
  }
}

export default function AprovarDiscipuloClient({ discipulo, discipuloData }: AprovarDiscipuloClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAprovar = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          status: "ativo",
        })
        .eq("id", discipulo.id)

      if (profileError) throw profileError

      const { error: discipuloError } = await supabase
        .from("discipulos")
        .update({
          status: "ativo",
          aprovado_discipulador: true,
          data_aprovacao_discipulador: new Date().toISOString(),
        })
        .eq("user_id", discipulo.id)

      if (discipuloError) throw discipuloError

      const { data: progressoExistente } = await supabase
        .from("progresso_fases")
        .select("id")
        .eq("discipulo_id", discipuloData.id)
        .eq("passo_numero", 1)
        .single()

      if (!progressoExistente) {
        const { error: progressoError } = await supabase.from("progresso_fases").insert({
          discipulo_id: discipuloData.id,
          fase_numero: 1,
          passo_numero: 1,
          completado: false,
        })

        if (progressoError) throw progressoError
      }

      await supabase.from("notificacoes").insert({
        user_id: discipulo.id,
        tipo: "aprovacao_aceita",
        titulo: "Cadastro Aprovado!",
        mensagem: "Seu discipulador aprovou seu cadastro. Bem-vindo à jornada de fé!",
        link: "/dashboard",
        lida: false,
      })

      console.log("[v0] Discípulo aprovado com sucesso:", discipulo.id)
      router.push("/discipulador?aprovacao=sucesso")
      router.refresh()
    } catch (error) {
      console.error("Erro ao aprovar:", error)
      setError(error instanceof Error ? error.message : "Erro ao aprovar discípulo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejeitar = async () => {
    if (!confirm("Tem certeza que deseja rejeitar este cadastro? O usuário será excluído do sistema.")) return

    setIsLoading(true)
    setError(null)

    try {
      const { error: discipuloDeleteError } = await supabase.from("discipulos").delete().eq("user_id", discipulo.id)

      if (discipuloDeleteError) throw discipuloDeleteError

      const { error: profileDeleteError } = await supabase.from("profiles").delete().eq("id", discipulo.id)

      if (profileDeleteError) throw profileDeleteError

      console.log("[v0] Discípulo rejeitado e removido:", discipulo.id)
      router.push("/discipulador?rejeicao=sucesso")
      router.refresh()
    } catch (error) {
      console.error("Erro ao rejeitar:", error)
      setError(error instanceof Error ? error.message : "Erro ao rejeitar discípulo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-3xl text-white flex items-center gap-2">
              <User className="h-8 w-8 text-yellow-400" />
              Aprovar Novo Discípulo
            </CardTitle>
            <CardDescription className="text-blue-200">
              Revise as informações antes de aprovar o cadastro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto e Dados Básicos */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {discipulo.foto_perfil_url ? (
                <Image
                  src={discipulo.foto_perfil_url || "/placeholder.svg"}
                  alt={discipulo.nome_completo}
                  width={150}
                  height={150}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-16 w-16 text-white/50" />
                </div>
              )}

              <div className="flex-1 space-y-3 text-white">
                <h2 className="text-2xl font-bold">{discipulo.nome_completo}</h2>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-300" />
                    <span>{discipulo.email}</span>
                  </div>

                  {discipulo.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-300" />
                      <span>{discipulo.telefone}</span>
                    </div>
                  )}

                  {discipulo.igreja && (
                    <div className="flex items-center gap-2">
                      <Church className="w-4 h-4 text-blue-300" />
                      <span>{discipulo.igreja}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {discipulo.genero && <Badge variant="secondary">{discipulo.genero}</Badge>}
                  {discipulo.etnia && <Badge variant="secondary">{discipulo.etnia}</Badge>}
                  {discipulo.data_nascimento && (
                    <Badge variant="secondary">
                      {new Date().getFullYear() - new Date(discipulo.data_nascimento).getFullYear()} anos
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Informações de Cadastro */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4 space-y-2 text-white">
                  <h3 className="font-semibold text-lg mb-3">Informações de Cadastro</h3>

                  {discipulo.data_cadastro && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>Data: {discipulo.data_cadastro}</span>
                    </div>
                  )}

                  {discipulo.hora_cadastro && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span>Hora: {discipulo.hora_cadastro}</span>
                    </div>
                  )}

                  {discipulo.semana_cadastro && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>{discipulo.semana_cadastro}</span>
                    </div>
                  )}

                  {discipulo.localizacao_cadastro && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span>{discipulo.localizacao_cadastro}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4 space-y-2 text-white">
                  <h3 className="font-semibold text-lg mb-3">Termos Aceitos</h3>

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 ${discipulo.aceitou_compromisso ? "text-green-400" : "text-red-400"}`}
                    />
                    <span>Termo de Compromisso: {discipulo.aceitou_compromisso ? "Aceito" : "Não aceito"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 ${discipulo.aceitou_lgpd ? "text-green-400" : "text-red-400"}`} />
                    <span>LGPD: {discipulo.aceitou_lgpd ? "Aceito" : "Não aceito"}</span>
                  </div>

                  {discipulo.data_aceite_termos && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>Aceito em: {new Date(discipulo.data_aceite_termos).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {error && <div className="p-4 bg-red-500/20 border-2 border-red-500/30 rounded-lg text-white">{error}</div>}

            {/* Botões de Ação */}
            <div className="flex gap-4">
              <Button onClick={handleRejeitar} variant="destructive" className="flex-1" disabled={isLoading}>
                <XCircle className="w-5 h-5 mr-2" />
                Rejeitar Cadastro
              </Button>

              <Button onClick={handleAprovar} className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                {isLoading ? "Aprovando..." : "Aprovar Discípulo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
