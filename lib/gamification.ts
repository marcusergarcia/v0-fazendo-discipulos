export interface LevelInfo {
  level: number
  name: string
  xpMin: number
  xpMax: number
  color: string
  icon: string
}

export interface BadgeInfo {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'comum' | 'raro' | 'epico' | 'lendario'
  color: string
}

// Sistema de níveis
export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Explorador', xpMin: 0, xpMax: 1000, color: 'bg-gray-500', icon: '🌱' },
  { level: 2, name: 'Discípulo', xpMin: 1000, xpMax: 3000, color: 'bg-blue-500', icon: '📖' },
  { level: 3, name: 'Guerreiro', xpMin: 3000, xpMax: 6000, color: 'bg-purple-500', icon: '⚔️' },
  { level: 4, name: 'Servo Mestre', xpMin: 6000, xpMax: 10000, color: 'bg-orange-500', icon: '👑' },
  { level: 5, name: 'Multiplicador', xpMin: 10000, xpMax: 999999, color: 'bg-yellow-500', icon: '✨' }
]

export function getLevelInfo(xp: number): LevelInfo {
  return LEVELS.find(level => xp >= level.xpMin && xp < level.xpMax) || LEVELS[0]
}

export function calculateXpProgress(xp: number): { current: number, max: number, percentage: number } {
  const levelInfo = getLevelInfo(xp)
  const current = xp - levelInfo.xpMin
  const max = levelInfo.xpMax - levelInfo.xpMin
  const percentage = (current / max) * 100
  
  return { current, max, percentage }
}

// Badges por passo
export const STEP_BADGES: Record<number, BadgeInfo> = {
  1: {
    id: 'criacao',
    name: 'Criação',
    description: 'Compreendeu o propósito da criação',
    icon: '🌍',
    rarity: 'comum',
    color: 'bg-green-500'
  },
  2: {
    id: 'amor-divino',
    name: 'Amor Divino',
    description: 'Descobriu o amor de Deus',
    icon: '❤️',
    rarity: 'comum',
    color: 'bg-red-500'
  },
  3: {
    id: 'verdade',
    name: 'Reconhecimento da Verdade',
    description: 'Reconheceu a realidade do pecado',
    icon: '💡',
    rarity: 'comum',
    color: 'bg-yellow-500'
  },
  4: {
    id: 'consciencia',
    name: 'Consciência',
    description: 'Compreendeu as consequências do pecado',
    icon: '⚠️',
    rarity: 'raro',
    color: 'bg-orange-500'
  },
  5: {
    id: 'salvador',
    name: 'Salvador',
    description: 'Encontrou Jesus como solução',
    icon: '✝️',
    rarity: 'raro',
    color: 'bg-blue-500'
  },
  6: {
    id: 'cruz-ressurreicao',
    name: 'Cruz e Ressurreição',
    description: 'Compreendeu o sacrifício de Cristo',
    icon: '🕊️',
    rarity: 'epico',
    color: 'bg-purple-500'
  },
  7: {
    id: 'graca',
    name: 'Graça',
    description: 'Experimentou a graça salvadora',
    icon: '🌟',
    rarity: 'epico',
    color: 'bg-indigo-500'
  },
  8: {
    id: 'coracao-quebrantado',
    name: 'Coração Quebrantado',
    description: 'Viveu o arrependimento genuíno',
    icon: '💔',
    rarity: 'epico',
    color: 'bg-pink-500'
  },
  9: {
    id: 'confissao',
    name: 'Confissão',
    description: 'Confessou Jesus como Senhor',
    icon: '📣',
    rarity: 'lendario',
    color: 'bg-teal-500'
  },
  10: {
    id: 'novo-nascimento',
    name: 'Novo Nascimento',
    description: 'Celebrou a vida em Cristo',
    icon: '👶',
    rarity: 'lendario',
    color: 'bg-amber-500'
  }
}

export function getBadgeForStep(step: number): BadgeInfo | undefined {
  return STEP_BADGES[step]
}

// Cálculo de XP por atividade
export const XP_VALUES = {
  VIDEO_WATCHED: 10,
  ARTICLE_READ: 15,
  REFLECTION_COMPLETED: 30,
  QUESTION_ANSWERED: 50,
  MISSION_COMPLETED: 50,
  STEP_COMPLETED: 100
}
