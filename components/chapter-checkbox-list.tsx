"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { buscarCapitulosLidos } from "@/app/dashboard/leitura-biblica/actions"

interface ChapterCheckboxListProps {
  livroId: number
  capituloInicial: number
  capituloFinal: number
  onProgressChange?: (lidos: number, total: number) => void
  externalCapitulosLidos?: Set<number>
  onCapituloLidoChange?: (capitulo: number, lido: boolean) => void
  onUltimoCapituloChange?: (numeroCapitulo: number) => void
  onCapituloClick?: (numeroCapitulo: number) => void
}

export function ChapterCheckboxList({
  livroId,
  capituloInicial,
  capituloFinal,
  onProgressChange,
  externalCapitulosLidos,
  onCapituloLidoChange,
  onUltimoCapituloChange,
  onCapituloClick,
}: ChapterCheckboxListProps) {
  const capitulos = Array.from({ length: capituloFinal - capituloInicial + 1 }, (_, i) => capituloInicial + i)

  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarLeituras() {
      const { leituras, ultimoCapituloLido } = await buscarCapitulosLidos(livroId, capitulos)
      const lidos = new Set(leituras.filter((l) => l.lido).map((l) => l.numero_capitulo))
      setCapitulosLidos(lidos)
      setLoading(false)

      if (onProgressChange) {
        onProgressChange(lidos.size, capitulos.length)
      }

      if (ultimoCapituloLido && onUltimoCapituloChange) {
        onUltimoCapituloChange(ultimoCapituloLido)
      }
    }

    carregarLeituras()
  }, [livroId, capituloInicial, capituloFinal])

  useEffect(() => {
    if (externalCapitulosLidos && externalCapitulosLidos.size > 0) {
      // Criar novo Set combinando capítulos do banco + externos
      const merged = new Set([...capitulosLidos, ...externalCapitulosLidos])

      setCapitulosLidos(merged)

      if (onProgressChange) {
        onProgressChange(merged.size, capitulos.length)
      }
    }
  }, [externalCapitulosLidos])

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="flex flex-wrap gap-3">
      {capitulos.map((cap) => (
        <div key={cap} className="flex items-center gap-2">
          <Checkbox
            id={`cap-${livroId}-${cap}`}
            checked={capitulosLidos.has(cap)}
            disabled={true}
            className="cursor-not-allowed"
          />
          <Label
            htmlFor={`cap-${livroId}-${cap}`}
            className={`text-sm font-medium ${
              onCapituloClick ? "cursor-pointer hover:text-primary hover:underline" : "cursor-not-allowed opacity-70"
            }`}
            onClick={() => onCapituloClick && onCapituloClick(cap)}
          >
            {cap}
          </Label>
        </div>
      ))}
    </div>
  )
}
