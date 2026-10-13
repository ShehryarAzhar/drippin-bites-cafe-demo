"use client"

import { Check, X } from "lucide-react"
import type { ReactNode } from "react"

import { QuantityStepper } from "@/components/cart/quantity-stepper"
import { ProductImage } from "@/components/menu/product-image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type CustomizerSheetProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * The customiser's frame: a bottom sheet on phones, a centred two-column panel
 * from `md`. It stays mounted; what it shows is remounted on each open.
 */
function CustomizerSheet({ open, onClose, children }: CustomizerSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        // The `md:` classes repeat the side selector to outrank the Sheet's own
        // bottom styles. Centring uses auto margins, which leaves `translate`
        // free for the entrance.
        className="overflow-hidden rounded-t-[1.25rem] data-[side=bottom]:max-h-[92dvh] md:grid md:grid-cols-[5fr_6fr] md:grid-rows-[minmax(0,1fr)_auto] md:rounded-[1.25rem] md:transition-[translate,opacity] md:data-[side=bottom]:inset-0 md:data-[side=bottom]:m-auto md:data-[side=bottom]:h-fit md:data-[side=bottom]:max-h-[85dvh] md:data-[side=bottom]:w-[calc(100%-3rem)] md:data-[side=bottom]:max-w-208 md:data-[side=bottom]:data-ending-style:translate-y-3 md:data-[side=bottom]:data-ending-style:opacity-0 md:data-[side=bottom]:data-starting-style:translate-y-3 md:data-[side=bottom]:data-starting-style:opacity-0"
      >
        {children}
      </SheetContent>
    </Sheet>
  )
}

type CustomizerPanelProps = {
  image: string
  /** Names what the stepper counts: "Decrease quantity of Zinger Burger". */
  name: string
  /** Title, description, price and any pickers. */
  children: ReactNode
  quantity: number
  maxQuantity: number
  onDecrease: () => void
  onIncrease: () => void
  /** Formatted total for the Add button; left out while it is not known. */
  total?: string
  /** Nothing can be added right now. */
  disabled?: boolean
  /** The add went through; shown for a moment before the sheet closes. */
  added?: boolean
  /** One short line above the controls. */
  notice?: { text: string; tone: "muted" | "error" }
  /**
   * A choice is still needed: the button shows this label and runs this
   * action instead of adding.
   */
  pending?: { label: string; onAction: () => void }
  onAdd: () => void
}

/**
 * What the sheet holds: the image stage, a scrolling body and a fixed footer
 * with the quantity stepper and the Add button. Knows nothing about the menu.
 */
function CustomizerPanel({
  image,
  name,
  children,
  quantity,
  maxQuantity,
  onDecrease,
  onIncrease,
  total,
  disabled = false,
  added = false,
  notice,
  pending,
  onAdd,
}: CustomizerPanelProps) {
  const waiting = pending !== undefined && !added

  return (
    <>
      {/* Phone: stage and body scroll together. From `md` the wrapper drops
          out and its children sit in the panel's grid. */}
      <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth overscroll-contain md:contents">
        <ProductImage
          // A fresh stage per photo: the new cutout fades in, and a photo
          // that failed cannot hide the next one.
          key={image}
          src={image}
          alt=""
          sizes="(min-width: 48rem) 380px, 100vw"
          loading="eager"
          className="aspect-16/10 w-full [&_img]:animate-in [&_img]:duration-200 [&_img]:fade-in md:col-start-1 md:row-span-2 md:row-start-1 md:aspect-auto md:h-full md:min-h-96"
        />
        <div className="flex flex-col gap-3 p-5 sm:p-6 md:col-start-2 md:row-start-1 md:min-h-0 md:overflow-y-auto md:scroll-smooth md:pt-7">
          {children}
        </div>
      </div>

      <div className="relative shrink-0 bg-secondary/60 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-16px_24px_-16px] shadow-black/70 sm:px-6 md:col-start-2 md:row-start-2">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
        />
        {notice ? (
          <p
            role={notice.tone === "error" ? "alert" : undefined}
            className={cn(
              "mb-3 text-[0.8125rem]",
              notice.tone === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {notice.text}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <div inert={added} className="shrink-0">
            <QuantityStepper
              value={quantity}
              // A maximum below the minimum switches both buttons off.
              max={disabled ? 0 : maxQuantity}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
              decreaseLabel={`Decrease quantity of ${name}`}
              increaseLabel={`Increase quantity of ${name}`}
              className="h-14"
            />
          </div>
          <Button
            size="lg"
            disabled={disabled}
            // Stays focusable, so focus has somewhere to return from.
            focusableWhenDisabled
            aria-label={
              added
                ? "Added"
                : waiting
                  ? pending.label
                  : total
                    ? `Add to cart, ${total}`
                    : "Add to cart"
            }
            onClick={waiting ? pending.onAction : onAdd}
            className={cn(
              "min-w-0 flex-1 px-4 text-[0.9375rem] aria-disabled:pointer-events-none aria-disabled:opacity-50 sm:px-6 sm:text-base",
              added && "pointer-events-none",
              // A step's name can be longer than the button is wide.
              waiting &&
                "h-auto min-h-14 py-2 leading-tight text-balance whitespace-normal",
              !added && !waiting && "justify-between"
            )}
          >
            {added ? (
              <span className="flex animate-in items-center gap-2 duration-200 fade-in">
                <Check aria-hidden="true" />
                Added
              </span>
            ) : waiting ? (
              pending.label
            ) : (
              <>
                <span>Add to cart</span>
                {total ? (
                  <>
                    <span aria-hidden="true" className="opacity-60">
                      ·
                    </span>
                    <span className="tabular-nums">{total}</span>
                  </>
                ) : null}
              </>
            )}
          </Button>
        </div>
      </div>

      <SheetClose
        aria-label="Close"
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            // A dark disc, so the X reads over any photo.
            className="absolute top-3 right-3 z-10 bg-background/60 backdrop-blur-sm hover:bg-background/85"
          />
        }
      >
        <X aria-hidden="true" />
      </SheetClose>
    </>
  )
}

export { CustomizerPanel, CustomizerSheet }
