export const ANNUAL_DISCOUNT_PERCENT = 15;

// Matches the Stripe price IDs: only the English locale is billed in USD, every other locale in EUR.
export function formatPlanPrice(price: number, locale: string): string {
  if (locale === "en") {
    return `$${price.toFixed(2)}`;
  }

  return `${price.toFixed(2).replace(".", ",")}€`;
}

export function getDiscountedMonthly(monthlyPrice: number): number {
  return monthlyPrice * (1 - ANNUAL_DISCOUNT_PERCENT / 100);
}

export function getDiscountedAnnual(monthlyPrice: number): number {
  return getDiscountedMonthly(monthlyPrice) * 12;
}
