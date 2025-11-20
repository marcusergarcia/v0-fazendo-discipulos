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
}

export function ChapterCheckboxList({
  livroId,
  capituloInicial,
  capituloFinal,
  onProgressChange,
  externalCapitulosLidos,
  onCapituloLidoChange,
}: ChapterCheckboxListProps) {
  const capitulos = Array.from({ length: capituloFinal - capituloInicial + 1 }, (_, i) => capituloInicial + i)

  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarLeituras() {
      const { leituras } = await buscarCapitulosLidos(livroId, capitulos)
      const lidos = new Set(leituras.filter((l) => l.lido).map((l) => l.numero_capitulo))
      console.log("[v0] Capítulos carregados do banco:", Array.from(lidos))
      setCapitulosLidos(lidos)
      setLoading(false)

      if (onProgressChange) {
        onProgressChange(lidos.size, capitulos.length)
      }
    }

    carregarLeituras()
  }, [livroId, capituloInicial, capituloFinal])

  useEffect(() => {
    if (externalCapitulosLidos && externalCapitulosLidos.size > 0) {
      console.log("[v0] Sincronizando com externalCapitulosLidos:", Array.from(externalCapitulosLidos))

      // Criar novo Set combinando capítulos do banco + externos
      const merged = new Set([...capitulosLidos, ...externalCapitulosLidos])
      console.log("[v0] Capítulos após merge:", Array.from(merged))

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
          <Label htmlFor={`cap-${livroId}-${cap}`} className="text-sm font-medium cursor-not-allowed opacity-70">
            {cap}
          </Label>
        </div>
      ))}
    </div>
  )
}
