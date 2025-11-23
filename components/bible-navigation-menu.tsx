"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search, Book, ChevronRight } from "lucide-react"

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
}

export function BibleNavigationMenu({ onNavigate, currentLivroId, currentCapitulo }: BibleNavigationMenuProps) {
  const [livros, setLivros] = useState<Livro[]>([])
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null)
  const [busca, setBusca] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarLivros() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase.from("livros_biblia").select("*").order("ordem")

      if (!error && data) {
        setLivros(data)
      }
      setLoading(false)
    }

    carregarLivros()
  }, [])

  const livrosFiltrados = livros.filter(
    (livro) =>
      livro.nome.toLowerCase().includes(busca.toLowerCase()) ||
      livro.abreviacao.toLowerCase().includes(busca.toLowerCase()),
  )

  const testamentos = {
    "Antigo Testamento": livrosFiltrados.filter((l) => l.testamento === "Antigo Testamento"),
    "Novo Testamento": livrosFiltrados.filter((l) => l.testamento === "Novo Testamento"),
  }

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
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: livroSelecionado.total_capitulos }, (_, i) => i + 1).map((cap) => (
              <Button
                key={cap}
                variant={currentLivroId === livroSelecionado.id && currentCapitulo === cap ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  onNavigate(livroSelecionado.id, livroSelecionado.nome, cap)
                }}
                className="h-10"
              >
                {cap}
              </Button>
            ))}
          </div>
        </ScrollArea>
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
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(testamentos).map(([testamento, livrosTestamento]) => (
            <div key={testamento}>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">{testamento}</h4>
              <div className="space-y-1">
                {livrosTestamento.map((livro) => (
                  <Button
                    key={livro.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => setLivroSelecionado(livro)}
                    className="w-full justify-between"
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
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
