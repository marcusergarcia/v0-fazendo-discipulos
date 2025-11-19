'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react'
import { aprovarDiscipulo, rejeitarDiscipulo } from './actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

export function AprovarDiscipuloClient({ 
  discipuloId, 
  discipuloNome 
}: { 
  discipuloId: string
  discipuloNome: string 
}) {
  const router = useRouter()
  const [isAprovando, setIsAprovando] = useState(false)
  const [isRejeitando, setIsRejeitando] = useState(false)
  const [aprovado, setAprovado] = useState(false)
  const [linkBoasVindas, setLinkBoasVindas] = useState("")

  const handleAprovar = async () => {
    try {
      setIsAprovando(true)
      const result = await aprovarDiscipulo(discipuloId)
      
      if (result.success) {
        setAprovado(true)
        setLinkBoasVindas(result.linkBoasVindas)
        
        // Efeito de celebração
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })

        toast.success(`${discipuloNome} foi aprovado com sucesso!`, {
          description: `Uma notificação de boas-vindas foi enviada para ${result.email}`
        })
      }
    } catch (error: any) {
      toast.error("Erro ao aprovar discípulo", {
        description: error.message
      })
    } finally {
      setIsAprovando(false)
    }
  }

  const handleRejeitar = async () => {
    if (!confirm(`Tem certeza que deseja rejeitar o cadastro de ${discipuloNome}?`)) {
      return
    }

    try {
      setIsRejeitando(true)
      await rejeitarDiscipulo(discipuloId)
      toast.success("Cadastro rejeitado")
      router.push("/discipulador/aprovar")
    } catch (error: any) {
      toast.error("Erro ao rejeitar discípulo", {
        description: error.message
      })
    } finally {
      setIsRejeitando(false)
    }
  }

  if (aprovado) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <h4 className="font-semibold">Discípulo Aprovado!</h4>
          </div>
          <p className="text-sm text-green-700 mb-3">
            {discipuloNome} foi aprovado e pode começar sua jornada. Uma notificação de boas-vindas foi enviada.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-green-600 font-medium">Link de Acesso:</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={linkBoasVindas}
                className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(linkBoasVindas)
                  toast.success("Link copiado!")
                }}
              >
                Copiar
              </Button>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => router.push("/discipulador")} 
          className="w-full"
        >
          Voltar ao Painel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Button 
        onClick={handleAprovar} 
        disabled={isAprovando || isRejeitando}
        className="flex-1 bg-green-600 hover:bg-green-700"
      >
        {isAprovando ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Aprovando...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovar Discípulo
          </>
        )}
      </Button>

      <Button 
        onClick={handleRejeitar} 
        disabled={isAprovando || isRejeitando}
        variant="destructive"
        className="flex-1"
      >
        {isRejeitando ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Rejeitando...
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Rejeitar Cadastro
          </>
        )}
      </Button>
    </div>
  )
}
