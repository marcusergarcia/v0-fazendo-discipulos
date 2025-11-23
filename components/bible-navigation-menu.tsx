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
      console.log("[v0] 📖 Carregando livros da Bíblia...")
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

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

  const livrosFiltrados = livros.filter(
    (livro) =>
      livro.nome.toLowerCase().includes(busca.toLowerCase()) ||
      livro.abreviacao.toLowerCase().includes(busca.toLowerCase()),
  )

  console.log("[v0] 🔍 Busca:", busca)
  console.log("[v0] 📚 Livros filtrados:", livrosFiltrados.length)

  const antigoTestamento = livrosFiltrados.filter((l) => {
    console.log(`[v0] 📖 Livro: ${l.nome}, Testamento: "${l.testamento}"`)
    return l.testamento?.toLowerCase().includes("antigo") || l.ordem <= 39
  })
  const novoTestamento = livrosFiltrados.filter((l) => {
    return l.testamento?.toLowerCase().includes("novo") || l.ordem > 39
  })

  console.log("[v0] 📖 Antigo Testamento:", antigoTestamento.length)
  console.log("[v0] 📖 Novo Testamento:", novoTestamento.length)

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("[v0] ⬅️ Voltando para lista de livros")
              setLivroSelecionado(null)
            }}
            className="mb-2"
          >
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
                  console.log("[v0] 📍 Navegando para:", livroSelecionado.nome, "capítulo", cap)
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
            onChange={(e) => {
              console.log("[v0] 🔍 Busca alterada:", e.target.value)
              setBusca(e.target.value)
            }}
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Antigo Testamento */}
          {antigoTestamento.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Antigo Testamento</h4>
              <div className="space-y-1">
                {antigoTestamento.map((livro) => (
                  <Button
                    key={livro.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log("[v0] 📖 Livro selecionado:", livro.nome)
                      setLivroSelecionado(livro)
                    }}
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
            </div>
          )}

          {/* Novo Testamento */}
          {novoTestamento.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Novo Testamento</h4>
              <div className="space-y-1">
                {novoTestamento.map((livro) => (
                  <Button
                    key={livro.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log("[v0] 📖 Livro selecionado:", livro.nome)
                      setLivroSelecionado(livro)
                    }}
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
            </div>
          )}

          {livrosFiltrados.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground text-sm">Nenhum livro encontrado</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
