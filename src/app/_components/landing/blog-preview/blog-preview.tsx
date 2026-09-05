"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import { BlogPreviewLegacy } from "./blog-preview-legacy";
import { BlogPreviewNew } from "./blog-preview-new";

export function BlogPreview() {
  const isNewHomepage = useFeatureFlag("HomepageNewDesign");

  return isNewHomepage ? <BlogPreviewNew /> : <BlogPreviewLegacy />;
}
