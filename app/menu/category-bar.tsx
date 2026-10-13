"use client"

import { Sparkle, Tag } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type CategoryBarEntry = {
  /** The id of the section the chip jumps to. */
  id: string
  label: string
  kind: "featured" | "category" | "deals"
}

/** Sticky row of chips that jump to the menu sections and mark the one in view. */
function CategoryBar({ entries }: { entries: CategoryBarEntry[] }) {
  const navRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  // Nothing is active until the observer reports, so the server HTML carries
  // no marking that only JavaScript could keep correct.
  const [activeId, setActiveId] = useState<string | null>(null)
  const [fade, setFade] = useState({ start: false, end: false })

  // Track which section is under the bar.
  useEffect(() => {
    const nav = navRef.current
    const sections = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((section) => section !== null)
    if (!nav || sections.length === 0) return

    const last = sections[sections.length - 1]
    const inBand = new Set<string>()
    let lastFullyVisible = false
    let jumping = false
    let jumpTimer: number | undefined
    let observers: IntersectionObserver[] = []

    const sync = () => {
      if (jumping) return
      const next = lastFullyVisible
        ? last.id
        : sections.find((section) => inBand.has(section.id))?.id
      setActiveId((previous) => next ?? previous ?? sections[0].id)
    }

    const observe = () => {
      observers.forEach((observer) => observer.disconnect())
      inBand.clear()
      // The band starts at the bottom edge of the two sticky bars.
      const top = Math.round(
        (parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight
      )
      const band = new IntersectionObserver(
        (changes) => {
          for (const change of changes) {
            if (change.isIntersecting) inBand.add(change.target.id)
            else inBand.delete(change.target.id)
          }
          sync()
        },
        { rootMargin: `-${top}px 0px -40% 0px` }
      )
      sections.forEach((section) => band.observe(section))
      // A short last section never reaches the band's top, so it wins as soon
      // as all of it is on screen.
      const end = new IntersectionObserver(
        ([change]) => {
          lastFullyVisible = change.intersectionRatio >= 0.99
          sync()
        },
        { threshold: 0.99 }
      )
      end.observe(last)
      observers = [band, end]
    }

    const endJump = () => {
      window.clearTimeout(jumpTimer)
      if (!jumping) return
      jumping = false
      sync()
    }

    // A tapped chip is active at once; the sections passed on the way are not.
    const onClick = (event: MouseEvent) => {
      const chip = (event.target as Element).closest<HTMLElement>("a[data-id]")
      if (!chip?.dataset.id) return
      jumping = true
      setActiveId(chip.dataset.id)
      window.clearTimeout(jumpTimer)
      // For browsers without `scrollend`, and for taps that need no scroll.
      jumpTimer = window.setTimeout(endJump, 1200)
    }

    observe()
    // --header-height changes at this width, and the band's offset with it.
    const headerStep = window.matchMedia("(width >= 40rem)")
    headerStep.addEventListener("change", observe)
    nav.addEventListener("click", onClick)
    document.addEventListener("scrollend", endJump)

    return () => {
      observers.forEach((observer) => observer.disconnect())
      headerStep.removeEventListener("change", observe)
      nav.removeEventListener("click", onClick)
      document.removeEventListener("scrollend", endJump)
      window.clearTimeout(jumpTimer)
    }
  }, [entries])

  // Keep the active chip in view. Only the row is scrolled, never the page.
  useEffect(() => {
    const list = listRef.current
    const chip = list?.querySelector('[aria-current="true"]')
    if (!list || !chip) return
    const row = list.getBoundingClientRect()
    const box = chip.getBoundingClientRect()
    list.scrollTo({
      left: list.scrollLeft + box.left - row.left - (row.width - box.width) / 2,
    })
  }, [activeId])

  // Fade whichever edge of the row has chips scrolled out of it.
  useEffect(() => {
    const list = listRef.current
    const first = list?.firstElementChild
    const last = list?.lastElementChild
    if (!list || !first || !last) return

    const observer = new IntersectionObserver(
      (changes) => {
        setFade((previous) => {
          const next = { ...previous }
          for (const change of changes) {
            const clipped = change.intersectionRatio < 0.98
            if (change.target === first) next.start = clipped
            if (change.target === last) next.end = clipped
          }
          return next
        })
      },
      { root: list, threshold: 0.98 }
    )
    observer.observe(first)
    observer.observe(last)
    return () => observer.disconnect()
  }, [entries])

  return (
    <nav
      ref={navRef}
      aria-label="Menu categories"
      data-slot="category-bar"
      className="sticky top-(--header-height) z-30 h-(--category-bar-height) bg-background/80 backdrop-blur-md"
    >
      <ul
        ref={listRef}
        data-fade-start={fade.start}
        data-fade-end={fade.end}
        className="mx-auto flex h-full max-w-6xl snap-x snap-proximity scroll-px-4 items-center justify-center-safe gap-2 overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] [--fade-end:0px] [--fade-start:0px] [mask-image:linear-gradient(to_right,transparent,black_var(--fade-start),black_calc(100%-var(--fade-end)),transparent)] data-[fade-end=true]:[--fade-end:2.5rem] data-[fade-start=true]:[--fade-start:2.5rem] sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {entries.map((entry) => (
          <li key={entry.id} className="shrink-0 snap-start">
            <a
              href={`#${entry.id}`}
              data-id={entry.id}
              aria-current={entry.id === activeId ? "true" : undefined}
              className={cn(
                "inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap outline-none transition-[background-color,border-color,color,scale] duration-200 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97] [&_svg]:size-3.5 [&_svg]:shrink-0",
                entry.kind === "featured"
                  ? "border-primary text-primary"
                  : "border-border text-foreground",
                "aria-[current=true]:border-primary aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground aria-[current=true]:hover:bg-primary"
              )}
            >
              {entry.kind === "featured" ? (
                <Sparkle aria-hidden="true" className="fill-current" />
              ) : null}
              {entry.kind === "deals" ? <Tag aria-hidden="true" /> : null}
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
      {/* Bottom edge, matching the header's. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
      />
    </nav>
  )
}

export { CategoryBar, type CategoryBarEntry }
