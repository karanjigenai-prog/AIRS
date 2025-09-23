"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react"

interface NotificationToastProps {
  title: string
  message: string
  type?: "success" | "warning" | "info" | "reminder"
  duration?: number
  onClose?: () => void
}

export function NotificationToast({ title, message, type = "info", duration = 5000, onClose }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-primary" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "reminder":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-l-primary"
      case "warning":
        return "border-l-orange-500"
      case "reminder":
        return "border-l-blue-500"
      default:
        return "border-l-blue-500"
    }
  }

  if (!isVisible) return null

  return (
    <Card
      className={`fixed top-4 right-4 z-50 w-80 border-l-4 ${getBorderColor()} shadow-lg animate-in slide-in-from-right-full`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false)
              onClose?.()
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
