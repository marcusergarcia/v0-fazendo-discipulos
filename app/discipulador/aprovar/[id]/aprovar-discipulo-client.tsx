"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, User, Mail, Phone, Church, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react'
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { aprovarDiscipulo, rejeitarDiscipulo } from "./actions"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AprovarDiscipuloClientProps {
  discipulo: {
    id: string
    discipulador_id: string
    email_temporario: string
    nome_completo_temp: string
    telefone_temp: string | null
    igreja_temp: string | null
    genero_temp: string | null
    etnia_temp: string | null
    data_nascimento_temp: string | null
    foto_perfil_url_temp: string | null
    localizacao_cadastro: string | null
    data_cadastro: string | null
    hora_cadastro: string | null
    semana_cadastro: string | null
    aceitou_lgpd: boolean
    aceitou_compromisso: boolean
    data_aceite_termos: string | null
  }
}

export default function AprovarDiscipuloClient({ discipulo }: AprovarDiscipuloClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [motivoRejeicao, setMotivoRejeicao] = useState("")

  const handleAprovar = async () => {
    if (!confirm("Tem certeza que deseja aprovar este discípulo? Ele receberá acesso ao sistema.")) return

    setIsLoading(true)
    setError(null)

    try {
      const resultado = await aprovarDiscipulo(discipulo.id)

      if (!resultado.success) {
        throw new Error(resultado.error)
      }

      router.push("/discipulador/aprovar?aprovacao=sucesso")
      router.refresh()
    } catch (error) {
      console.error("Erro ao aprovar:", error)
      setError(error instanceof Error ? error.message : "Erro ao aprovar discípulo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejeitar = async () => {
    if (!confirm("Tem certeza que deseja rejeitar este cadastro? Os dados serão excluídos permanentemente.")) return

    setIsLoading(true)
    setError(null)

    try {
      const resultado = await rejeitarDiscipulo(discipulo.id, motivoRejeicao)

      if (!resultado.success) {
        throw new Error(resultado.error)
      }

      router.push("/discipulador/aprovar?rejeicao=sucesso")
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
            {/* Alerta importante */}
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-white text-sm">
                <p className="font-semibold mb-1">Importante:</p>
                <p>
                  Ao aprovar, o usuário será criado no sistema e receberá um email de confirmação. Ele poderá fazer
                  login imediatamente e começar sua jornada de discipulado.
                </p>
              </div>
            </div>

            {/* Foto e Dados Básicos */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {discipulo.foto_perfil_url_temp ? (
                <Image
                  src={discipulo.foto_perfil_url_temp || "/placeholder.svg"}
                  alt={discipulo.nome_completo_temp || ""}
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
                <h2 className="text-2xl font-bold">{discipulo.nome_completo_temp}</h2>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-300" />
                    <span>{discipulo.email_temporario}</span>
                  </div>

                  {discipulo.telefone_temp && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-300" />
                      <span>{discipulo.telefone_temp}</span>
                    </div>
                  )}

                  {discipulo.igreja_temp && (
                    <div className="flex items-center gap-2">
                      <Church className="w-4 h-4 text-blue-300" />
                      <span>{discipulo.igreja_temp}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {discipulo.genero_temp && <Badge variant="secondary">{discipulo.genero_temp}</Badge>}
                  {discipulo.etnia_temp && <Badge variant="secondary">{discipulo.etnia_temp}</Badge>}
                  {discipulo.data_nascimento_temp && (
                    <Badge variant="secondary">
                      {new Date().getFullYear() - new Date(discipulo.data_nascimento_temp).getFullYear()} anos
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

            {/* Formulário de Rejeição */}
            {showRejectForm && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="p-4 space-y-3">
                  <Label htmlFor="motivo" className="text-white">
                    Motivo da Rejeição (opcional)
                  </Label>
                  <Textarea
                    id="motivo"
                    placeholder="Explique o motivo da rejeição..."
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowRejectForm(false)}
                      variant="outline"
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleRejeitar} variant="destructive" className="flex-1" disabled={isLoading}>
                      Confirmar Rejeição
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões de Ação */}
            {!showRejectForm && (
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowRejectForm(true)}
                  variant="outline"
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                  disabled={isLoading}
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Rejeitar Cadastro
                </Button>

                <Button onClick={handleAprovar} className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {isLoading ? "Aprovando..." : "Aprovar Discípulo"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
