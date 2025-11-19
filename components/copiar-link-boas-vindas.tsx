'use client'

import { Button } from "@/components/ui/button"
import { Gift, Copy, Check } from 'lucide-react'
import { useState } from "react"
import { toast } from "sonner"

export function CopiarLinkBoasVindas() {
  const [copiado, setCopiado] = useState(false)

  const copiarLink = () => {
    const link = `${window.location.origin}/boas-vindas-discipulo`
    navigator.clipboard.writeText(link)
    setCopiado(true)
    toast.success("Link copiado! Envie ao seu discípulo aprovado.")
    setTimeout(() => setCopiado(false), 3000)
  }

  return (
    <Button variant="outline" onClick={copiarLink}>
      {copiado ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copiado!
        </>
      ) : (
        <>
          <Gift className="w-4 h-4 mr-2" />
          Link Boas-vindas
        </>
      )}
    </Button>
  )
}
