"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BibleNavigationMenu } from "@/components/bible-navigation-menu"
import { BibleReaderWithAutoCheck } from "@/components/bible-reader-with-auto-check"

interface ProgressoAnualClientProps {
  children: React.ReactNode
  capitulosLidos: number[]
  onChapterRead: (capituloId: number) => void
}

export function ProgressoAnualClient({ children, capitulosLidos, onChapterRead }: ProgressoAnualClientProps) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [leitorAberto, setLeitorAberto] = useState(false)
  const [livroId, setLivroId] = useState(1)
  const [livroNome, setLivroNome] = useState("Gênesis")
  const [capituloInicial, setCapituloInicial] = useState(1)

  const handleNavigateToChapter = (novoLivroId: number, novoLivroNome: string, novoCapitulo: number) => {
    setLivroId(novoLivroId)
    setLivroNome(novoLivroNome)
    setCapituloInicial(novoCapitulo)
    setMenuAberto(false)
    setLeitorAberto(true)
  }

  const handleChapterRead = (capituloId: number) => {
    onChapterRead(capituloId)
    setLeitorAberto(false)
    setTimeout(() => {
      window.location.href = window.location.href
    }, 1000)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        {children}
        {/* Menu hamburguer para navegação livre */}
        <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="w-4 h-4 mr-2" />
              Navegar pela Bíblia
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-96 p-0">
            <BibleNavigationMenu
              onNavigate={handleNavigateToChapter}
              currentLivroId={livroId}
              currentCapitulo={capituloInicial}
              onClose={() => setMenuAberto(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Leitor bíblico */}
      {leitorAberto && (
        <div className="mt-4">
          <BibleReaderWithAutoCheck
            bookName={livroNome}
            livroId={livroId}
            startChapter={capituloInicial}
            endChapter={capituloInicial}
            capitulosLidos={new Set(capitulosLidos)}
            onChapterRead={handleChapterRead}
            capituloInicialJaLido={false}
            capitulosSemana={[]}
            initialChapter={capituloInicial}
            onClose={() => setLeitorAberto(false)}
            onNavigateToChapter={handleNavigateToChapter}
            modoNavegacaoLivre={true}
          />
        </div>
      )}
    </>
  )
}
