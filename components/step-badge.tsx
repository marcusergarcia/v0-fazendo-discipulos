import {
  Sparkles,
  Heart,
  AlertTriangle,
  Skull,
  Cross,
  Church,
  HandHeart,
  MessageCircleHeart,
  UserCheck,
  Baby,
  BookOpen,
  Shield,
  Droplets,
  Flame,
  Users,
  Megaphone,
  GitBranch,
  Zap,
  Calendar,
  GraduationCap,
  Award,
} from "lucide-react"

interface StepBadgeProps {
  stepNumber: number
  status: "completed" | "current" | "locked"
  size?: "sm" | "md" | "lg" | "xl"
}

export function StepBadge({ stepNumber, status, size = "md" }: StepBadgeProps) {
  const badges = {
    1: { icon: Sparkles, color: "text-blue-600", bgGradient: "from-blue-400 to-blue-600", name: "Criação" },
    2: { icon: Heart, color: "text-red-600", bgGradient: "from-red-400 to-red-600", name: "Amor Divino" },
    3: { icon: AlertTriangle, color: "text-orange-600", bgGradient: "from-orange-400 to-orange-600", name: "Pecado" },
    4: { icon: Skull, color: "text-gray-700", bgGradient: "from-gray-500 to-gray-700", name: "Consequência" },
    5: { icon: Cross, color: "text-purple-700", bgGradient: "from-purple-500 to-purple-700", name: "Provisão Divina" },
    6: { icon: Church, color: "text-indigo-700", bgGradient: "from-indigo-500 to-indigo-700", name: "Ressurreição" },
    7: { icon: HandHeart, color: "text-pink-700", bgGradient: "from-pink-500 to-pink-700", name: "Graça e Fé" },
    8: { icon: MessageCircleHeart, color: "text-teal-700", bgGradient: "from-teal-500 to-teal-700", name: "Compaixão" },
    9: { icon: UserCheck, color: "text-green-700", bgGradient: "from-green-500 to-green-700", name: "Confessar Jesus" },
    10: { icon: Baby, color: "text-amber-700", bgGradient: "from-amber-500 to-amber-700", name: "Novo Nascimento" },

    // Baptism steps (11-22)
    11: { icon: BookOpen, color: "text-blue-700", bgGradient: "from-blue-500 to-blue-700", name: "Batismo na Bíblia" },
    12: {
      icon: Shield,
      color: "text-emerald-700",
      bgGradient: "from-emerald-500 to-emerald-700",
      name: "Graça, Não Obras",
    },
    13: {
      icon: Droplets,
      color: "text-cyan-700",
      bgGradient: "from-cyan-500 to-cyan-700",
      name: "Quem Pode Ser Batizado",
    },
    14: { icon: Flame, color: "text-orange-700", bgGradient: "from-orange-500 to-orange-700", name: "Simbolismo" },
    15: {
      icon: Users,
      color: "text-violet-700",
      bgGradient: "from-violet-500 to-violet-700",
      name: "Batismo por Imersão",
    },
    16: {
      icon: GitBranch,
      color: "text-indigo-700",
      bgGradient: "from-indigo-500 to-indigo-700",
      name: "Nome da Trindade",
    },
    17: {
      icon: Church,
      color: "text-purple-700",
      bgGradient: "from-purple-500 to-purple-700",
      name: "Batismo e Igreja",
    },
    18: {
      icon: Megaphone,
      color: "text-rose-700",
      bgGradient: "from-rose-500 to-rose-700",
      name: "Testemunho Público",
    },
    19: { icon: Zap, color: "text-yellow-700", bgGradient: "from-yellow-500 to-yellow-700", name: "Urgência" },
    20: { icon: Calendar, color: "text-sky-700", bgGradient: "from-sky-500 to-sky-700", name: "Preparação" },
    21: {
      icon: GraduationCap,
      color: "text-teal-700",
      bgGradient: "from-teal-500 to-teal-700",
      name: "Testemunho de Fé",
    },
    22: { icon: Award, color: "text-amber-700", bgGradient: "from-amber-500 to-amber-700", name: "Compromisso Final" },
  }

  const badge = badges[stepNumber as keyof typeof badges] || badges[1]
  const Icon = badge.icon

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  }

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
  }

  const getStatusStyles = () => {
    if (status === "locked") {
      return "opacity-40 grayscale"
    }
    if (status === "current") {
      return "ring-4 ring-primary ring-offset-4 ring-offset-background animate-pulse"
    }
    return "opacity-100 hover:scale-105"
  }

  return (
    <div
      className={`
        relative
        ${sizeClasses[size]} 
        ${getStatusStyles()}
        rounded-full 
        flex 
        items-center 
        justify-center 
        transition-all 
        duration-300
        cursor-pointer
        group
      `}
      title={badge.name}
    >
      {/* Outer glow */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.bgGradient} opacity-20 blur-md`} />

      {/* Shadow layer */}
      <div className="absolute inset-0 rounded-full bg-black/10 translate-y-1" />

      {/* Main badge circle with gradient */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.bgGradient} shadow-xl`} />

      {/* Highlight shine effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />

      {/* Border ring */}
      <div className="absolute inset-0 rounded-full border-4 border-white/30" />

      {/* Inner border */}
      <div className="absolute inset-2 rounded-full border-2 border-white/20" />

      {/* Icon container */}
      <div className="relative z-10 flex items-center justify-center">
        <Icon className={`${iconSizes[size]} text-white drop-shadow-lg`} strokeWidth={2.5} />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{badge.name}</div>
      </div>
    </div>
  )
}
