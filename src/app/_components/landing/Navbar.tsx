"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { LandingNavbarLegacy } from "./navbar-legacy";
import { LandingNavbarNew } from "./navbar-new";

export function Navbar() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  if (isNewHomepage) {
    return <LandingNavbarNew />;
  }

  return <LandingNavbarLegacy />;
}
