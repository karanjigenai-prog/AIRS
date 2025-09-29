"use client"

import { useState, useEffect } from "react"

interface AnimatedCounterProps {
  from?: number
  to: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  suffix = "",
  prefix = "",
  className = ""
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentCount = from + (to - from) * easeOutCubic
      
      setCount(Math.floor(currentCount))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(to)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [from, to, duration])

  return (
    <span className={`transition-all duration-500 ${className}`}>
      {prefix}{count}{suffix}
    </span>
  )
}