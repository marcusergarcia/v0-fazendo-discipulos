"use client"

import { useState, useEffect } from "react"
import { ModalCelebracaoPasso } from "./modal-celebracao-passo"
import { marcarCelebracaoVista } from "@/app/dashboard/passo/[numero]/actions"

interface DashboardCelebracaoClientProps {
  passoNumero: number
  faseNumero: number
  discipuloId: string
  xpGanho: number
}

export default function DashboardCelebracaoClient({
  passoNumero,
  faseNumero,
  discipuloId,
  xpGanho,
}: DashboardCelebracaoClientProps) {
  const [showCelebracao, setShowCelebracao] = useState(true)

  useEffect(() => {
    console.log(
      "[v0] DashboardCelebracaoClient montado - Passo:",
      passoNumero,
      "Fase:",
      faseNumero,
      "XP:",
      xpGanho,
      "Show:",
      showCelebracao,
    )
  }, [passoNumero, faseNumero, xpGanho, showCelebracao])

  const handleCloseCelebracao = async () => {
    console.log("[v0] Fechando celebração e marcando como vista - Passo:", passoNumero)
    setShowCelebracao(false)

    // Marcar como vista no banco
    await marcarCelebracaoVista(discipuloId, faseNumero, passoNumero)
  }

  return (
    <ModalCelebracaoPasso
      open={showCelebracao}
      onClose={handleCloseCelebracao}
      passoCompletado={passoNumero}
      xpGanho={xpGanho}
    />
  )
}
