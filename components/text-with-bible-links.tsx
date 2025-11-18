"use client"

import { detectBibleReferences } from "@/lib/bible-verses"
import { BibleVerseLink } from "./bible-verse-link"

type TextWithBibleLinksProps = {
  text: string
  className?: string
}

export function TextWithBibleLinks({ text, className }: TextWithBibleLinksProps) {
  const parts = detectBibleReferences(text)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.isReference && part.referencia) {
          return (
            <BibleVerseLink key={index} referencia={part.referencia}>
              {part.text}
            </BibleVerseLink>
          )
        }
        return <span key={index}>{part.text}</span>
      })}
    </span>
  )
}
