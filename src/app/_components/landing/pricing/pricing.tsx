"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { PricingLegacy } from "./pricing-legacy";
import { PricingNew } from "./pricing-new";

export function Pricing() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  return isNewHomepage ? <PricingNew /> : <PricingLegacy />;
}
