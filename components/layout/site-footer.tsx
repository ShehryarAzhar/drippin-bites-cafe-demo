import { Clock, MapPin, MessageCircle, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { GoldRule } from "@/components/brand/gold-rule"
import { getContactDetails, menu } from "@/lib/menu"

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
]

function BlockLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
      {children}
    </p>
  )
}

function ContactRow({
  icon,
  children,
}: {
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <li className="flex min-w-0 items-start justify-center gap-2.5 md:justify-start [&_svg]:mt-1 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary">
      {icon}
      <span className="min-w-0 wrap-break-word">{children}</span>
    </li>
  )
}

function SiteFooter() {
  const { name, tagline, area } = menu.restaurant
  const { address, phone, whatsapp, hours } = getContactDetails()

  return (
    <footer
      data-slot="site-footer"
      // The end tone is the page vignette's edge colour from globals.css.
      className="bg-linear-to-b from-transparent to-[color-mix(in_oklab,black_55%,var(--background))]/70 pt-12 pb-10 md:pt-16"
    >
      <GoldRule />
      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 md:mt-16">
        <div className="grid gap-8 text-center md:grid-cols-[2fr_1fr_1fr] md:gap-12 md:text-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link
              href="/"
              className="flex min-h-11 items-center rounded-sm outline-none transition-opacity duration-200 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring active:opacity-85"
            >
              <Image
                src="/logo.svg"
                alt={name}
                width={787}
                height={180}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-muted-foreground">{tagline}</p>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <BlockLabel>Visit</BlockLabel>
            <ul className="flex flex-col gap-2">
              {/* The area keeps its pin only until a full address arrives. */}
              <ContactRow
                icon={address ? undefined : <MapPin aria-hidden="true" />}
              >
                {area}
              </ContactRow>
              {address ? (
                <ContactRow icon={<MapPin aria-hidden="true" />}>
                  {address}
                </ContactRow>
              ) : null}
              {phone ? (
                <li className="flex justify-center md:justify-start">
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-sm outline-none transition-colors duration-200 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Phone
                      aria-hidden="true"
                      className="size-4 shrink-0 text-primary"
                    />
                    {phone}
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <ContactRow icon={<MessageCircle aria-hidden="true" />}>
                  {whatsapp}
                </ContactRow>
              ) : null}
              {hours ? (
                <ContactRow icon={<Clock aria-hidden="true" />}>
                  {hours}
                </ContactRow>
              ) : null}
            </ul>
          </div>

          <div className="flex flex-col gap-1">
            <BlockLabel>Explore</BlockLabel>
            <nav aria-label="Footer">
              <ul className="flex flex-col items-center md:items-start">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex min-h-11 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="bg-linear-to-r from-primary to-primary bg-size-[0%_1px] bg-bottom-left bg-no-repeat pb-0.5 transition-[background-size] duration-200 group-hover:bg-size-[100%_1px]">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground md:text-start">
          © {name}
        </p>
      </div>
    </footer>
  )
}

export { SiteFooter }
