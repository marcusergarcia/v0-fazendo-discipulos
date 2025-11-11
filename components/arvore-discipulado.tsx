"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useEffect, useRef } from "react"

interface DiscipuloNode {
  id: string
  userId: string
  discipuladorId: string | null
  nome: string
  foto: string | null
  nivel: string
  fase: number
  xp: number
  discipuladorNome: string | null
  isCurrentUser: boolean
}

interface ArvoreDiscipuladoProps {
  data: DiscipuloNode[]
  currentUserId: string
}

export function ArvoreDiscipulado({ data, currentUserId }: ArvoreDiscipuladoProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Construir hierarquia
  const buildTree = () => {
    const nodeMap = new Map<string, DiscipuloNode & { children: DiscipuloNode[] }>()

    // Criar mapa de nós
    data.forEach((node) => {
      nodeMap.set(node.userId, { ...node, children: [] })
    })

    // Construir relacionamentos
    const roots: (DiscipuloNode & { children: DiscipuloNode[] })[] = []

    data.forEach((node) => {
      const currentNode = nodeMap.get(node.userId)
      if (!currentNode) return

      if (node.discipuladorId) {
        const parent = nodeMap.get(node.discipuladorId)
        if (parent) {
          parent.children.push(currentNode)
        } else {
          roots.push(currentNode)
        }
      } else {
        roots.push(currentNode)
      }
    })

    return roots
  }

  const renderNode = (node: DiscipuloNode & { children: DiscipuloNode[] }, level = 0): React.ReactNode => {
    const isCurrentUser = node.userId === currentUserId
    const isDiscipulador = data.some((d) => d.userId === currentUserId && d.discipuladorId === node.userId)
    const isDiscipulo = node.discipuladorId === currentUserId

    const getBorderColor = () => {
      if (isCurrentUser) return "border-primary ring-2 ring-primary/20"
      if (isDiscipulador) return "border-secondary"
      if (isDiscipulo) return "border-accent"
      return "border-muted"
    }

    const getBgColor = () => {
      if (isCurrentUser) return "bg-primary/5"
      if (isDiscipulador) return "bg-secondary/5"
      if (isDiscipulo) return "bg-accent/5"
      return "bg-card"
    }

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Nó */}
        <Card className={`p-4 w-64 ${getBorderColor()} ${getBgColor()} transition-all hover:shadow-lg`}>
          <div className="flex flex-col items-center text-center gap-2">
            <Avatar className="w-16 h-16">
              {node.foto ? (
                <AvatarImage src={node.foto || "/placeholder.svg"} alt={node.nome} />
              ) : (
                <AvatarFallback className={isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
                  {node.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>

            <div>
              <h3 className="font-semibold">
                {node.nome}
                {isCurrentUser && (
                  <Badge variant="default" className="ml-2 text-xs">
                    Você
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {node.nivel} - Fase {node.fase}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{node.xp} XP</span>
            </div>

            {node.discipuladorNome && (
              <p className="text-xs text-muted-foreground">
                Discipulador: <span className="font-medium">{node.discipuladorNome}</span>
              </p>
            )}
          </div>
        </Card>

        {/* Linha para os filhos */}
        {node.children.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-8 bg-border"></div>
            <div className="flex gap-8 relative">
              {/* Linha horizontal conectando filhos */}
              {node.children.length > 1 && (
                <div
                  className="absolute top-0 h-0.5 bg-border"
                  style={{
                    left: "calc(50% - " + ((node.children.length - 1) * 144) / 2 + "px)",
                    width: (node.children.length - 1) * 144 + "px",
                  }}
                ></div>
              )}

              {/* Renderizar filhos */}
              {node.children.map((child, index) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-border"></div>
                  {renderNode(child, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const tree = buildTree()

  useEffect(() => {
    // Centralizar scroll no usuário atual
    if (containerRef.current) {
      const currentUserElement = containerRef.current.querySelector('[data-current-user="true"]')
      if (currentUserElement) {
        currentUserElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="overflow-x-auto pb-8">
      <div className="flex flex-col gap-8 min-w-max p-8">
        {tree.length > 0 ? (
          tree.map((root) => renderNode(root))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum discipulado registrado ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}
