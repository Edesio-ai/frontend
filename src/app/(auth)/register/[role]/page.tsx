"use client";

import { notFound } from "next/navigation";
import { useFeatureFlag } from "@/contexts/feature-flags-context";

export default function RegisterRolePage() {
  const isAuthNewDesign = useFeatureFlag("AuthNewDesign");

  if (!isAuthNewDesign) {
    notFound();
  }

  return null;
}
