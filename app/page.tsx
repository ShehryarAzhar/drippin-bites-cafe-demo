import { HomeCairoFeature } from "./home-cairo-feature";
import { HomeCategories } from "./home-categories";
import { HomeDeals } from "./home-deals";
import { HomeFindUs } from "./home-find-us";
import { HomeHero } from "./home-hero";

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeCairoFeature />
      <HomeCategories />
      <HomeDeals />
      <HomeFindUs />
    </>
  );
}
