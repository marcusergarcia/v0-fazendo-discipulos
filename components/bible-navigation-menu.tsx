"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Book, ChevronRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Livro {
  id: number
  nome: string
  abreviacao: string
  testamento: string
  total_capitulos: number
  ordem: number
}

interface BibleNavigationMenuProps {
  onNavigate: (livroId: number, livroNome: string, capitulo: number) => void
  currentLivroId?: number
  currentCapitulo?: number
  onClose?: () => void
}

export function BibleNavigationMenu({
  onNavigate,
  currentLivroId,
  currentCapitulo,
  onClose,
}: BibleNavigationMenuProps) {
  const [livros, setLivros] = useState<Livro[]>([])
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null)
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarLivros() {
      console.log("[v0] 📖 Carregando livros da Bíblia...")
      const supabase = createClient()

      const { data, error } = await supabase.from("livros_biblia").select("*").order("ordem")

      if (error) {
        console.error("[v0] ❌ Erro ao carregar livros:", error)
      } else if (data) {
        console.log("[v0] ✅ Livros carregados:", data.length)
        setLivros(data)
      }
      setLoading(false)
    }

    carregarLivros()
  }, [])

  const livrosFiltrados = busca
    ? livros.filter(
        (livro) =>
          livro.nome.toLowerCase().includes(busca.toLowerCase()) ||
          livro.abreviacao.toLowerCase().includes(busca.toLowerCase()),
      )
    : livros

  const pentateuco = livrosFiltrados.filter((l) => l.ordem >= 1 && l.ordem <= 5)
  const livrosHistoricos = livrosFiltrados.filter((l) => l.ordem >= 6 && l.ordem <= 17)
  const livrosPoeticos = livrosFiltrados.filter((l) => l.ordem >= 18 && l.ordem <= 22)
  const livrosProfeticos = livrosFiltrados.filter((l) => l.ordem >= 23 && l.ordem <= 39)
  const evangelhosAtos = livrosFiltrados.filter((l) => l.ordem >= 40 && l.ordem <= 44)
  const cartas = livrosFiltrados.filter((l) => l.ordem >= 45 && l.ordem <= 65)
  const apocalipse = livrosFiltrados.filter((l) => l.ordem === 66)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Carregando livros...</div>
      </div>
    )
  }

  if (livroSelecionado) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" onClick={() => setLivroSelecionado(null)} className="mb-2">
            ← Voltar para livros
          </Button>
          <h3 className="font-semibold">{livroSelecionado.nome}</h3>
          <p className="text-sm text-muted-foreground">Selecione um capítulo (1-{livroSelecionado.total_capitulos})</p>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: livroSelecionado.total_capitulos }, (_, i) => i + 1).map((cap) => (
              <Button
                key={cap}
                variant={currentLivroId === livroSelecionado.id && currentCapitulo === cap ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onNavigate(livroSelecionado.id, livroSelecionado.nome, cap)
                  onClose?.()
                }}
                className="h-10"
              >
                {cap}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-3">
        <h3 className="font-semibold">Navegar pela Bíblia</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar livro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {busca ? (
          // Quando há busca, mostra lista simples de resultados
          <div className="space-y-1">
            {livrosFiltrados.map((livro) => (
              <Button
                key={livro.id}
                variant="ghost"
                size="sm"
                onClick={() => setLivroSelecionado(livro)}
                className="w-full justify-between hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  {livro.nome}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  {livro.total_capitulos} cap.
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            ))}
            {livrosFiltrados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">Nenhum livro encontrado</div>
            )}
          </div>
        ) : (
          // Quando não há busca, mostra accordion por gêneros
          <Accordion type="single" collapsible className="w-full">
            {/* Pentateuco */}
            {pentateuco.length > 0 && (
              <AccordionItem value="pentateuco">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Pentateuco ({pentateuco.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-2">
                    {pentateuco.map((livro) => (
                      <Button
                        key={livro.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setLivroSelecionado(livro)}
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {livro.nome}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {livro.total_capitulos} cap.
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Livros Históricos */}
            {livrosHistoricos.length > 0 && (
              <AccordionItem value="historicos">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Livros Históricos ({livrosHistoricos.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-2">
                    {livrosHistoricos.map((livro) => (
                      <Button
                        key={livro.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setLivroSelecionado(livro)}
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {livro.nome}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {livro.total_capitulos} cap.
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Livros Poéticos */}
            {livrosPoeticos.length > 0 && (
              <AccordionItem value="poeticos">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Livros Poéticos ({livrosPoeticos.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-2">
                    {livrosPoeticos.map((livro) => (
                      <Button
                        key={livro.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setLivroSelecionado(livro)}
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {livro.nome}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {livro.total_capitulos} cap.
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Livros Proféticos */}
            {livrosProfeticos.length > 0 && (
              <AccordionItem value="profeticos">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Livros Proféticos ({livrosProfeticos.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-2">
                    {livrosProfeticos.map((livro) => (
                      <Button
                        key={livro.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setLivroSelecionado(livro)}
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {livro.nome}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {livro.total_capitulos} cap.
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Evangelhos e Atos */}
            {evangelhosAtos.length > 0 && (
              <AccordionItem value="evangelhos">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Evangelhos e Atos ({evangelhosAtos.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-2">
                    {evangelhosAtos.map((livro) => (
                      <Button
                        key={livro.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setLivroSelecionado(livro)}
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {livro.nome}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {livro.total_capitulos} cap.
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Cartas */}
            {cartas.length > 0 && (
              <AccordionItem value="cartas">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Cartas ({cartas.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-2">
                    {cartas.map((livro) => (
                      <Button
                        key={livro.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setLivroSelecionado(livro)}
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {livro.nome}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {livro.total_capitulos} cap.
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Apocalipse */}
            {apocalipse.length > 0 && (
              <AccordionItem value="apocalipse">
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  Apocalipse ({apocalipse.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pt-2">
                    {apocalipse.map((livro) => (
                      <Button
                        key={livro.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setLivroSelecionado(livro)}
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          {livro.nome}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          {livro.total_capitulos} cap.
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>
    </div>
  )
}
