"use client"

import { useEffect } from "react"

import { loadCart } from "@/store/cart"

/** Loads the saved cart after hydration, so the first render matches the server. */
function CartHydration() {
  useEffect(() => {
    loadCart()
  }, [])

  return null
}

export { CartHydration }
