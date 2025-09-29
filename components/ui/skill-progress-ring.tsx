"use client"

import { useState, useEffect } from "react"

interface SkillProgressRingProps {
  skill: string
  progress: number
  level: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function SkillProgressRing({
  skill,
  progress,
  level,
  size = 120,
  strokeWidth = 8,
  className = ""
}: SkillProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [progress])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedProgress / 100) * circumference

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert': return '#10b981' // green
      case 'intermediate': return '#f59e0b' // amber
      case 'beginner': return '#ef4444' // red
      default: return '#6b7280' // gray
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getLevelColor(level)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{progress}%</span>
          <span className="text-xs text-gray-500 capitalize">{level}</span>
        </div>
      </div>
      
      <span className="mt-2 text-sm font-medium text-center text-gray-700">
        {skill}
      </span>
    </div>
  )
}