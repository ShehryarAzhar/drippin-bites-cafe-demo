import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

// Shared with Textarea: a warm dark surface with a faint gold edge, gold focus
// ring, red ring when invalid. 16px text at every width so iOS never zooms.
const fieldControl =
  "w-full min-w-0 rounded-xl bg-secondary/60 px-4 text-base text-foreground ring-1 ring-gold/20 transition-[box-shadow,background-color] duration-150 outline-none placeholder:text-muted-foreground hover:ring-gold/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(fieldControl, "h-12", className)}
      {...props}
    />
  )
}

export { Input, fieldControl }
