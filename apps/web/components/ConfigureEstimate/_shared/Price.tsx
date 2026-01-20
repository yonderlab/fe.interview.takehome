interface Props {
  cents: number;
  currency: string;
}

export const Price: React.FC<Props> = ({ cents, currency }) => {
  return <>{formatPrice(cents, currency)}</>;
};

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
