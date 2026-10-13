"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/70 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          // Slides in whole from its edge. Side sheets follow the dynamic
          // viewport so a phone's browser toolbar never covers their footer.
          "group/sheet fixed z-50 flex flex-col bg-popover text-popover-foreground shadow-2xl shadow-black/70 outline-none transition-transform duration-300 ease-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:max-h-dvh data-[side=bottom]:data-ending-style:translate-y-full data-[side=bottom]:data-starting-style:translate-y-full data-[side=left]:top-0 data-[side=left]:left-0 data-[side=left]:h-dvh data-[side=left]:w-full data-[side=left]:data-ending-style:-translate-x-full data-[side=left]:data-starting-style:-translate-x-full data-[side=right]:top-0 data-[side=right]:right-0 data-[side=right]:h-dvh data-[side=right]:w-full data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:max-h-dvh data-[side=top]:data-ending-style:-translate-y-full data-[side=top]:data-starting-style:-translate-y-full data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md",
          className
        )}
        {...props}
      >
        {/* Leading edge: the header's fading gold hairline, in place of a border. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute from-transparent via-primary/60 to-transparent group-data-[side=bottom]/sheet:inset-x-0 group-data-[side=bottom]/sheet:top-0 group-data-[side=bottom]/sheet:h-px group-data-[side=bottom]/sheet:bg-linear-to-r group-data-[side=left]/sheet:inset-y-0 group-data-[side=left]/sheet:right-0 group-data-[side=left]/sheet:w-px group-data-[side=left]/sheet:bg-linear-to-b group-data-[side=right]/sheet:inset-y-0 group-data-[side=right]/sheet:left-0 group-data-[side=right]/sheet:w-px group-data-[side=right]/sheet:bg-linear-to-b group-data-[side=top]/sheet:inset-x-0 group-data-[side=top]/sheet:bottom-0 group-data-[side=top]/sheet:h-px group-data-[side=top]/sheet:bg-linear-to-r"
        />
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon aria-hidden="true" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4 sm:px-6", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4 sm:px-6", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      // No weight: Anton has one, and the heading utilities set it.
      className={cn("heading-card text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
