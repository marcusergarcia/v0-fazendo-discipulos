import { Award } from 'lucide-react'

interface ArmorPieceProps {
  name: string
  unlocked: boolean
  level: number
  description: string
}

export function ArmorPiece({ name, unlocked, level, description }: ArmorPieceProps) {
  return (
    <div
      className={`p-3 rounded-lg border ${unlocked ? "bg-accent/10 border-accent" : "bg-muted border-muted-foreground/20"}`}
    >
      <div className="flex items-center gap-3">
        {unlocked ? (
          <Award className="w-5 h-5 text-accent flex-shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className={`font-medium text-sm ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}
