"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { CustomizerSheet } from "@/components/customizer/customizer-shell"
import { ItemCustomizer } from "@/components/customizer/item-customizer"
import { canCustomize } from "@/lib/customizer"
import { findItem } from "@/lib/menu"
import { useCustomizerStore } from "@/store/customizer"

/** The one customiser, opened from any card's Add button. */
function CustomizerRoot() {
  const target = useCustomizerStore((state) => state.target)
  const open = useCustomizerStore((state) => state.open)
  const openId = useCustomizerStore((state) => state.openId)
  const close = useCustomizerStore((state) => state.close)
  const pathname = usePathname()
  const [announcement, setAnnouncement] = useState("")

  // Any route change, Back and Forward included, leaves the sheet closed.
  useEffect(() => {
    close()
  }, [pathname, close])

  // An id the menu no longer has, or an item still waiting for its picker,
  // never opens the sheet.
  const found = target ? findItem(target.itemId) : undefined
  const resolved = found && canCustomize(found.item) ? found : undefined

  return (
    <>
      <CustomizerSheet open={open && resolved !== undefined} onClose={close}>
        {resolved ? (
          <ItemCustomizer
            key={openId}
            item={resolved.item}
            category={resolved.category}
            onAdded={setAnnouncement}
          />
        ) : null}
      </CustomizerSheet>
      {/* Outside the sheet, so it is still there after the sheet has closed. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  )
}

export { CustomizerRoot }
