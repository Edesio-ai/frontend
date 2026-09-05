"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { LandingHeroLegacy } from "@/app/_components/landing/hero/hero-legacy";
import { LandingHeroNew } from "@/app/_components/landing/hero/hero-new";

export function Hero() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  if (isNewHomepage) {
    return <LandingHeroNew />;
  }

  return <LandingHeroLegacy />;
}
