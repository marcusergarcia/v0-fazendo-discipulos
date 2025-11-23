"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChapterCheckboxListProps {
  livroId: number
  capituloInicial: number
  capituloFinal: number
  onProgressChange?: (lidos: number, total: number) => void
  externalCapitulosLidos?: Set<number>
  onCapituloLidoChange?: (capitulo: number, lido: boolean) => void
  onUltimoCapituloChange?: (numeroCapitulo: number) => void
  onCapituloClick?: (numeroCapitulo: number, isLido: boolean) => void
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
  console.log("[v0] 🔷 ChapterCheckboxList: COMPONENTE RENDERIZADO")
  console.log("[v0] Props recebidos:", {
    livroId,
    capituloInicial,
    capituloFinal,
    capitulosSemana,
    externalCapitulosLidos: externalCapitulosLidos ? Array.from(externalCapitulosLidos) : [],
  })

  const capitulos = Array.from({ length: capituloFinal - capituloInicial + 1 }, (_, i) => capituloInicial + i)

  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] 🟡 ChapterCheckboxList USEEFFECT: Inicializando")

    if (externalCapitulosLidos && externalCapitulosLidos.size > 0) {
      console.log("[v0] externalCapitulosLidos (IDs):", Array.from(externalCapitulosLidos))
      console.log("[v0] capitulosSemana (IDs esperados):", capitulosSemana)

      setCapitulosLidos(externalCapitulosLidos)
      setLoading(false)

      // Contar quantos IDs da semana estão no Set
      const lidosDaSemana = capitulosSemana.filter((id) => externalCapitulosLidos.has(id))
      console.log("[v0] Capítulos LIDOS desta semana:", lidosDaSemana.length, "/", capitulos.length)
      console.log("[v0] IDs lidos da semana:", lidosDaSemana)

      if (onProgressChange) {
        onProgressChange(lidosDaSemana.length, capitulos.length)
      }
    } else {
      console.log("[v0] ⚠ Nenhum capítulo lido encontrado")
      setLoading(false)
    }
  }, [externalCapitulosLidos, capitulosSemana])

  const handleCapituloClick = (cap: number) => {
    const indice = cap - capituloInicial
    const capituloId = capitulosSemana[indice]
    const isLido = capituloId ? capitulosLidos.has(capituloId) : false

    console.log("[v0] 🖱 CLICK no capítulo")
    console.log("[v0] Número do capítulo:", cap)
    console.log("[v0] Índice no array:", indice)
    console.log("[v0] ID do capítulo (da tabela):", capituloId)
    console.log("[v0] Status isLido:", isLido)
    console.log("[v0] capitulosLidos Set completo:", Array.from(capitulosLidos))

    onCapituloClick && onCapituloClick(cap, isLido)
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="flex flex-wrap gap-3">
      {capitulos.map((cap, index) => {
        const capituloId = capitulosSemana[index]
        const isLido = capituloId ? capitulosLidos.has(capituloId) : false

        return (
          <button
            key={cap}
            onClick={() => handleCapituloClick(cap)}
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
