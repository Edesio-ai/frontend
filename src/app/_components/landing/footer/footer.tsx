"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { FooterLegacy } from "./footer-legacy";
import { FooterNew } from "./footer-new";

export function Footer() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  return isNewHomepage ? <FooterNew /> : <FooterLegacy />;
}
