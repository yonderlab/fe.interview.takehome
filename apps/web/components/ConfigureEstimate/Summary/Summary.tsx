"use client";

import type { Estimate, Plan, Provider } from "@/types/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProviderLogo } from "../_shared/ProviderLogo";
import { Price } from "../_shared/Price";
import { statusColors } from "@/lib/statusColors";
import { formatStatus } from "@/lib/formatStatus";

interface Props {
  estimate: Estimate;
  provider?: Provider | null;
  plan?: Plan | null;
}

export const Summary: React.FC<Props> = (props) => {
  const { estimate, provider, plan } = props;

  if (!estimate) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          No estimate available
        </div>
      </Card>
    );
  }

  const selectedAddonIds = Array.isArray(estimate.selections.addons)
    ? estimate.selections.addons
    : [];

  const selectedAddons = plan
    ? plan.addons.filter((addon) => selectedAddonIds.includes(addon.id))
    : [];

  const selectedOptions: Array<{ code: string; value: string | string[] }> = [];
  if (plan) {
    plan.options.forEach((option) => {
      const value = estimate.selections[option.code];
      if (value !== undefined) {
        selectedOptions.push({ code: option.code, value });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Estimate Summary</CardTitle>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[estimate.status] || statusColors.draft}`}
          >
            {formatStatus(estimate.status)}
          </span>
        </div>
      </CardHeader>

      <div className="space-y-4">
        {provider && (
          <div>
            <div className="text-sm text-gray-600">Provider</div>
            <div className="flex items-center gap-2 mt-1">
              <ProviderLogo
                logoUrl={provider.logo_url}
                name={provider.name}
                size="small"
              />
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {provider.name}
                </div>
                <div className="text-sm text-gray-500">{provider.location}</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-gray-600">Plan</div>
          <div className="text-lg font-semibold text-gray-900">
            {estimate.plan?.name || "No plan selected"}
          </div>
          {plan && plan.description && (
            <div className="text-sm text-gray-500 mt-1">{plan.description}</div>
          )}
        </div>

        {selectedOptions.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Selected Options</div>
            <div className="space-y-2">
              {selectedOptions.map((option) => (
                <div key={option.code} className="text-sm">
                  <span className="font-medium text-gray-700">
                    {option.code}:
                  </span>{" "}
                  <span className="text-gray-600">
                    {Array.isArray(option.value)
                      ? option.value.join(", ")
                      : option.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAddons.length > 0 && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Selected Add-ons</div>
            <div className="space-y-1">
              {selectedAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="text-sm flex justify-between items-center"
                >
                  <span className="text-gray-700">• {addon.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {estimate.blocking_reasons.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm font-medium text-red-800 mb-2">
              Issues preventing finalisation:
            </div>
            <ul className="list-disc list-inside space-y-1">
              {estimate.blocking_reasons.map((reason, index) => (
                <li key={index} className="text-sm text-red-700">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {estimate.pricing && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price</span>
              <span className="text-gray-900">
                <Price
                  cents={estimate.pricing.base}
                  currency={estimate.pricing.currency}
                />
              </span>
            </div>
            {estimate.pricing.addons > 0 && (
              <>
                {selectedAddons.length > 0 ? (
                  <div className="space-y-1">
                    {selectedAddons.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex justify-between text-sm pl-4"
                      >
                        <span className="text-gray-600">• {addon.name}</span>
                        <span className="text-gray-900">
                          <Price
                            cents={addon.price_cents}
                            currency={addon.currency}
                          />
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-200 mt-1">
                      <span className="text-gray-700">Add-ons Total</span>
                      <span className="text-gray-900">
                        <Price
                          cents={estimate.pricing.addons}
                          currency={estimate.pricing.currency}
                        />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Add-ons</span>
                    <span className="text-gray-900">
                      <Price
                        cents={estimate.pricing.addons}
                        currency={estimate.pricing.currency}
                      />
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">
                <Price
                  cents={estimate.pricing.total}
                  currency={estimate.pricing.currency}
                />
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
