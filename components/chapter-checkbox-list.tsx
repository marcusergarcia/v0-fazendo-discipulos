'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  marcarCapituloLido,
  desmarcarCapituloLido,
  buscarCapitulosLidos,
} from '@/app/dashboard/leitura-biblica/actions'

interface ChapterCheckboxListProps {
  livroId: number
  capituloInicial: number
  capituloFinal: number
  onProgressChange?: (lidos: number, total: number) => void
}

export function ChapterCheckboxList({
  livroId,
  capituloInicial,
  capituloFinal,
  onProgressChange,
}: ChapterCheckboxListProps) {
  const capitulos = Array.from(
    { length: capituloFinal - capituloInicial + 1 },
    (_, i) => capituloInicial + i
  )

  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarLeituras() {
      const { leituras } = await buscarCapitulosLidos(livroId, capitulos)
      const lidos = new Set(
        leituras.filter((l) => l.lido).map((l) => l.numero_capitulo)
      )
      setCapitulosLidos(lidos)
      setLoading(false)

      if (onProgressChange) {
        onProgressChange(lidos.size, capitulos.length)
      }
    }

    carregarLeituras()
  }, [livroId, capituloInicial, capituloFinal])

  const handleCheckChange = async (capitulo: number, checked: boolean) => {
    if (checked) {
      await marcarCapituloLido(livroId, capitulo, 0)
      setCapitulosLidos((prev) => new Set([...prev, capitulo]))
    } else {
      await desmarcarCapituloLido(livroId, capitulo)
      setCapitulosLidos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(capitulo)
        return newSet
      })
    }

    if (onProgressChange) {
      const novoTotal = checked
        ? capitulosLidos.size + 1
        : capitulosLidos.size - 1
      onProgressChange(novoTotal, capitulos.length)
    }
  }

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
            onCheckedChange={(checked) =>
              handleCheckChange(cap, checked as boolean)
            }
          />
          <Label
            htmlFor={`cap-${livroId}-${cap}`}
            className="text-sm font-medium cursor-pointer"
          >
            {cap}
          </Label>
        </div>
      ))}
    </div>
  )
}
