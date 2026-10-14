import Image from "next/image"
import type { ReactNode } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { GoldRule } from "@/components/brand/gold-rule"
import { cn } from "@/lib/utils"

type CartEmptyProps = {
  /** The way back to the menu; the caller decides if it is a link or a button. */
  action: ReactNode
  /** `h3` inside the drawer, `h2` on a page with its own `h1`. */
  headingAs?: "h2" | "h3"
  className?: string
}

/** The empty cart: the logo mark on a gold glow and a way to the menu. */
function CartEmpty({ action, headingAs = "h3", className }: CartEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 text-center",
        className
      )}
    >
      <div className="relative grid size-36 place-items-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--gold)_22%,transparent),transparent)]"
        />
        <Image
          src="/logo-mark.svg"
          alt=""
          width={72}
          height={72}
          className="relative size-18 opacity-45"
        />
      </div>
      <BrandHeading as={headingAs} size="card" lead="Nothing here" accent="yet" />
      <p className="max-w-[26ch] text-sm text-muted-foreground">
        Add something from the menu and it shows up here.
      </p>
      <GoldRule className="max-w-40 sm:max-w-40" />
      {action}
    </div>
  )
}

export { CartEmpty }
