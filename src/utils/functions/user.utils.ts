import type { UserMetadata } from "@/types/user.type";

export function getNameParts(metadata?: UserMetadata | null) {
  return {
    firstname: metadata?.firstname ?? metadata?.firstName,
    lastname: metadata?.lastname ?? metadata?.lastName,
  };
}

export function getUserInitials(firstname?: string, lastname?: string, fallback = "—") {
  const initials = `${firstname?.[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase();
  return initials || fallback;
}

export function getUserDisplayName(firstname?: string, lastname?: string, fallback = "") {
  const name = [firstname, lastname].filter(Boolean).join(" ").trim();
  return name || fallback;
}

export function getUserInitialsFromMetadata(metadata?: UserMetadata | null, fallback = "—") {
  const { firstname, lastname } = getNameParts(metadata);
  return getUserInitials(firstname, lastname, fallback);
}

export function getUserDisplayNameFromMetadata(metadata?: UserMetadata | null, fallback = "") {
  const { firstname, lastname } = getNameParts(metadata);
  return getUserDisplayName(firstname, lastname, fallback);
}
