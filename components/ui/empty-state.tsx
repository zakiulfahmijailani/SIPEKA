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
  secondaryAction?: {
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
  secondaryAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const variantStyles = {
    default: {
      wrapper: "bg-white border border-gray-100",
      iconBg: "bg-gray-50",
      icon: "text-gray-300",
      title: "text-gray-700",
      desc: "text-gray-400",
    },
    warning: {
      wrapper: "bg-amber-50/40 border border-amber-100",
      iconBg: "bg-amber-50",
      icon: "text-amber-400",
      title: "text-amber-800",
      desc: "text-amber-600",
    },
    error: {
      wrapper: "bg-red-50/40 border border-red-100",
      iconBg: "bg-red-50",
      icon: "text-red-400",
      title: "text-red-700",
      desc: "text-red-500",
    },
  }

  const s = variantStyles[variant]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-2xl px-8 py-16 shadow-sm",
        s.wrapper,
        className
      )}
    >
      {/* Icon container — clean square, no border, subtle bg */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
          s.iconBg
        )}
      >
        <Icon className={cn("h-5 w-5", s.icon)} strokeWidth={1.5} />
      </div>

      <h3 className={cn("font-semibold text-sm mb-1.5 tracking-tight", s.title)}>
        {title}
      </h3>
      <p className={cn("text-sm leading-relaxed max-w-[28ch]", s.desc)}>
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-6">
          {secondaryAction && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-medium"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
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
        "flex flex-col items-center justify-center text-center rounded-2xl px-8 py-16",
        "bg-white border border-gray-100 shadow-sm",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-5">
        <Search className="h-5 w-5 text-gray-300" strokeWidth={1.5} />
      </div>
      <h3 className="font-semibold text-sm mb-1.5 tracking-tight text-gray-700">
        Tidak ada hasil ditemukan
      </h3>
      <p className="text-sm leading-relaxed max-w-[28ch] text-gray-400">
        {query
          ? `Tidak ditemukan hasil untuk "${query}". Coba ubah kata kunci pencarian.`
          : "Coba ubah kata kunci pencarian."}
      </p>
      {onClear && (
        <Button
          variant="outline"
          size="sm"
          className="mt-6 text-xs font-medium"
          onClick={onClear}
        >
          Hapus pencarian
        </Button>
      )}
    </div>
  )
}
