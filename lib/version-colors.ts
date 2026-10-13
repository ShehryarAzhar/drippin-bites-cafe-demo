/**
 * The printed menu's colours for the two Cairo versions, by variant id: the
 * cart's tag and the customiser's toggle both fill with these. Any other
 * variant id has no entry, and the caller falls back to its own neutral.
 */
export const versionColors: Record<string, string> = {
  authentic: "bg-navy text-white",
  lahori: "bg-brand-red text-white",
}
