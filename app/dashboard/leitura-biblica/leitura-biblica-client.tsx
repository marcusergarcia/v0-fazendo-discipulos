'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Sparkles, Book } from 'lucide-react'
import type { LeituraSemanal } from '@/constants/plano-leitura-biblica'
import { confirmarLeituraAction } from './actions'
import { BibleReader } from '@/components/bible-reader'

interface LeituraBiblicaClientProps {
  leituraAtual: LeituraSemanal
  discipuloId: string
  leituraJaConfirmada: boolean
}

export default function LeituraBiblicaClient({
  leituraAtual,
  discipuloId,
  leituraJaConfirmada
}: LeituraBiblicaClientProps) {
  const [confirmada, setConfirmada] = useState(leituraJaConfirmada)
  const [confirmando, setConfirmando] = useState(false)
  const [mostrandoBiblia, setMostrandoBiblia] = useState(false)

  const handleConfirmarLeitura = async () => {
    setConfirmando(true)
    try {
      const result = await confirmarLeituraAction({
        discipuloId,
        semananum: leituraAtual.semana,
        livro: leituraAtual.livro,
        capituloInicio: leituraAtual.capituloInicio,
        capituloFim: leituraAtual.capituloFim
      })

      if (result.success) {
        setConfirmada(true)
        const confetti = (await import('canvas-confetti')).default
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    } catch (error) {
      console.error('[v0] Erro ao confirmar leitura:', error)
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <Card className="mb-8 border-2 border-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Leitura da Semana {leituraAtual.semana}</CardTitle>
            <CardDescription className="text-lg mt-1">{leituraAtual.tema}</CardDescription>
          </div>
          <Badge className="text-sm">{leituraAtual.fase}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-lg font-semibold mb-2">
            📖 {leituraAtual.livro} {leituraAtual.capituloInicio}
            {leituraAtual.capituloFim !== leituraAtual.capituloInicio && `-${leituraAtual.capituloFim}`}
          </p>
          <p className="text-muted-foreground">{leituraAtual.descricao}</p>
          <p className="text-sm text-muted-foreground mt-2">
            📚 Total: {leituraAtual.totalCapitulos} capítulo{leituraAtual.totalCapitulos > 1 ? 's' : ''}
          </p>
        </div>

        <Button
          onClick={() => setMostrandoBiblia(!mostrandoBiblia)}
          variant="outline"
          className="w-full gap-2"
          size="lg"
        >
          <Book className="w-4 h-4" />
          {mostrandoBiblia ? 'Ocultar Texto Bíblico' : 'Ler Aqui (NVI)'}
        </Button>

        {mostrandoBiblia && (
          <BibleReader
            bookName={leituraAtual.livro}
            startChapter={leituraAtual.capituloInicio}
            endChapter={leituraAtual.capituloFim}
          />
        )}

        {confirmada ? (
          <div className="bg-accent/10 border border-accent rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
            <div>
              <p className="font-semibold text-accent">Leitura Confirmada!</p>
              <p className="text-sm text-muted-foreground">Você ganhou 10 XP</p>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleConfirmarLeitura}
            disabled={confirmando}
            className="w-full gap-2"
            size="lg"
          >
            {confirmando ? (
              'Confirmando...'
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Confirmar que Li
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center">
          💡 Dica: Separe 15-20 minutos por dia para sua leitura bíblica
        </p>
      </CardContent>
    </Card>
  )
}
