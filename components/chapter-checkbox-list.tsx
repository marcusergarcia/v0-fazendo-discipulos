"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { buscarCapitulosLidos } from "@/app/dashboard/leitura-biblica/actions"
import { cn } from "@/lib/utils"

interface ChapterCheckboxListProps {
  livroId: number
  capituloInicial: number
  capituloFinal: number
  onProgressChange?: (lidos: number, total: number) => void
  externalCapitulosLidos?: Set<number>
  onCapituloLidoChange?: (capitulo: number, lido: boolean) => void
  onUltimoCapituloChange?: (numeroCapitulo: number) => void
  onCapituloClick?: (numeroCapitulo: number) => void
  capitulosSemana?: number[]
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
  capitulosSemana = [],
}: ChapterCheckboxListProps) {
  const capitulos = Array.from({ length: capituloFinal - capituloInicial + 1 }, (_, i) => capituloInicial + i)

  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarLeituras() {
      console.log("[v0] ChapterCheckboxList: Carregando capítulos lidos para livro", livroId, "capítulos", capitulos)

      const { leituras, ultimoCapituloLido } = await buscarCapitulosLidos(livroId, capitulos)
      const lidos = new Set(leituras.filter((l) => l.lido).map((l) => l.numero_capitulo))

      console.log("[v0] ChapterCheckboxList: Capítulos lidos carregados:", Array.from(lidos))

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
      {capitulos.map((cap) => {
        const isLido = capitulosLidos.has(cap)

        return (
          <button
            key={cap}
            onClick={() => {
              console.log("[v0] ChapterCheckboxList: Clicou no capítulo", cap, "isLido:", isLido)
              onCapituloClick && onCapituloClick(cap)
            }}
            disabled={!onCapituloClick}
            className={cn(
              "relative flex items-center justify-center w-10 h-10 rounded-md border-2 transition-all",
              "hover:scale-110 hover:shadow-md",
              isLido
                ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
              onCapituloClick ? "cursor-pointer" : "cursor-not-allowed opacity-50",
            )}
            title={isLido ? `Capítulo ${cap} - Lido` : `Capítulo ${cap} - Clique para ler`}
          >
            <span className="font-semibold text-sm">{cap}</span>
            {isLido && (
              <Check className="absolute -top-1 -right-1 w-4 h-4 text-green-500 bg-white dark:bg-gray-900 rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
