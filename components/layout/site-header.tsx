import { UtensilsCrossed } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { CartButton } from "@/components/cart/cart-button"
import { NavLink } from "@/components/layout/nav-link"
import { buttonVariants } from "@/components/ui/button"
import { menu } from "@/lib/menu"
import { cn } from "@/lib/utils"

function SiteHeader() {
  return (
    <header
      data-slot="site-header"
      className="sticky top-0 z-40 h-(--header-height) bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex h-full shrink-0 items-center rounded-sm outline-none transition-opacity duration-200 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring active:opacity-85"
        >
          <Image
            src="/logo.svg"
            alt={menu.restaurant.name}
            width={787}
            height={180}
            loading="eager"
            className="h-8.5 w-auto sm:h-10"
          />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-2">
          <NavLink
            href="/menu"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "aria-[current=page]:border-primary aria-[current=page]:bg-accent"
            )}
          >
            <UtensilsCrossed aria-hidden="true" className="hidden sm:block" />
            Menu
          </NavLink>
          <CartButton />
        </nav>
      </div>
      {/* Bottom edge: the GoldRule line without its diamond. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />
    </header>
  )
}

export { SiteHeader }
