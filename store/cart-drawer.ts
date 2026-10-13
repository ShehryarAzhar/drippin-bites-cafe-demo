import { create } from "zustand"

type CartDrawerState = {
  open: boolean
  setOpen: (open: boolean) => void
}

/** Whether the cart drawer is open. UI state only: never persisted. */
export const useCartDrawerStore = create<CartDrawerState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}))
