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
  capitulosLidos: Set<number>
  onChapterRead: (capituloId: number) => void
}

export function ProgressoAnualClient({ children, capitulosLidos, onChapterRead }: ProgressoAnualClientProps) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [leitorAberto, setLeitorAberto] = useState(false)
  const [livroId, setLivroId] = useState(1)
  const [livroNome, setLivroNome] = useState("Gênesis")
  const [capituloInicial, setCapituloInicial] = useState(1)

  const handleNavigateToChapter = (novoLivroId: number, novoLivroNome: string, novoCapitulo: number) => {
    console.log("[v0] 📚 Navegação livre INICIADA")
    console.log("[v0] Parâmetros recebidos:", { novoLivroId, novoLivroNome, novoCapitulo })
    setLivroId(novoLivroId)
    setLivroNome(novoLivroNome)
    setCapituloInicial(novoCapitulo)
    setMenuAberto(false)
    setLeitorAberto(true)
  }

  const handleChapterRead = (capituloId: number) => {
    console.log("[v0] 📚 Capítulo marcado como lido - ID:", capituloId)
    onChapterRead(capituloId)
    // Fechar o leitor
    setLeitorAberto(false)
    // Aguardar um momento para garantir que o estado foi atualizado
    setTimeout(() => {
      // Router refresh ao invés de window.location.reload para manter o estado
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
            capitulosLidos={capitulosLidos} // Passar os capítulos lidos reais
            onChapterRead={handleChapterRead} // Usar callback atualizado
            capituloInicialJaLido={false}
            capitulosSemana={[]} // Array vazio indica modo de navegação livre
            initialChapter={capituloInicial}
            onClose={() => setLeitorAberto(false)}
            onNavigateToChapter={handleNavigateToChapter}
            modoNavegacaoLivre={true} // Flag para modo de navegação livre
          />
        </div>
      )}
    </>
  )
}
