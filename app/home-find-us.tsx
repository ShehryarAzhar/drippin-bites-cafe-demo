import {
  ArrowRight,
  Bike,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { BrandHeading } from "@/components/brand/brand-heading"
import { DotGrid, WaveLines } from "@/components/brand/corner-ornaments"
import { GoldRule } from "@/components/brand/gold-rule"
import { PillLabel } from "@/components/brand/pill-label"
import { buttonVariants } from "@/components/ui/button"
import { DELIVERY_NOTE } from "@/lib/cart/copy"
import { getContactDetails, menu } from "@/lib/menu"
import { ORDER_TYPE_LABELS } from "@/lib/order-types"
import { cn } from "@/lib/utils"

const headingId = "home-find-us-heading"

type ContactRow = {
  key: string
  icon: ReactNode
  label: string
  value: string
  href?: string
}

/** The contact details that have real values; "TBD" ones leave no row. */
function getContactRows(): ContactRow[] {
  const { address, phone, whatsapp, hours } = getContactDetails()
  const rows: (Omit<ContactRow, "value"> & { value?: string })[] = [
    {
      key: "address",
      icon: <MapPin aria-hidden="true" />,
      label: "Address",
      value: address,
    },
    {
      key: "phone",
      icon: <Phone aria-hidden="true" />,
      label: "Call",
      value: phone,
      href: phone && `tel:${phone.replace(/\s+/g, "")}`,
    },
    {
      key: "whatsapp",
      icon: <MessageCircle aria-hidden="true" />,
      label: "WhatsApp",
      value: whatsapp,
    },
    {
      key: "hours",
      icon: <Clock aria-hidden="true" />,
      label: "Hours",
      value: hours,
    },
  ]
  return rows.filter((row): row is ContactRow => row.value !== undefined)
}

/**
 * Where the cafe is and how to get its food. Contact details appear as the
 * owners fill them in; until then the panel is one centred column.
 */
function HomeFindUs() {
  const { area, orderTypes } = menu.restaurant
  const rows = getContactRows()
  const hasContact = rows.length > 0

  return (
    <section
      id="find-us"
      aria-labelledby={headingId}
      data-slot="home-find-us"
      className="pb-16 md:pb-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal-on-scroll flex flex-col items-center gap-5 text-center">
          <GoldRule />
          <BrandHeading as="h2" id={headingId} lead="Find" accent="Us" />
        </div>

        <div className="relative isolate mt-8 overflow-hidden rounded-2xl bg-secondary/60 p-6 shadow-xl ring-1 shadow-black/40 ring-gold/40 md:mt-10 md:p-10 lg:p-12">
          {/* Warm light from the top corner, and the posters' corner details. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_90%_at_0%_0%,color-mix(in_oklab,var(--gold)_12%,transparent)_0%,transparent_100%)]"
          />
          <DotGrid className="absolute top-4 right-4 -z-10 size-20 mask-[linear-gradient(to_bottom_left,black,transparent_75%)]" />
          <WaveLines className="absolute bottom-0 left-0 -z-10 w-32 md:w-52" />

          <div
            className={cn(
              "flex flex-col items-center gap-8 text-center",
              hasContact
                ? "md:grid md:grid-cols-2 md:items-start md:gap-12 md:text-start"
                : "mx-auto max-w-xl"
            )}
          >
            <div
              className={cn(
                "flex flex-col items-center gap-5",
                hasContact && "md:items-start"
              )}
            >
              <PillLabel>
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                {area}
              </PillLabel>
              {orderTypes.length > 0 ? (
                <div
                  className={cn(
                    "flex flex-col items-center gap-3",
                    hasContact && "md:items-start"
                  )}
                >
                  <p className="text-lg text-foreground">
                    Eat in, pick up or get it delivered.
                  </p>
                  <ul
                    className={cn(
                      "flex flex-wrap justify-center gap-2",
                      hasContact && "md:justify-start"
                    )}
                  >
                    {orderTypes.map((type) => (
                      <li
                        key={type}
                        className="rounded-full border border-cream/40 px-3 py-1 text-xs font-medium tracking-[0.18em] text-foreground uppercase"
                      >
                        {ORDER_TYPE_LABELS[type]}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {orderTypes.includes("delivery") ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bike aria-hidden="true" className="size-4 shrink-0 text-primary" />
                  {DELIVERY_NOTE}
                </p>
              ) : null}
            </div>

            <div
              className={cn(
                "flex w-full flex-col items-center gap-6",
                hasContact && "md:items-start"
              )}
            >
              {hasContact ? (
                <ul className="flex w-full flex-col gap-4">
                  {rows.map((row) => (
                    <li
                      key={row.key}
                      className="flex min-w-0 items-start justify-center gap-3 md:justify-start [&_svg]:mt-0.5 [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:text-primary"
                    >
                      {row.icon}
                      <div className="min-w-0 text-start">
                        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
                          {row.label}
                        </p>
                        {row.href ? (
                          <a
                            href={row.href}
                            className="inline-flex min-h-11 items-center rounded-sm outline-none transition-colors duration-200 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {row.value}
                          </a>
                        ) : (
                          <p className="wrap-break-word">{row.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full md:w-auto"
                )}
              >
                Start your order
                <ArrowRight
                  aria-hidden="true"
                  data-icon="inline-end"
                  className="transition-transform duration-200 group-hover/button:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { HomeFindUs }
