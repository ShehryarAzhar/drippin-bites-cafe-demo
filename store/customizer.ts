import { create } from "zustand"

/** What the customiser is showing. Combos and deals join as further kinds. */
export type CustomizerTarget = { kind: "item"; itemId: string }

type CustomizerState = {
  target: CustomizerTarget | null
  open: boolean
  /** Changes on every open, so each one starts fresh at quantity 1. */
  openId: number
  openItem: (itemId: string) => void
  /** Keeps the target, so the sheet still has its content while it leaves. */
  close: () => void
}

/** Which item the customiser is open on. UI state only: never persisted. */
export const useCustomizerStore = create<CustomizerState>()((set) => ({
  target: null,
  open: false,
  openId: 0,
  openItem: (itemId) =>
    set((state) => ({
      target: { kind: "item", itemId },
      open: true,
      openId: state.openId + 1,
    })),
  close: () => set({ open: false }),
}))
