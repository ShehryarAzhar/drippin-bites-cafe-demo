"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

type ProductImageProps = {
  /** With none, the fallback mark is shown. */
  src?: string
  /** Empty when the name is already shown beside the image. */
  alt: string
  sizes: string
  loading?: "lazy" | "eager"
  fetchPriority?: "high" | "low" | "auto"
  /** `false` drops the dark stage and its glow, for a caller that lights the
      cutout itself. */
  stage?: boolean
  /** Sets the box: an aspect ratio, or a width that stretches with its row. */
  className?: string
}

/** A food cutout on a dark stage with a gold glow behind it. */
function ProductImage({
  src,
  alt,
  sizes,
  loading,
  fetchPriority,
  stage = true,
  className,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      data-slot="product-image"
      className={cn(
        "relative",
        stage &&
          "isolate overflow-hidden bg-linear-to-b from-muted to-background",
        className
      )}
    >
      {stage ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_closest-side_at_50%_56%,color-mix(in_oklab,var(--gold)_42%,transparent)_0%,color-mix(in_oklab,var(--gold)_16%,transparent)_60%,transparent_100%)]"
        />
      ) : null}
      {failed || !src ? (
        <>
          <Image
            src="/logo-mark.svg"
            alt=""
            width={120}
            height={120}
            className="absolute inset-0 m-auto h-auto w-2/5 opacity-25"
          />
          {alt ? <span className="sr-only">{alt}</span> : null}
        </>
      ) : (
        <Image
          // An error can fire before hydration, when onError is not attached yet.
          ref={(img) => {
            if (img?.complete && img.naturalWidth === 0) setFailed(true)
          }}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={loading}
          fetchPriority={fetchPriority}
          onError={() => setFailed(true)}
          className="object-contain p-[8%] drop-shadow-xl drop-shadow-black/60"
        />
      )}
    </div>
  )
}

export { ProductImage }
