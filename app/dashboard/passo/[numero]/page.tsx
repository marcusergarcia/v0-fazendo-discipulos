import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PassoClient from "./passo-client"

const PASSOS_CONTEUDO = {
  1: {
    titulo: "Deus nos Criou",
    fase: "FASE 1: O Evangelho",
    conteudo: [
      "Deus é o Criador de todas as coisas.",
      "Ele nos fez à Sua imagem (Gênesis 1:26–27).",
      "Isso significa que:",
      "• Temos valor",
      "• Temos identidade",
      "• Fomos criados para nos relacionar com Ele",
      "Você não é um acaso.",
      "Você existe porque Deus desejou a sua vida.",
    ],
    versiculos: [{ texto: "No princípio, criou Deus os céus e a terra.", referencia: "Gênesis 1:1" }],
    videos: [
      {
        id: "video-1",
        titulo: "O que significa ser criado à imagem de Deus?",
        canal: "Cristãos na Ciência",
        duracao: "9:33",
        url: "https://www.youtube.com/watch?v=rr6k9AVyO1Y",
      },
      {
        id: "video-2",
        titulo: "Gênesis 1 - A Criação",
        canal: "Luciano Subirá",
        duracao: "30:05",
        url: "https://www.youtube.com/watch?v=ha-SeFsM3KQ",
      },
      {
        id: "video-3",
        titulo: "Por que Deus nos Criou?",
        canal: "Ministério Fiel",
        duracao: "3:25",
        url: "https://www.youtube.com/watch?v=2Vo0t3ZOkYI",
      },
    ],
    artigos: [
      {
        id: "artigo-1",
        titulo: "Imago Dei (Imagem de Deus)",
        fonte: "Teólogo Internacional",
        url: "https://teologointernacional.com.br/o-que-significa-ser-criado-a-imagem-e-semelhanca-de-deus-estudos-biblicos/",
      },
      {
        id: "artigo-2",
        titulo: "Fomos Criados para Relacionamento",
        fonte: "fhopchurch",
        url: "https://fhop.com/criados-para-relacionamento/",
      },
      {
        id: "artigo-3",
        titulo: "Criação (Cristianismo)",
        fonte: "Bibliaon",
        url: "https://www.bibliaon.com/os_dias_da_criacao/",
      },
    ],
    perguntaChave: "Qual o propósito da criação do ser humano?",
    missao: 'Escreva uma frase respondendo: "Por que eu existo?"',
    recompensa: "Identidade dada por Deus",
    icone: "✨",
    xp: 100,
  },
}

export default async function PassoPage({ params }: { params: { numero: string } }) {
  console.log("[v0] PassoPage carregou, params:", params)
  const numeroParam = await Promise.resolve(params.numero)
  const numero = Number.parseInt(numeroParam)
  console.log("[v0] Número do passo:", numero)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: discipulo } = await supabase.from("discipulos").select("*").eq("user_id", user.id).single()

  if (!discipulo) redirect("/dashboard")

  const { data: progresso } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)
    .eq("passo_numero", numero)
    .single()

  const passo = PASSOS_CONTEUDO[numero as keyof typeof PASSOS_CONTEUDO]
  if (!passo) redirect("/dashboard")

  const { data: todosPassos } = await supabase
    .from("progresso_fases")
    .select("*")
    .eq("discipulo_id", discipulo.id)
    .eq("fase_numero", 1)

  const passosCompletados = todosPassos?.filter((p) => p.completado).length || 0

  let videosAssistidos: string[] = []
  let artigosLidos: string[] = []
  if (progresso?.videos_assistidos) {
    videosAssistidos = progresso.videos_assistidos
  }
  if (progresso?.artigos_lidos) {
    artigosLidos = progresso.artigos_lidos
  }

  const getStatus = () => {
    if (progresso?.completado) return "validado"
    if (progresso?.enviado_para_validacao) return "aguardando"
    return "pendente"
  }

  const status = getStatus()

  return (
    <PassoClient
      numero={numero}
      passo={passo}
      discipulo={discipulo}
      progresso={progresso}
      passosCompletados={passosCompletados}
      videosAssistidos={videosAssistidos}
      artigosLidos={artigosLidos}
      status={status}
    />
  )
}
