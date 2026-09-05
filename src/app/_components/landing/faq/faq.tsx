"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { FaqLegacy } from "./faq-legacy";
import { FaqNew } from "./faq-new";

export function FAQ() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  return isNewHomepage ? <FaqNew /> : <FaqLegacy />;
}
