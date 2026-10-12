import { cn } from "@/lib/utils"

/** Decorative section divider: a thin gold line with a diamond in the centre. */
function GoldRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-slot="gold-rule"
      className={cn(
        "mx-auto flex w-full max-w-xs items-center gap-3 sm:max-w-sm",
        className
      )}
    >
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-primary/80" />
      <span className="size-2 shrink-0 rotate-45 border border-primary" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-primary/80" />
    </div>
  )
}

export { GoldRule }
