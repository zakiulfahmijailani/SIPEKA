"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center bg-white border-2 border-dashed rounded-2xl space-y-4",
      className
    )}>
      <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
        <Icon className="h-10 w-10" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  )
}
