"use client";

import { useFeatureFlag } from "@/contexts/feature-flags-context";
import RegisterLegacy from "./_components/register-legacy";
import RegisterNew from "./_components/register-new";

export default function Register() {
  const newAuthDesign = useFeatureFlag("AuthNewDesign");

  return newAuthDesign ? <RegisterNew /> : <RegisterLegacy />;
}
