export const ANNUAL_DISCOUNT_PERCENT = 15;

export function formatPlanPrice(price: number, locale: string): string {
  if (locale === "fr") {
    return `${price.toFixed(2).replace(".", ",")}€`;
  }

  return `$${price.toFixed(2)}`;
}

export function getDiscountedMonthly(monthlyPrice: number): number {
  return monthlyPrice * (1 - ANNUAL_DISCOUNT_PERCENT / 100);
}

export function getDiscountedAnnual(monthlyPrice: number): number {
  return getDiscountedMonthly(monthlyPrice) * 12;
}
