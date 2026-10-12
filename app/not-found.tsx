import type { Metadata } from "next";
import Link from "next/link";

import { BrandHeading } from "@/components/brand/brand-heading";
import { GoldRule } from "@/components/brand/gold-rule";
import { PillLabel } from "@/components/brand/pill-label";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <PillLabel>404</PillLabel>
      <BrandHeading as="h1" size="hero" lead="Nothing on" accent="this plate" />
      <p className="text-muted-foreground">That page isn&apos;t on the menu.</p>
      <GoldRule />
      <Link href="/" className={buttonVariants({ size: "lg" })}>
        Back to Home
      </Link>
    </div>
  );
}
