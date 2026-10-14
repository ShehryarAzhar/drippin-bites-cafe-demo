import * as React from "react"

import { fieldControl } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldControl,
        // Starts at about three lines and grows with the text, up to a limit.
        "flex field-sizing-content min-h-24 max-h-48 resize-none py-3 leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
