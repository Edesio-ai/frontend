export function getInitials(
  value?: string | null,
  { max, fallback = "N/A" }: { max?: number; fallback?: string } = {},
) {
  const initials = (value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, max)
    .join("");
  return initials || fallback;
}
