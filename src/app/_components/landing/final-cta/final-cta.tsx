"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { DemoFormLegacy } from "./demo-form-legacy";
import { FinalCtaNew } from "./final-cta-new";

export function FinalCta() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  return isNewHomepage ? <FinalCtaNew /> : <DemoFormLegacy />;
}
