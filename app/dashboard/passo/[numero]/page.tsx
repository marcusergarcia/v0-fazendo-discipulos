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
        url: "https://www.youtube.com/watch?v=rr6k9AVyO1Y" ,
      },
      {
        id: "video-2",
        titulo: "Gênesis 1 - A Criação",
        canal: "A Bíblia em Vídeo",
        duracao: "3:05",
        url: "https://www.youtube.com/watch?v=_ng5vKEv3Cg",
      },
      {
        id: "video-3",
        titulo: "Por que Deus nos Criou?",
        canal: "Ministério Fiel",
        duracao: "6:18",
        url: "https://www.youtube.com/watch?v=eAvYmE2YYIU",
      },
    ],
    artigos: [
      {
        id: "artigo-1",
        titulo: "Imago Dei (Imagem de Deus)",
        fonte: "Wikipédia",
        url: "https://pt.wikipedia.org/wiki/Imagem_de_Deus",
      },
      {
        id: "artigo-2",
        titulo: "Fomos Criados para Relacionamento",
        fonte: "Got Questions",
        url: "https://www.gotquestions.org/Portugues/por-que-foi-o-homem-criado.html",
      },
      {
        id: "artigo-3",
        titulo: "Criação (Cristianismo)",
        fonte: "Wikipédia",
        url: "https://pt.wikipedia.org/wiki/Criação_(cristianismo)",
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
  const numeroParam = await Promise.resolve(params.numero)
  const numero = Number.parseInt(numeroParam)
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
