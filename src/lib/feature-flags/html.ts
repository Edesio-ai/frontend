import { FEATURE_FLAGS, FEATURE_FLAG_KEYS, type FeatureFlagKey } from "./flags";
import { getFeatureFlagsBootstrapScript } from "./storage";

export function getFeatureFlagHtmlAttributeMap(): Partial<Record<FeatureFlagKey, string>> {
  const map: Partial<Record<FeatureFlagKey, string>> = {};

  for (const key of FEATURE_FLAG_KEYS) {
    const attribute = FEATURE_FLAGS[key].htmlAttribute;
    if (attribute) {
      map[key] = attribute;
    }
  }

  return map;
}

export function applyFeatureFlagHtmlAttributes(isEnabled: (key: FeatureFlagKey) => boolean): void {
  if (typeof document === "undefined") {
    return;
  }

  for (const key of FEATURE_FLAG_KEYS) {
    const attribute = FEATURE_FLAGS[key].htmlAttribute;
    if (!attribute) {
      continue;
    }

    document.documentElement.toggleAttribute(attribute, isEnabled(key));
  }
}

export function getEnabledHtmlAttributeProps(isEnabled: (key: FeatureFlagKey) => boolean): Record<string, ""> {
  const props: Record<string, ""> = {};

  for (const key of FEATURE_FLAG_KEYS) {
    const attribute = FEATURE_FLAGS[key].htmlAttribute;
    if (attribute && isEnabled(key)) {
      props[attribute] = "";
    }
  }

  return props;
}

export function getFeatureFlagDomBootstrapScript(): string {
  return getFeatureFlagsBootstrapScript(getFeatureFlagHtmlAttributeMap());
}
