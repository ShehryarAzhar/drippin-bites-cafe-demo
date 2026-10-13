import { create } from "zustand"
import { persist, type PersistStorage } from "zustand/middleware"

import {
  addToLines,
  removeLine,
  sanitizeStoredLines,
  setLineQuantity,
} from "@/lib/cart/line"
import type { CartLine, CartSelection } from "@/types/cart"

type CartState = {
  lines: CartLine[]
  /** False until the saved cart has been read; the cart reads as empty before. */
  hydrated: boolean
  /** Returns false when the selection is refused and nothing was added. */
  addLine: (selection: CartSelection, quantity?: number) => boolean
  setQuantity: (key: string, quantity: number) => void
  removeLine: (key: string) => void
  clear: () => void
}

type PersistedCart = Pick<CartState, "lines">

const STORAGE_KEY = "drippin-bites-cart"
const STORAGE_VERSION = 1

// Storage can be missing (server), blocked, full or hold junk. Every call is
// guarded so the cart carries on in memory.
const safeStorage: PersistStorage<PersistedCart> = {
  getItem: (name) => {
    try {
      const raw = window.localStorage.getItem(name)
      return raw === null ? null : JSON.parse(raw)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, JSON.stringify(value))
    } catch {
      // Not saved; the in-memory cart still has the change.
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      // Nothing to remove from.
    }
  },
}

/**
 * The cart. Select `lines` (a stable reference) and work out totals and
 * summaries outside the selector with lib/cart; a selector that builds a new
 * array or object on each call re-renders forever.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      addLine: (selection, quantity) => {
        const lines = addToLines(get().lines, selection, quantity)
        if (!lines) return false
        set({ lines })
        return true
      },
      setQuantity: (key, quantity) =>
        set({ lines: setLineQuantity(get().lines, key, quantity) }),
      removeLine: (key) => set({ lines: removeLine(get().lines, key) }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: safeStorage,
      partialize: (state) => ({ lines: state.lines }),
      // Read by loadCart below, so the read and the `hydrated` flag stay together.
      skipHydration: true,
      // A cart saved by another version is discarded, not migrated.
      migrate: () => ({ lines: [] }),
      merge: (persisted, current) => ({
        ...current,
        lines: sanitizeStoredLines(persisted),
      }),
    },
  ),
)

/** Reads the saved cart, then marks the store hydrated even if there was none. */
export function loadCart() {
  void useCartStore.persist.rehydrate()
  useCartStore.setState({ hydrated: true })
}

// The store loads itself as soon as it exists in the browser. This must not
// move into a component effect: a hot reload of anything imported here
// re-creates the store, an effect that already ran does not run again, and
// every Add button then stays disabled until a full reload. The first render
// still matches the server, because zustand hydrates from the initial state.
if (typeof window !== "undefined") loadCart()
