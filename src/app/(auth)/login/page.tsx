"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import LoginLegacy from "./_components/login-legacy";
import LoginNew from "./_components/login-new";

export default function Login() {
  const isAuthNewDesign = useFeatureFlag("AuthNewDesign");

  if (isAuthNewDesign) {
    return <LoginNew />;
  }

  return <LoginLegacy />;
}
