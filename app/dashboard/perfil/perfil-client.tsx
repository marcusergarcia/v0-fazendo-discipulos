"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarArmadura } from "@/components/avatar-armadura"
import { Upload, ArrowLeft, Shield } from "lucide-react"
import { atualizarFotoPerfil } from "./actions"

interface PecaArmadura {
  id: string
  nome: string
  desbloqueada: boolean
}

interface PerfilClientProps {
  user: any
  profile: any
  discipulo: any
  pecasArmadura: PecaArmadura[]
}

export function PerfilClient({ user, profile, discipulo, pecasArmadura }: PerfilClientProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await atualizarFotoPerfil(file)
      router.refresh()
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      alert("Erro ao fazer upload da foto")
    } finally {
      setUploading(false)
    }
  }

  const xpProximoNivel = discipulo?.level ? discipulo.level * 1000 : 1000
  const pecasDesbloqueadas = pecasArmadura.filter((p) => p.desbloqueada).length

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerenciar informações e ver progresso na armadura</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Card do Avatar com Armadura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Guerreiro de Deus
            </CardTitle>
            <CardDescription>{discipulo?.level_name || "Explorador"}</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarArmadura
              fotoUrl={profile?.avatar_url}
              nome={profile?.name || user?.email || "Usuário"}
              xp={discipulo?.xp || 0}
              xpProximoNivel={xpProximoNivel}
              nivel={discipulo?.level || 1}
              pecasArmadura={pecasArmadura}
              tamanho="lg"
            />

            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Armadura de Deus
              </h3>
              <p className="text-sm text-muted-foreground mb-2">Efésios 6:10-18</p>
              <div className="text-2xl font-bold text-primary">{pecasDesbloqueadas}/6 peças</div>
              <p className="text-xs text-muted-foreground mt-1">Complete a Fase 2 para desbloquear todas as peças</p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize sua foto e informações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ""} disabled className="bg-secondary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" type="text" value={profile?.name || ""} placeholder="Seu nome completo" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">Foto de Perfil</Label>
              <div className="flex gap-2">
                <Input
                  id="foto"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFoto}
                  disabled={uploading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <p className="text-xs text-muted-foreground">Escolha uma foto do seu rosto (JPG, PNG - máx 2MB)</p>
            </div>

            {uploading && <div className="text-sm text-primary animate-pulse">Fazendo upload...</div>}

            <Button className="w-full" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Atualizar Informações
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Card de Progresso da Armadura */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso na Armadura de Deus</CardTitle>
          <CardDescription>Desbloqueie cada peça completando os passos da Fase 2</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pecasArmadura.map((peca) => (
              <div
                key={peca.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  peca.desbloqueada
                    ? "bg-green-500/10 border-green-500 shadow-lg"
                    : "bg-gray-100 border-gray-300 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      peca.desbloqueada ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{peca.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {peca.desbloqueada ? "Conquistado!" : "Bloqueado"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
