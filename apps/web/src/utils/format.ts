export function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatLabel(text: string): string {
  return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
