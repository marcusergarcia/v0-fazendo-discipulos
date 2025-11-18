'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { getLevelInfo, calculateXpProgress } from '@/lib/gamification'

interface XPProgressBarProps {
  currentXP: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function XPProgressBar({ currentXP, showDetails = true, size = 'md' }: XPProgressBarProps) {
  const levelInfo = getLevelInfo(currentXP)
  const progress = calculateXpProgress(currentXP)

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const height = heights[size]

  return (
    <div className="space-y-2">
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{levelInfo.icon}</span>
            <span className="font-bold">Nível {levelInfo.level}: {levelInfo.name}</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-primary font-semibold"
          >
            <Sparkles className="w-4 h-4" />
            <span>{progress.current} / {progress.max} XP</span>
          </motion.div>
        </div>
      )}
      
      <div className="relative">
        <Progress value={progress.percentage} className={height} />
        
        {/* Efeito de brilho ao ganhar XP */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full blur-sm"
        />
      </div>
    </div>
  )
}
