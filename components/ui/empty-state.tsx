import { cn } from "@/lib/utils"
import { LucideIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: "default" | "warning" | "error"
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const variantStyles = {
    default: {
      wrapper: "border-dashed border-2 border-gray-200 bg-gray-50/50",
      icon: "text-gray-300",
      title: "text-gray-700",
      desc: "text-gray-500",
    },
    warning: {
      wrapper: "border border-amber-200 bg-amber-50/60",
      icon: "text-amber-400",
      title: "text-amber-800",
      desc: "text-amber-700",
    },
    error: {
      wrapper: "border border-red-200 bg-red-50/60",
      icon: "text-red-400",
      title: "text-red-800",
      desc: "text-red-600",
    },
  }

  const s = variantStyles[variant]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl px-6 py-14",
        s.wrapper,
        className
      )}
    >
      <div className={cn("mb-4 opacity-80", s.icon)}>
        <Icon className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <h3 className={cn("font-semibold text-sm mb-1", s.title)}>{title}</h3>
      <p className={cn("text-sm max-w-xs", s.desc)}>{description}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 text-xs"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface EmptySearchStateProps {
  query?: string
  onClear?: () => void
  className?: string
}

export function EmptySearchState({
  query,
  onClear,
  className,
}: EmptySearchStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl px-6 py-14",
        "border-dashed border-2 border-gray-200 bg-gray-50/50",
        className
      )}
    >
      <div className="mb-4 opacity-80 text-gray-300">
        <Search className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <h3 className="font-semibold text-sm mb-1 text-gray-700">
        Tidak ada hasil
      </h3>
      <p className="text-sm max-w-xs text-gray-500">
        {query
          ? `Tidak ditemukan hasil untuk "${query}". Coba ubah kata kunci pencarian.`
          : "Coba ubah kata kunci pencarian."}
      </p>
      {onClear && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 text-xs"
          onClick={onClear}
        >
          Hapus pencarian
        </Button>
      )}
    </div>
  )
}
