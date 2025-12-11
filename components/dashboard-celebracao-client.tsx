"use client"

import { useState } from "react"
import { ModalCelebracaoPasso } from "./modal-celebracao-passo"
import { marcarCelebracaoVista } from "@/app/dashboard/passo/[numero]/actions"

interface DashboardCelebracaoClientProps {
  passoNumero: number
  faseNumero: number
  discipuloId: string
}

export function DashboardCelebracaoClient({ passoNumero, faseNumero, discipuloId }: DashboardCelebracaoClientProps) {
  const [showCelebracao, setShowCelebracao] = useState(true)

  console.log("[v0] DashboardCelebracaoClient - Passo:", passoNumero, "Fase:", faseNumero)

  const handleCloseCelebracao = async () => {
    console.log("[v0] Fechando celebração e marcando como vista")
    setShowCelebracao(false)

    // Marcar como vista no banco
    await marcarCelebracaoVista(discipuloId, faseNumero, passoNumero)
  }

  return (
    <ModalCelebracaoPasso
      open={showCelebracao}
      onClose={handleCloseCelebracao}
      passoNumero={passoNumero}
      faseNumero={faseNumero}
    />
  )
}
