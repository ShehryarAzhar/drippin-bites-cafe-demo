import { Leaf } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Tag } from "@/types/menu"

const tagText =
  "inline-flex h-6 items-center font-sans text-[0.6875rem] leading-none font-bold tracking-[0.12em] text-white uppercase"

/** "NEW" stamp and veg mark, always in that order. Renders nothing without tags. */
function ItemTags({ tags, className }: { tags: Tag[]; className?: string }) {
  if (tags.length === 0) return null

  return (
    <div
      data-slot="item-tags"
      className={cn("flex items-center gap-2", className)}
    >
      {tags.includes("new") ? (
        <span className={cn(tagText, "-rotate-3 rounded-sm bg-brand-red px-2")}>
          New
        </span>
      ) : null}
      {tags.includes("veg") ? (
        <span className={cn(tagText, "gap-1 rounded-full bg-veg px-2.5")}>
          <Leaf aria-hidden="true" className="size-3" />
          Veg
        </span>
      ) : null}
    </div>
  )
}

export { ItemTags }
