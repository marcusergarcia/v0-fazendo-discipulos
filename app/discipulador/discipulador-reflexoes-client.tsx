"use client"

import { useState } from 'react'
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
}

interface ReflexoesClientProps {
  reflexao: Reflexao | null
  discipuloId: string
  discipuloNome: string
}

export function ReflexoesClient({
  reflexao,
  discipuloId,
  discipuloNome,
}: ReflexoesClientProps) {
  const [foiAprovado, setFoiAprovado] = useState(false)

  const jaAprovado = (reflexao?.xp_ganho && reflexao.xp_ganho > 0) || foiAprovado

  if (reflexao && jaAprovado) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        <CheckCircle className="w-3 h-3 mr-1" />
        Aprovado
      </Badge>
    )
  }

  if (reflexao) {
    return (
      <ValidarReflexaoModal
        reflexao={reflexao}
        discipuloId={discipuloId}
        discipuloNome={discipuloNome}
        onAprovado={() => setFoiAprovado(true)}
      />
    )
  }

  return null
}
