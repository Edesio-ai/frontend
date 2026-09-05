"use client";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { BenefitsLegacy } from "./benefits-legacy";
import { BenefitsNew } from "./benefits-new";
import { StatsBanner } from "../stats/stats-banner";

export function Benefits() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  if (isNewHomepage) {
    return (
      <>
        <BenefitsNew />
        <StatsBanner />
      </>
    );
  }

  return <BenefitsLegacy />;
}
