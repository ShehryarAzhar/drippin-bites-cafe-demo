import { cva, type VariantProps } from "class-variance-authority"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const brandHeadingVariants = cva("text-balance", {
  variants: {
    size: {
      hero: "heading-hero",
      section: "heading-section",
      card: "heading-card",
    },
    align: {
      center: "text-center",
      start: "text-start",
    },
  },
  defaultVariants: {
    size: "section",
    align: "center",
  },
})

type BrandHeadingProps = VariantProps<typeof brandHeadingVariants> & {
  /** Heading level, chosen for the document outline, not the visual size. */
  as?: "h1" | "h2" | "h3"
  /** First line, cream. */
  lead: ReactNode
  /** Optional second line, gold. */
  accent?: ReactNode
  /** Lets a section point at its heading with `aria-labelledby`. */
  id?: string
  className?: string
}

function BrandHeading({
  as: Tag = "h2",
  size,
  align,
  lead,
  accent,
  id,
  className,
}: BrandHeadingProps) {
  return (
    <Tag
      id={id}
      data-slot="brand-heading"
      className={cn(brandHeadingVariants({ size, align }), className)}
    >
      <span className="block text-foreground">{lead}</span>
      {accent ? (
        <>
          {/* The space keeps the two lines apart for screen readers. */}{" "}
          <span className="block text-primary">{accent}</span>
        </>
      ) : null}
    </Tag>
  )
}

export { BrandHeading }
