"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { LandingNavbarLegacy } from "../../app/_components/landing/_components/landing-navbar-legacy";
import { LandingNavbarNew } from "../../app/_components/landing/_components/landing-navbar-new";

export function Navbar() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  if (isNewHomepage) {
    return <LandingNavbarNew />;
  }

  return <LandingNavbarLegacy />;
}
