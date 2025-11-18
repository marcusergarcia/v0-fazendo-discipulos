"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookOpen } from 'lucide-react'
import { getVerse, type BibleVerse } from "@/lib/bible-verses"

type BibleVerseLinkProps = {
  referencia: string
  children: React.ReactNode
}

export function BibleVerseLink({ referencia, children }: BibleVerseLinkProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const versiculo = getVerse(referencia)

  if (!versiculo) {
    return <span>{children}</span>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAberto(true)}
        className="text-primary underline decoration-dashed underline-offset-4 hover:decoration-solid transition-all cursor-pointer font-medium"
      >
        {children}
      </button>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {versiculo.referencia}
            </DialogTitle>
            <DialogDescription>Nova Versão Internacional (NVI)</DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <p className="text-lg leading-relaxed italic">
              "{versiculo.texto}"
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setModalAberto(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
