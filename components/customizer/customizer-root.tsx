"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { ComboCustomizer } from "@/components/customizer/combo-customizer"
import { DealCustomizer } from "@/components/customizer/deal-customizer"
import { CustomizerSheet } from "@/components/customizer/customizer-shell"
import { ItemCustomizer } from "@/components/customizer/item-customizer"
import { canCustomize } from "@/lib/customizer"
import {
  findItem,
  getCombo,
  getComboSteps,
  getDeal,
  getDealSteps,
} from "@/lib/menu"
import { useCustomizerStore } from "@/store/customizer"

/** The one customiser, opened from any card's Add or Build button. */
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

  // An id the menu no longer has, or an item the customiser cannot finish,
  // never opens the sheet.
  const found = target?.kind === "item" ? findItem(target.itemId) : undefined
  const resolved =
    found && canCustomize(found.item, found.category) ? found : undefined
  // Nor does a combo the menu no longer has, or one with a step left empty.
  const combo = target?.kind === "combo" ? getCombo(target.comboId) : undefined
  const steps = combo ? getComboSteps(combo) : undefined
  // Nor a deal the menu no longer has, or one with a choice nothing can fill.
  const deal = target?.kind === "deal" ? getDeal(target.dealId) : undefined
  const plan = deal ? getDealSteps(deal) : undefined

  return (
    <>
      <CustomizerSheet
        open={
          open &&
          (resolved !== undefined || steps !== undefined || plan !== undefined)
        }
        onClose={close}
      >
        {resolved ? (
          <ItemCustomizer
            key={openId}
            item={resolved.item}
            category={resolved.category}
            onAdded={setAnnouncement}
          />
        ) : combo && steps ? (
          <ComboCustomizer
            key={openId}
            combo={combo}
            steps={steps}
            onAdded={setAnnouncement}
          />
        ) : deal && plan ? (
          <DealCustomizer
            key={openId}
            deal={deal}
            plan={plan}
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
