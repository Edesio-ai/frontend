"use client";

import { FunctioningLegacy } from "./functioning-legacy";
import { FunctioningNew } from "./functioning-new";
import { useFeatureFlag } from "@/contexts/feature-flags-context";

export function Functioning() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  if (isNewHomepage) {
    return <FunctioningNew />;
  }

  return <FunctioningLegacy />;
}
