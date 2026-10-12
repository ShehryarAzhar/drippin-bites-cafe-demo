import { BrandHeading } from "@/components/brand/brand-heading";
import { GoldRule } from "@/components/brand/gold-rule";
import { PillLabel } from "@/components/brand/pill-label";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <PillLabel sparkles>Johar Town · Lahore</PillLabel>
      <BrandHeading as="h1" size="hero" lead="Drippin" accent="Bites Cafe" />
      <GoldRule />
    </div>
  );
}
