'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Book } from 'lucide-react'
import type { LeituraSemanal } from '@/constants/plano-leitura-biblica'
import { ChapterCheckboxList } from '@/components/chapter-checkbox-list'
import { Button } from '@/components/ui/button'
import { BibleReaderWithAutoCheck } from '@/components/bible-reader-with-auto-check'
import { LIVROS_MAP } from '@/lib/livros-map'

export default function LeituraBiblicaClient({
  leituraAtual,
  discipuloId,
  leituraJaConfirmada
}: LeituraBiblicaClientProps) {
  const [mostrarTexto, setMostrarTexto] = useState(false)
  const [chaptersRead, setChaptersRead] = useState(0)
  const [totalChapters, setTotalChapters] = useState(leituraAtual.totalCapitulos)
  const [capitulosLidos, setCapitulosLidos] = useState<Set<number>>(new Set())

  const handleProgressChange = (lidos: number, total: number) => {
    setChaptersRead(lidos)
    setTotalChapters(total)
  }

  const handleChapterRead = (chapter: number) => {
    setCapitulosLidos(prev => new Set([...prev, chapter]))
    // Atualizar contagem
    setChaptersRead(prev => prev + 1)
  }

  const allChaptersRead = chaptersRead === totalChapters && totalChapters > 0

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
          <div className="text-lg font-semibold mb-2">
            📖 {leituraAtual.livro} {leituraAtual.capituloInicio}
            {leituraAtual.capituloFim !== leituraAtual.capituloInicio && `-${leituraAtual.capituloFim}`}
          </div>
          <div className="text-muted-foreground">{leituraAtual.descricao}</div>
          <div className="text-sm text-muted-foreground mt-2">
            📚 Total: {totalChapters} capítulo{totalChapters > 1 ? 's' : ''}
            {chaptersRead > 0 && (
              <span className="ml-2 text-primary font-semibold">
                • {chaptersRead} lido{chaptersRead > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium">Marque os capítulos lidos:</div>
          <ChapterCheckboxList
            livroId={LIVROS_MAP[leituraAtual.livro] || 1}
            capituloInicial={leituraAtual.capituloInicio}
            capituloFinal={leituraAtual.capituloFim}
            onProgressChange={handleProgressChange}
          />
        </div>

        <Button
          onClick={() => setMostrarTexto(!mostrarTexto)}
          variant="outline"
          className="w-full gap-2"
        >
          <Book className="w-4 h-4" />
          {mostrarTexto ? 'Ocultar Texto Bíblico' : 'Ler Aqui (ACF)'}
        </Button>

        {mostrarTexto && (
          <div className="mt-4">
            <BibleReaderWithAutoCheck
              bookName={leituraAtual.livro}
              livroId={LIVROS_MAP[leituraAtual.livro] || 1}
              startChapter={leituraAtual.capituloInicio}
              endChapter={leituraAtual.capituloFim}
              capitulosLidos={capitulosLidos}
              onChapterRead={handleChapterRead}
            />
          </div>
        )}

        {allChaptersRead && (
          <div className="bg-accent/10 border border-accent rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
            <div>
              <div className="font-semibold text-accent">Todos os capítulos lidos!</div>
              <div className="text-sm text-muted-foreground">
                Parabéns! Você completou a leitura desta semana. XP será creditado automaticamente.
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          💡 Dica: Role até o fim de cada capítulo e aguarde 3 minutos para marcar automaticamente
        </div>
      </CardContent>
    </Card>
  )
}
