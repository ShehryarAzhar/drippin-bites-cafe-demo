"use client"

import type { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"

import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

function ToggleGroup({ className, ...props }: ToggleGroupPrimitive.Props) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      className={cn("flex w-full", className)}
      {...props}
    />
  )
}

function ToggleGroupItem(props: TogglePrimitive.Props) {
  return <Toggle data-slot="toggle-group-item" {...props} />
}

export { ToggleGroup, ToggleGroupItem }
