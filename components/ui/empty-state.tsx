import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
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
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-16 px-8 rounded-lg",
        "border border-dashed border-gray-200 bg-gray-50/50",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-800">{title}</h3>
      <p className="mb-6 max-w-[320px] text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        {action && (
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button size="sm" variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// Variant khusus untuk hasil pencarian kosong
export function EmptySearchState({
  query,
  onClear,
  className,
}: {
  query: string
  onClear: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-12 px-8",
        className
      )}
    >
      <div className="mb-3 text-3xl">🔍</div>
      <h3 className="mb-1 text-sm font-semibold text-gray-800">
        Tidak ada hasil untuk &ldquo;{query}&rdquo;
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Coba kata kunci lain atau hapus filter yang aktif.
      </p>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Hapus Pencarian
      </Button>
    </div>
  )
}
