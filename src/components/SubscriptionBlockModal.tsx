"use client";

import { SubscriptionBlockLegacy } from "./subscription-block/subscription-block-legacy";

interface SubscriptionBlockModalProps {
  children: React.ReactNode;
}

export function SubscriptionBlockModal({ children }: SubscriptionBlockModalProps) {
  return <SubscriptionBlockLegacy>{children}</SubscriptionBlockLegacy>;
}
