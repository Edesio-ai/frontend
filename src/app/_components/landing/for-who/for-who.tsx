"use client";
import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { ForWhoLegacy } from "./for-who-legacy";
import { ForWhoNew } from "./for-who-new";

export function ForWho() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  if (isNewHomepage) {
    return <ForWhoNew />;
  }

  return <ForWhoLegacy />;
}
