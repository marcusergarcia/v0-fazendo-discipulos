"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Camera, Upload, Save, Trophy, Shield, Award } from 'lucide-react'
import Link from "next/link"
import { atualizarPerfil, uploadFotoPerfil } from "./actions"
import { AvatarArmadura } from "@/components/avatar-armadura"
import { generateAvatarUrl } from "@/lib/generate-avatar"

interface PerfilClientProps {
  profile: any
  discipulo: any
  userId: string
  userEmail: string
  nomeDiscipulador: string | null
  discipuloId: string | null
  discipuladorId: string | null
}

export function PerfilClient({ profile, discipulo, userId, userEmail, nomeDiscipulador, discipuloId, discipuladorId }: PerfilClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.foto_perfil_url || null)

  const initialNome = profile?.nome_completo || ""
  const initialTelefone = profile?.telefone || ""
  const initialIgreja = profile?.igreja || ""
  const initialBio = profile?.bio || ""
  const initialGenero = profile?.genero || ""
  const initialDataNascimento = profile?.data_nascimento || ""
  const initialEtnia = profile?.etnia || ""

  const nivelNome = discipulo?.nivel_atual || "Explorador"
  const xpTotal = discipulo?.xp_total || 0

  const nivelNumero = getLevelNumber(nivelNome)

  const getInitials = () => {
    if (initialNome) {
      return initialNome
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return userEmail.slice(0, 2).toUpperCase()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo e tamanho
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione uma imagem válida")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB")
      return
    }

    setIsUploadingPhoto(true)

    try {
      // Preview local
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload para Supabase Storage
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadFotoPerfil(formData)

      if (result.success && result.url) {
        setPreviewUrl(result.url)
        router.refresh()
      } else {
        alert(result.error || "Erro ao fazer upload da foto")
        setPreviewUrl(profile?.foto_perfil_url || null)
      }
    } catch (error) {
      console.error("Erro ao processar foto:", error)
      alert("Erro ao processar foto")
      setPreviewUrl(profile?.foto_perfil_url || null)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await atualizarPerfil(formData)

      if (result.success) {
        alert("Perfil atualizado com sucesso!")
        router.refresh()
      } else {
        alert(result.error || "Erro ao atualizar perfil")
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      alert("Erro ao atualizar perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  const calcularIdade = () => {
    if (!profile?.data_nascimento) return null
    const hoje = new Date()
    const nascimento = new Date(profile.data_nascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const mes = hoje.getMonth() - nascimento.getMonth()
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return idade
  }

  const idade = calcularIdade()

  const displayAvatarUrl = previewUrl || generateAvatarUrl({
    genero: profile?.genero,
    idade: idade || undefined,
    etnia: profile?.etnia
  })

  console.log("[v0] Avatar Debug:", {
    previewUrl,
    genero: profile?.genero,
    idade,
    etnia: profile?.etnia,
    displayAvatarUrl
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>Clique na foto para alterar</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar
                  className="w-32 h-32 cursor-pointer"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  {displayAvatarUrl && <AvatarImage src={displayAvatarUrl || "/placeholder.svg"} alt="Foto de perfil" />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploadingPhoto}
                />
              </div>

              {isUploadingPhoto && <p className="text-sm text-muted-foreground animate-pulse">Fazendo upload...</p>}

              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fileInput")?.click()}
                disabled={isUploadingPhoto}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingPhoto ? "Enviando..." : "Alterar Foto"}
              </Button>

              <div className="pt-4 w-full border-t">
                <h3 className="text-sm font-semibold text-center mb-3 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Seu Avatar
                </h3>
                <div className="flex justify-center">
                  <AvatarArmadura
                    nivel={nivelNumero}
                    size="md"
                    showLabels={false}
                    genero={profile?.genero}
                    idade={idade}
                    etnia={profile?.etnia}
                  />
                </div>
              </div>

              <div className="pt-4 w-full space-y-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nível</span>
                  <Badge>
                    <Trophy className="w-3 h-3 mr-1" />
                    {nivelNome}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">XP Total</span>
                  <span className="font-semibold">{xpTotal}</span>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">IDs do Sistema</h4>
                  <div className="space-y-1">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">ID do Discípulo</span>
                      <code className="text-[10px] bg-muted p-1 rounded break-all">{discipuloId || 'N/A'}</code>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">ID do Discipulador</span>
                      <code className="text-[10px] bg-muted p-1 rounded break-all">{discipuladorId || 'N/A'}</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discipulador">Seu Discipulador</Label>
                  <Input
                    id="discipulador"
                    type="text"
                    value={
                      nomeDiscipulador
                        ? nomeDiscipulador
                            .split(" ")
                            .map((n: string) => n[0].toUpperCase() + n.slice(1))
                            .join(" ")
                        : "Não encontrado"
                    }
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Seu discipulador é responsável por acompanhar sua jornada
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input id="nome_completo" name="nome_completo" defaultValue={initialNome} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genero">Gênero</Label>
                    <select
                      id="genero"
                      name="genero"
                      defaultValue={initialGenero}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Selecione...</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      name="data_nascimento"
                      type="date"
                      defaultValue={initialDataNascimento}
                      max={new Date().toISOString().split("T")[0]}
                    />
                    {idade && <p className="text-xs text-muted-foreground">{idade} anos</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etnia">Etnia</Label>
                  <select
                    id="etnia"
                    name="etnia"
                    defaultValue={initialEtnia}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione...</option>
                    <option value="branca">Branca</option>
                    <option value="parda">Parda</option>
                    <option value="negra">Negra</option>
                    <option value="indigena">Indígena</option>
                    <option value="asiatica">Asiática</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Usado para personalizar seu avatar 3D</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    defaultValue={initialTelefone}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="igreja">Igreja</Label>
                  <Input id="igreja" name="igreja" placeholder="Nome da sua igreja" defaultValue={initialIgreja} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Conte um pouco sobre você e sua jornada de fé..."
                    rows={4}
                    defaultValue={initialBio}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Armadura de Deus
            </CardTitle>
            <CardDescription>A armadura cresce conforme você avança nos níveis (Efésios 6:10-18)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              <AvatarArmadura
                nivel={nivelNumero}
                size="lg"
                showLabels={false}
                genero={profile?.genero}
                idade={idade}
                etnia={profile?.etnia}
              />

              <div className="space-y-3 w-full max-w-sm">
                <h3 className="font-semibold text-lg mb-4">Peças Conquistadas</h3>

                <div className="space-y-2">
                  <ArmorPiece
                    name="Capacete da Salvação"
                    unlocked={nivelNumero >= 2}
                    level={2}
                    description="Desbloqueado no Nível 2: Discípulo"
                  />
                  <ArmorPiece
                    name="Couraça da Justiça"
                    unlocked={nivelNumero >= 3}
                    level={3}
                    description="Desbloqueado no Nível 3: Guerreiro"
                  />
                  <ArmorPiece
                    name="Escudo da Fé"
                    unlocked={nivelNumero >= 4}
                    level={4}
                    description="Desbloqueado no Nível 4: Servo Mestre"
                  />
                  <ArmorPiece
                    name="Espada do Espírito"
                    unlocked={nivelNumero >= 5}
                    level={5}
                    description="Desbloqueado no Nível 5: Multiplicador"
                  />
                </div>

                {nivelNumero < 5 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Continue sua jornada para desbloquear todas as peças da armadura!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getLevelNumber(levelName: string): number {
  const levels: Record<string, number> = {
    Explorador: 1,
    Discípulo: 2,
    Guerreiro: 3,
    "Servo Mestre": 4,
    Multiplicador: 5,
  }
  return levels[levelName] || 1
}

function ArmorPiece({
  name,
  unlocked,
  level,
  description,
}: {
  name: string
  unlocked: boolean
  level: number
  description: string
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${unlocked ? "bg-accent/10 border-accent" : "bg-muted border-muted-foreground/20"}`}
    >
      <div className="flex items-center gap-3">
        {unlocked ? (
          <Award className="w-5 h-5 text-accent flex-shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-medium text-sm ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
