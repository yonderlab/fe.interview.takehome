import type { Estimate } from "@/types/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Price } from "@/components/ConfigureEstimate/_shared/Price";
import { statusColors } from "@/lib/statusColors";
import { formatStatus } from "@/lib/formatStatus";

interface Props {
  estimate: Estimate;
  onClick: () => void;
  onDelete?: (estimateId: string) => void;
}

export const EstimateCard: React.FC<Props> = ({
  estimate,
  onClick,
  onDelete,
}) => {
  return (
    <div
      className="cursor-pointer hover:shadow-lg transition-shadow h-full"
      onClick={onClick}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 mb-0">
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-lg">{estimate.plan.name}</CardTitle>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[estimate.status] || statusColors.draft
                }`}
              >
                {formatStatus(estimate.status)}
              </span>
              {onDelete && (
                <button
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onDelete?.(estimate.id);
                  }}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                  aria-label={`Delete estimate ${estimate.id}`}
                  title="Delete estimate"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500 hover:text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">ID: {estimate.id}</div>
        </CardHeader>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price</span>
              <span className="text-gray-900 font-medium">
                <Price
                  cents={estimate.pricing.base}
                  currency={estimate.pricing.currency}
                />
              </span>
            </div>
            {estimate.pricing.addons > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Add-ons</span>
                <span className="text-gray-900 font-medium">
                  <Price
                    cents={estimate.pricing.addons}
                    currency={estimate.pricing.currency}
                  />
                </span>
              </div>
            )}
            {estimate.blocking_reasons.length > 0 && (
              <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {estimate.blocking_reasons.length} issue
                {estimate.blocking_reasons.length > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 mt-auto">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                <Price
                  cents={estimate.pricing.total}
                  currency={estimate.pricing.currency}
                />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
