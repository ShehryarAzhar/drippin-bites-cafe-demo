"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

type NavLinkProps = {
  href: string
  className?: string
  children: ReactNode
}

/** A link that marks itself with `aria-current` on its own route and below it. */
function NavLink({ href, className, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      {children}
    </Link>
  )
}

export { NavLink }
