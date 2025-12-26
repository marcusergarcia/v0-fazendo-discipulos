"use client"

import type React from "react"
import { cadastrarDiscipuloPorConvite } from "./actions"
import { useState, useMemo, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Shield,
  UserPlus,
  Upload,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Scale,
  CheckCircle2,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface ConviteClientProps {
  convite: {
    id: string
    codigo_convite: string
    discipulador_id: string
    discipulador: {
      nome_completo: string
      email: string
    }
  }
}

export default function CadastroConviteClient({ convite }: ConviteClientProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [etapa, setEtapa] = useState(1)

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
  const [leuTermoCompleto, setLeuTermoCompleto] = useState(false)
  const [leuLGPDCompleto, setLeuLGPDCompleto] = useState(false)

  const termoScrollRef = useRef<HTMLDivElement>(null)
  const lgpdScrollRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (etapa === 4 && !localizacao && !carregandoLocalizacao) {
      obterLocalizacao()
    }
  }, [etapa])

  useEffect(() => {
    const handleTermoScroll = () => {
      if (termoScrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = termoScrollRef.current
        // Considera "lido" quando está a 20px do fim
        if (scrollHeight - scrollTop - clientHeight < 20) {
          setLeuTermoCompleto(true)
        }
      }
    }

    const termoElement = termoScrollRef.current
    if (termoElement) {
      termoElement.addEventListener("scroll", handleTermoScroll)
      // Verificar se já está no final (caso o conteúdo seja pequeno)
      handleTermoScroll()
      return () => termoElement.removeEventListener("scroll", handleTermoScroll)
    }
  }, [etapa])

  useEffect(() => {
    const handleLGPDScroll = () => {
      if (lgpdScrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = lgpdScrollRef.current
        // Considera "lido" quando está a 20px do fim
        if (scrollHeight - scrollTop - clientHeight < 20) {
          setLeuLGPDCompleto(true)
        }
      }
    }

    const lgpdElement = lgpdScrollRef.current
    if (lgpdElement) {
      lgpdElement.addEventListener("scroll", handleLGPDScroll)
      // Verificar se já está no final (caso o conteúdo seja pequeno)
      handleLGPDScroll()
      return () => lgpdElement.removeEventListener("scroll", handleLGPDScroll)
    }
  }, [etapa])

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
      console.log("[v0] Iniciando cadastro...")

      let fotoUrl = null
      if (foto) {
        const fileExt = foto.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, foto)

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)
          fotoUrl = urlData.publicUrl
        }
      }

      const resultado = await cadastrarDiscipuloPorConvite({
        email,
        password,
        nomeCompleto,
        telefone,
        igreja,
        genero,
        etnia,
        dataNascimento,
        fotoUrl,
        discipuladorId: convite.discipulador_id,
        codigoConvite: convite.codigo_convite,
        aceitouLGPD,
        aceitouCompromisso,
        localizacao,
        latitude,
        longitude,
        dataCadastro,
        horaCadastro,
        semanaCadastro,
      })

      if (!resultado.success) {
        throw new Error(resultado.error)
      }

      console.log("[v0] Convite marcado como usado")

      await supabase.from("notificacoes").insert({
        user_id: convite.discipulador_id,
        discipulo_id: resultado.discipuloId,
        tipo: "novo_discipulo",
        titulo: "Novo Discípulo Aguardando Aprovação",
        mensagem: `${nomeCompleto} completou o cadastro e aguarda sua aprovação para iniciar o discipulado.`,
        link: `/discipulador/aprovar/${resultado.discipuloId}`,
        lida: false,
      })

      console.log("[v0] Notificação criada, redirecionando...")

      router.push("/convite/aguardando-aprovacao")
    } catch (error) {
      console.error("[v0] Erro no cadastro:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar conta"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Etapa 1: Boas-vindas e Explicação */}
        {etapa === 1 && (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="text-center">
              <div className="bg-white rounded-lg p-4 inline-block mx-auto mb-4">
                <Image
                  src="/logo-fazendo-discipulos.png"
                  alt="Fazendo Discípulos"
                  width={200}
                  height={75}
                  className="mx-auto"
                />
              </div>
              <CardTitle className="text-3xl text-white flex items-center justify-center gap-2">
                <BookOpen className="h-8 w-8 text-yellow-400" />
                Bem-vindo ao Fazendo Discípulos!
              </CardTitle>
              <CardDescription className="text-blue-200 text-lg">
                Você foi convidado por{" "}
                <span className="font-semibold text-yellow-400">{convite.discipulador.nome_completo}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-yellow-400">O que é Fazendo Discípulos?</h3>
                <p className="text-lg leading-relaxed">
                  Um sistema completo e interativo de discipulado cristão, estruturado em fases progressivas para seu
                  crescimento espiritual. Nossa missão é formar discípulos maduros e multiplicadores da fé em Cristo.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-yellow-400">Como Funciona?</h3>
                <div className="space-y-3 pl-4 border-l-4 border-yellow-400">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">📖 Fase 1: O Evangelho (10 passos)</h4>
                    <p className="text-blue-100">
                      Compreenda os fundamentos da fé cristã e torne-se discípulo de Cristo
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">💧 Fase Intermediária: Batismo Cristão (12 passos)</h4>
                    <p className="text-blue-100">
                      Fase opcional para quem não foi batizado - entenda o significado bíblico do batismo
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">👥 Fase 3: Vida em Comunidade (10 passos)</h4>
                    <p className="text-blue-100">Relacionamentos, igreja e vida cristã em comunidade</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">⛰️ Fase 4: Sermão da Montanha (10 passos)</h4>
                    <p className="text-blue-100">Treinamento completo em Mateus 5-7 para se tornar discipulador</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">🛡️ Fase 2: Armadura de Deus (10 passos)</h4>
                    <p className="text-blue-100">
                      Aprenda sobre cada peça da armadura espiritual através de missões práticas
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-yellow-400">Sistema Gamificado</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🎯 Missões e Recompensas</h4>
                    <p className="text-sm text-blue-100">
                      Ganhe XP, suba de nível e conquiste insígnias digitais e medalhas físicas
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">👥 Conexão Real</h4>
                    <p className="text-sm text-blue-100">
                      Interação obrigatória com seu discipulador em cada passo da jornada
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📚 Conteúdo Rico</h4>
                    <p className="text-sm text-blue-100">
                      Vídeos, artigos, reflexões e missões práticas para aplicar o que aprendeu
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🌱 Multiplicação</h4>
                    <p className="text-sm text-blue-100">Torne-se discipulador e ajude outros a crescer na fé</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setEtapa(2)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-semibold text-lg py-6"
              >
                Entendi! Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Termo de Compromisso */}
        {etapa === 2 && (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white flex items-center justify-center gap-2">
                <Shield className="h-8 w-8 text-yellow-400" />
                Termo de Compromisso
              </CardTitle>
              <CardDescription className="text-blue-200">
                Leia atentamente cada ponto antes de prosseguir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              <div ref={termoScrollRef} className="bg-white/5 p-6 rounded-lg space-y-4 max-h-96 overflow-y-auto">
                <h3 className="text-xl font-semibold text-yellow-400">COMPROMISSO DE DISCIPULADO</h3>

                <div className="space-y-3 text-blue-100">
                  <p className="font-semibold text-white">Ao aceitar este compromisso, eu declaro que:</p>

                  <div className="space-y-2 pl-4">
                    <p>
                      <strong>1. DEDICAÇÃO DE TEMPO:</strong> Comprometo-me a dedicar tempo regular para o estudo,
                      reflexão e prática dos ensinamentos de cada passo do discipulado.
                    </p>

                    <p>
                      <strong>2. PRAZO RECOMENDADO:</strong> Esforçar-me-ei para completar cada passo na média de 3 a 7
                      dias, entendendo que este ritmo é ideal para absorção e aplicação do conteúdo.
                    </p>

                    <p>
                      <strong>3. CUMPRIMENTO DE MISSÕES:</strong> Realizarei todas as missões práticas propostas,
                      colocando em prática o que aprendi e testemunhando minha fé através de ações concretas.
                    </p>

                    <p>
                      <strong>4. COMUNICAÇÃO REGULAR:</strong> Manterei contato regular com meu discipulador,
                      compartilhando minhas reflexões, dúvidas e experiências ao longo da jornada.
                    </p>

                    <p>
                      <strong>5. HONESTIDADE E TRANSPARÊNCIA:</strong> Serei honesto(a) em minhas respostas e reflexões,
                      buscando crescimento espiritual genuíno e não apenas progresso no sistema.
                    </p>

                    <p>
                      <strong>6. LEITURA COMPLETA:</strong> Assistirei a todos os vídeos e lerei todos os artigos antes
                      de enviar minhas reflexões, garantindo compreensão adequada do conteúdo.
                    </p>

                    <p>
                      <strong>7. RESPEITO AO PROCESSO:</strong> Reconheço que o discipulado é um processo de
                      transformação e não uma corrida, respeitando meu próprio ritmo enquanto mantenho disciplina.
                    </p>

                    <p>
                      <strong>8. COMPROMISSO COM A MULTIPLICAÇÃO:</strong> Ao concluir minha jornada, comprometo-me a
                      considerar seriamente tornar-me discipulador(a) de outros, multiplicando o que aprendi.
                    </p>

                    <p>
                      <strong>9. RESPEITO AO DISCIPULADOR:</strong> Valorizarei o tempo e dedicação do meu discipulador,
                      respondendo prontamente suas mensagens e seguindo suas orientações.
                    </p>

                    <p>
                      <strong>10. PERSEVERANÇA:</strong> Comprometo-me a não desistir diante das dificuldades, buscando
                      força em Deus e apoio do meu discipulador quando necessário.
                    </p>
                  </div>

                  <p className="pt-4 font-semibold text-white">
                    Entendo que este compromisso é uma declaração de intenção séria para meu crescimento espiritual e
                    que meu discipulador conta comigo para cumprir esta jornada com dedicação e integridade.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg">
                  <Checkbox
                    id="leu-termo"
                    checked={leuTermoCompleto}
                    onCheckedChange={(checked) => setLeuTermoCompleto(checked as boolean)}
                    className="mt-1"
                    disabled={!leuTermoCompleto}
                  />
                  <label htmlFor="leu-termo" className="text-sm cursor-pointer">
                    <strong>Confirmo que li e compreendi todos os 10 pontos do Termo de Compromisso acima</strong>
                    {!leuTermoCompleto && (
                      <span className="block text-xs text-yellow-400 mt-1">
                        Role até o final do texto para habilitar
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex items-start space-x-3 bg-yellow-500/10 p-4 rounded-lg border-2 border-yellow-500/30">
                  <Checkbox
                    id="aceito-compromisso"
                    checked={aceitouCompromisso}
                    onCheckedChange={(checked) => setAceitouCompromisso(checked as boolean)}
                    disabled={!leuTermoCompleto}
                    className="mt-1"
                  />
                  <label htmlFor="aceito-compromisso" className="text-sm cursor-pointer font-semibold">
                    <strong className="text-yellow-400">ACEITO</strong> este Termo de Compromisso e declaro estar
                    pronto(a) para iniciar minha jornada de discipulado com dedicação e seriedade
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setEtapa(1)}
                  variant="outline"
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setEtapa(3)}
                  disabled={!aceitouCompromisso}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-semibold"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 3: Termo LGPD */}
        {etapa === 3 && (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white flex items-center justify-center gap-2">
                <Scale className="h-8 w-8 text-yellow-400" />
                Termo de Privacidade (LGPD)
              </CardTitle>
              <CardDescription className="text-blue-200">
                Proteção de dados pessoais conforme a Lei Geral de Proteção de Dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-white">
              <div ref={lgpdScrollRef} className="bg-white/5 p-6 rounded-lg space-y-4 max-h-96 overflow-y-auto">
                <h3 className="text-xl font-semibold text-yellow-400">POLÍTICA DE PRIVACIDADE E PROTEÇÃO DE DADOS</h3>

                <div className="space-y-3 text-blue-100">
                  <p className="font-semibold text-white">COLETA E USO DE DADOS:</p>

                  <div className="space-y-2 pl-4">
                    <p>
                      <strong>Dados Coletados:</strong> Nome completo, e-mail, telefone, data de nascimento, gênero,
                      etnia, foto de perfil, localização geográfica, igreja, informações de progresso no discipulado,
                      reflexões e missões completadas.
                    </p>

                    <p>
                      <strong>Finalidade:</strong> Os dados são coletados exclusivamente para fins de acompanhamento do
                      seu processo de discipulado, comunicação com seu discipulador, registro de progresso espiritual e
                      geração de estatísticas agregadas para melhoria do sistema.
                    </p>

                    <p>
                      <strong>Compartilhamento:</strong> Seus dados pessoais serão compartilhados apenas com seu
                      discipulador designado e administradores do sistema. Não vendemos, alugamos ou compartilhamos seus
                      dados com terceiros para fins comerciais.
                    </p>

                    <p>
                      <strong>Armazenamento:</strong> Todos os dados são armazenados de forma segura em servidores
                      protegidos, com acesso restrito e criptografia adequada.
                    </p>

                    <p>
                      <strong>Seus Direitos:</strong> Você tem direito a acessar, corrigir, deletar ou exportar seus
                      dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato com seu
                      discipulador ou administrador do sistema.
                    </p>

                    <p>
                      <strong>Retenção de Dados:</strong> Seus dados serão mantidos enquanto você estiver ativo no
                      programa. Após solicitação de exclusão, seus dados serão removidos permanentemente em até 30 dias.
                    </p>

                    <p>
                      <strong>Cookies e Rastreamento:</strong> Utilizamos cookies essenciais para funcionamento do
                      sistema. Não utilizamos cookies de rastreamento para publicidade.
                    </p>

                    <p>
                      <strong>Contato:</strong> Para questões relacionadas à privacidade e proteção de dados, entre em
                      contato através do e-mail do seu discipulador ou administrador do sistema.
                    </p>
                  </div>

                  <p className="pt-4 font-semibold text-white">
                    Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) do
                    Brasil.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-lg">
                  <Checkbox
                    id="leu-lgpd"
                    checked={leuLGPDCompleto}
                    onCheckedChange={(checked) => setLeuLGPDCompleto(checked as boolean)}
                    className="mt-1"
                    disabled={!leuLGPDCompleto}
                  />
                  <label htmlFor="leu-lgpd" className="text-sm cursor-pointer">
                    <strong>Confirmo que li e compreendi toda a Política de Privacidade e Proteção de Dados</strong>
                    {!leuLGPDCompleto && (
                      <span className="block text-xs text-yellow-400 mt-1">
                        Role até o final do texto para habilitar
                      </span>
                    )}
                  </label>
                </div>

                <div className="flex items-start space-x-3 bg-yellow-500/10 p-4 rounded-lg border-2 border-yellow-500/30">
                  <Checkbox
                    id="aceito-lgpd"
                    checked={aceitouLGPD}
                    onCheckedChange={(checked) => setAceitouLGPD(checked as boolean)}
                    disabled={!leuLGPDCompleto}
                    className="mt-1"
                  />
                  <label htmlFor="aceito-lgpd" className="text-sm cursor-pointer font-semibold">
                    <strong className="text-yellow-400">ACEITO</strong> que meus dados pessoais sejam coletados e
                    utilizados conforme descrito acima, exclusivamente para fins de acompanhamento do meu processo de
                    discipulado
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => setEtapa(2)}
                  variant="outline"
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setEtapa(4)}
                  disabled={!aceitouLGPD}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-semibold"
                >
                  Continuar para Cadastro
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 4: Formulário de Cadastro */}
        {etapa === 4 && (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Complete seu Cadastro
              </CardTitle>
              <CardDescription className="text-blue-200">Preencha seus dados para finalizar</CardDescription>
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

                  <div className="p-4 bg-green-500/10 rounded-lg border-2 border-green-500/30">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="font-semibold">Seu Discipulador</span>
                    </div>
                    <p className="text-sm text-blue-100">
                      <strong className="text-white">{convite.discipulador.nome_completo}</strong> será seu discipulador
                      nesta jornada. Após completar o cadastro, ele receberá uma notificação para aprovar seu ingresso
                      no programa.
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-300 bg-red-500/20 p-2 rounded">{error}</p>}

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={() => setEtapa(3)}
                      variant="outline"
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-blue-950 font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? "Enviando..." : "Finalizar Cadastro"}
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
