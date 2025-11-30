"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"

// Este modal não é mais usado no sistema atual mas mantido para compatibilidade

type AvaliarRespostasModalProps = {
  resposta: {
    id: string
    discipulo_id: string
    fase_numero: number
    passo_numero: number
    tipo_resposta: string
    resposta: string
    situacao: string
    notificacao_id: string | null
  }
  discipuloNome: string
  onAprovado?: (xp: number) => void
}

export default function AvaliarRespostasModal({ resposta, discipuloNome, onAprovado }: AvaliarRespostasModalProps) {
  const [open, setOpen] = useState(false)
  const [xp, setXp] = useState(10)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <Button
        size="sm"
        onClick={() => setError("Este recurso não está mais disponível. Use a tabela perguntas_reflexivas.")}
        className="bg-primary"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        Avaliar (Obsoleto)
      </Button>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2 mt-2">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </>
  )
}
