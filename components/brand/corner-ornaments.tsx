import { cn } from "@/lib/utils"

/* The posters' corner details. All three are decoration: the caller places
   and sizes them with `className`. */

/** A square of gold dots. The caller sets its size and, if wanted, a mask. */
function DotGrid({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-slot="dot-grid"
      className={cn(
        "pointer-events-none block bg-[radial-gradient(circle,color-mix(in_oklab,var(--gold)_55%,transparent)_1px,transparent_1.5px)] bg-size-[10px_10px]",
        className
      )}
    />
  )
}

const waveBox = { width: 260, height: 200 }

/* One contour around the bottom-left corner: out from the left edge, over a
   shoulder, and down to the bottom edge. */
function wavePath(reach: number) {
  const { height } = waveBox
  const top = height - reach
  return [
    `M0 ${top}`,
    `C${reach * 0.3} ${top - 14} ${reach * 0.55} ${top + reach * 0.3} ${reach * 0.82} ${top + reach * 0.42}`,
    `S${reach * 1.22} ${height - reach * 0.3} ${reach * 1.3} ${height}`,
  ].join("")
}

/** Thin contour lines spreading from the bottom-left corner of its box. */
function WaveLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="wave-lines"
      viewBox={`0 0 ${waveBox.width} ${waveBox.height}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={cn("pointer-events-none text-primary/30", className)}
    >
      {[52, 76, 100, 124, 148, 172].map((reach) => (
        <path
          key={reach}
          vectorEffect="non-scaling-stroke"
          d={wavePath(reach)}
        />
      ))}
    </svg>
  )
}

type Point = [number, number]

const round = (value: number) => Math.round(value * 10) / 10

/* One palm frond: a curved stem from `from` to `to`, with a narrow leaflet on
   each side at every step, longest near the middle and drooping a little. */
function frondPath(from: Point, bend: Point, to: Point, pairs: number, reach: number) {
  const parts: string[] = [
    `M${from[0]} ${from[1]}Q${bend[0]} ${bend[1]} ${to[0]} ${to[1]}`,
  ]
  for (let step = 1; step <= pairs; step++) {
    const t = step / (pairs + 1)
    const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * bend[0] + t ** 2 * to[0]
    const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * bend[1] + t ** 2 * to[1]
    const dx = 2 * (1 - t) * (bend[0] - from[0]) + 2 * t * (to[0] - bend[0])
    const dy = 2 * (1 - t) * (bend[1] - from[1]) + 2 * t * (to[1] - bend[1])
    const stem = Math.atan2(dy, dx)
    const length = reach * Math.sin(Math.PI * (0.22 + 0.7 * t))
    for (const side of [1, -1]) {
      const angle = stem + side * 0.95
      const tipX = x + Math.cos(angle) * length
      const tipY = y + Math.sin(angle) * length + length * 0.22
      const midX = (x + tipX) / 2
      const midY = (y + tipY) / 2
      const offX = -Math.sin(angle) * length * 0.07
      const offY = Math.cos(angle) * length * 0.07
      parts.push(
        `M${round(x)} ${round(y)}Q${round(midX + offX)} ${round(midY + offY)} ${round(tipX)} ${round(tipY)}Q${round(midX - offX)} ${round(midY - offY)} ${round(x)} ${round(y)}Z`
      )
    }
  }
  return parts.join("")
}

const fronds = [
  frondPath([410, -10], [240, 10], [30, 170], 15, 92),
  frondPath([420, 0], [340, 150], [250, 390], 15, 96),
]

/** A soft palm shadow falling in from the top-right corner of its box. */
function PalmShadow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="palm-shadow"
      viewBox="0 0 400 400"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className={cn(
        "pointer-events-none overflow-visible text-primary opacity-[0.13] blur-[3px]",
        className
      )}
    >
      {fronds.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export { DotGrid, PalmShadow, WaveLines }
