"use client"

import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { ValidarReflexaoModal } from "@/components/validar-reflexao-modal"
import { CheckCircle } from 'lucide-react'

interface Reflexao {
  id: string
  discipulo_id: string
  tipo: "video" | "artigo"
  conteudo_id: string
  titulo: string
  reflexao: string
  criado_em: string
  xp_ganho?: number
  situacao?: string
}

interface ReflexoesClientProps {
  reflexao: Reflexao | null
  discipuloId: string
  discipuloNome: string
  xp?: number | null
  situacao?: string | null
}

export function ReflexoesClient({
  reflexao,
  discipuloId,
  discipuloNome,
  xp,
  situacao,
}: ReflexoesClientProps) {
  const router = useRouter()

  const handleAprovado = (xpConcedido: number) => {
    setTimeout(() => {
      router.refresh()
    }, 500)
  }

  const situacaoAtual = reflexao?.situacao || situacao

  // Se a situação é 'aprovado', mostra badge aprovado
  if (situacaoAtual === 'aprovado') {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        <CheckCircle className="w-3 h-3 mr-1" />
        Aprovado {reflexao?.xp_ganho || xp}XP
      </Badge>
    )
  }

  // Se tem reflexão e situação é 'enviado', mostra botão avaliar
  if (reflexao && situacaoAtual === 'enviado') {
    return (
      <ValidarReflexaoModal
        reflexao={reflexao}
        discipuloId={discipuloId}
        discipuloNome={discipuloNome}
        onAprovado={handleAprovado}
      />
    )
  }

  // Caso contrário, não mostra nada
  return null
}
