"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, UserPlus, Upload, MapPin, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ConviteClientProps {
  convite: {
    id: string
    codigo_convite: string
    discipulador: {
      nome_completo: string
      email: string
    }
  }
}

export default function CadastroConviteClient({ convite }: ConviteClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [telefone, setTelefone] = useState("")
  const [igreja, setIgreja] = useState("")
  const [genero, setGenero] = useState<string>("")
  const [etnia, setEtnia] = useState<string>("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string>("")

  const [localizacao, setLocalizacao] = useState<string>("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [dataCadastro, setDataCadastro] = useState<string>("")
  const [horaCadastro, setHoraCadastro] = useState<string>("")
  const [semanaCadastro, setSemanaCadastro] = useState<string>("")

  const [aceitouLGPD, setAceitouLGPD] = useState(false)
  const [aceitouCompromisso, setAceitouCompromisso] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false)

  useEffect(() => {
    const agora = new Date()
    setDataCadastro(agora.toLocaleDateString("pt-BR"))
    setHoraCadastro(agora.toLocaleTimeString("pt-BR"))

    // Calcular semana do ano
    const primeiroDiaAno = new Date(agora.getFullYear(), 0, 1)
    const diasPassados = Math.floor((agora.getTime() - primeiroDiaAno.getTime()) / (24 * 60 * 60 * 1000))
    const semanaAno = Math.ceil((diasPassados + primeiroDiaAno.getDay() + 1) / 7)
    setSemanaCadastro(`Semana ${semanaAno} de ${agora.getFullYear()}`)
  }, [])

  const obterLocalizacao = () => {
    setCarregandoLocalizacao(true)

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setLatitude(lat)
          setLongitude(lon)

          // Tentar obter nome da localização via API de geocoding reverso
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            )
            const data = await response.json()
            const cidade = data.address?.city || data.address?.town || data.address?.village || ""
            const estado = data.address?.state || ""
            const pais = data.address?.country || ""
            setLocalizacao(`${cidade}, ${estado}, ${pais}`)
          } catch (err) {
            console.error("Erro ao obter nome da localização:", err)
            setLocalizacao(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
          }

          setCarregandoLocalizacao(false)
        },
        (error) => {
          console.error("Erro ao obter localização:", error)
          setError("Não foi possível obter sua localização. Por favor, permita o acesso.")
          setCarregandoLocalizacao(false)
        },
      )
    } else {
      setError("Geolocalização não é suportada pelo seu navegador")
      setCarregandoLocalizacao(false)
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (!aceitouLGPD || !aceitouCompromisso) {
      setError("Você precisa aceitar todos os termos para continuar")
      setIsLoading(false)
      return
    }

    try {
      // Criar conta
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Erro ao criar usuário")

      // Upload da foto se houver
      let fotoUrl = null
      if (foto) {
        const fileExt = foto.name.split(".").pop()
        const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, foto)

        if (uploadError) {
          console.error("Erro ao fazer upload da foto:", uploadError)
        } else {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)
          fotoUrl = urlData.publicUrl
        }
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        nome_completo: nomeCompleto,
        telefone,
        igreja,
        genero,
        etnia,
        data_nascimento: dataNascimento,
        foto_perfil_url: fotoUrl,
        aceitou_lgpd: aceitouLGPD,
        aceitou_compromisso: aceitouCompromisso,
        data_aceite_termos: new Date().toISOString(),
        localizacao_cadastro: localizacao,
        latitude_cadastro: latitude,
        longitude_cadastro: longitude,
        data_cadastro: dataCadastro,
        hora_cadastro: horaCadastro,
        semana_cadastro: semanaCadastro,
      })

      if (profileError) throw profileError

      // Marcar convite como usado
      const { error: conviteError } = await supabase
        .from("convites")
        .update({
          usado: true,
          usado_por: authData.user.id,
          data_uso: new Date().toISOString(),
        })
        .eq("codigo_convite", convite.codigo_convite)

      if (conviteError) throw conviteError

      // Criar registro de discípulo com o discipulador do convite
      const { error: discipuloError } = await supabase.from("discipulos").insert({
        user_id: authData.user.id,
        discipulador_id: convite.discipulador_id,
      })

      if (discipuloError) throw discipuloError

      router.push("/auth/sign-up-success")
    } catch (error) {
      console.error("Erro no cadastro:", error)
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Shield className="h-12 w-12 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Bem-vindo ao Fazendo Discípulos!</h1>
            <p className="text-sm text-blue-200">
              Você foi convidado por{" "}
              <span className="font-semibold text-yellow-400">{convite.discipulador.nome_completo}</span>
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Complete seu Cadastro
              </CardTitle>
              <CardDescription className="text-blue-200">
                Preencha seus dados para começar sua jornada de fé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-white/5 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>Data: {dataCadastro}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span>Hora: {horaCadastro}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      <span>{semanaCadastro}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm">
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span>{localizacao || "Localização não capturada"}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={obterLocalizacao}
                      disabled={carregandoLocalizacao}
                      className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      {carregandoLocalizacao ? "Obtendo localização..." : "Capturar Localização"}
                    </Button>
                  </div>

                  {/* Foto de Perfil */}
                  <div className="flex flex-col items-center gap-2">
                    <Label className="text-white">Foto de Perfil (Opcional)</Label>
                    <div className="relative">
                      {fotoPreview ? (
                        <Image
                          src={fotoPreview || "/placeholder.svg"}
                          alt="Preview"
                          width={100}
                          height={100}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-white/50" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-blue-200">Clique para selecionar uma foto</p>
                  </div>

                  {/* Dados Pessoais */}
                  <div className="grid gap-2">
                    <Label htmlFor="nome" className="text-white">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Seu nome completo"
                      required
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="genero" className="text-white">
                        Gênero *
                      </Label>
                      <Select value={genero} onValueChange={setGenero} required>
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="etnia" className="text-white">
                        Etnia *
                      </Label>
                      <Select value={etnia} onValueChange={setEtnia} required>
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="branca">Branca</SelectItem>
                          <SelectItem value="parda">Parda</SelectItem>
                          <SelectItem value="negra">Negra</SelectItem>
                          <SelectItem value="indigena">Indígena</SelectItem>
                          <SelectItem value="asiatica">Asiática</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nascimento" className="text-white">
                      Data de Nascimento *
                    </Label>
                    <Input
                      id="nascimento"
                      type="date"
                      required
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="telefone" className="text-white">
                      Telefone
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
                    <Label htmlFor="igreja" className="text-white">
                      Igreja
                    </Label>
                    <Input
                      id="igreja"
                      type="text"
                      placeholder="Nome da sua igreja"
                      value={igreja}
                      onChange={(e) => setIgreja(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>

                  {/* Credenciais */}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">
                      Email *
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-white">
                        Senha *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="repeat-password" className="text-white">
                        Confirmar Senha *
                      </Label>
                      <Input
                        id="repeat-password"
                        type="password"
                        required
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className="bg-white/20 border-white/30 text-white"
                      />
                    </div>
                  </div>

                  {/* Termos */}
                  <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="lgpd"
                        checked={aceitouLGPD}
                        onCheckedChange={(checked) => setAceitouLGPD(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="lgpd" className="text-sm text-white leading-relaxed cursor-pointer">
                        Aceito que meus dados pessoais sejam coletados e utilizados conforme a Lei Geral de Proteção de
                        Dados (LGPD), exclusivamente para fins de acompanhamento do meu processo de discipulado.
                      </label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="compromisso"
                        checked={aceitouCompromisso}
                        onCheckedChange={(checked) => setAceitouCompromisso(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="compromisso" className="text-sm text-white leading-relaxed cursor-pointer">
                        Comprometo-me a seguir os passos do discipulado com dedicação, completando cada etapa no prazo
                        recomendado de 3 a 7 dias, mantendo contato regular com meu discipulador e buscando crescimento
                        espiritual contínuo.
                      </label>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-300 bg-red-500/20 p-2 rounded">{error}</p>}

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-semibold"
                    disabled={isLoading || !aceitouLGPD || !aceitouCompromisso}
                  >
                    {isLoading ? "Criando conta..." : "Começar Jornada de Fé"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
