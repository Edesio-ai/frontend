"use client";

import { useServerInsertedHTML } from "next/navigation";
import { isFeatureFlagsPanelEnabled } from "@/lib/feature-flags/env";
import { getFeatureFlagDomBootstrapScript } from "@/lib/feature-flags/html";

const bootstrapScript = isFeatureFlagsPanelEnabled() ? getFeatureFlagDomBootstrapScript() : "";

export function FeatureFlagBootstrapScript() {
  useServerInsertedHTML(() => {
    if (!bootstrapScript) {
      return null;
    }

    return <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} suppressHydrationWarning />;
  });

  return null;
}
