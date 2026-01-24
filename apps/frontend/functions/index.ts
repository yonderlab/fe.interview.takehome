import { Estimate } from "../types";

export function detectEstimatePriceDrift(
  prev: Estimate,
  next: Estimate,
): boolean {
  const prevTotal = prev.pricing.total;
  const nextTotal = next.pricing.total;
  const delta = nextTotal - prevTotal;

  return Math.abs(delta) > 0;
}

export function currencyFormatter(currency: string, value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const handleUnknownDescription = (code: string) => {
  return code
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
