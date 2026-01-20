"use client";

import type { Plan } from "@/types/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Price } from "../../../_shared/Price";

interface Props {
  plan: Plan;
  isSelected: boolean;
  onSelect: (plan: Plan) => void;
}

export const PlanCard: React.FC<Props> = ({ plan, isSelected, onSelect }) => {
  return (
    <div
      className={`h-full cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-blue-600 bg-blue-50" : "hover:shadow-lg"
      }`}
      onClick={() => onSelect(plan)}
    >
      <Card
        className={`h-full flex flex-col ${
          isSelected ? "ring-2 ring-blue-600 bg-blue-50" : ""
        }`}
      >
        <CardHeader className="flex-shrink-0">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <p className="text-gray-600 mt-1">{plan.description}</p>
          </div>
        </CardHeader>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Min {plan.min_participants} participants
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {plan.lead_time_days} days lead time
              </span>
            </div>

            {plan.approval_type === "manager_review" && (
              <div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Requires Approval
                </span>
              </div>
            )}

            {plan.options.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Options:
                </div>
                <div className="flex flex-wrap gap-2">
                  {plan.options.map((option) => (
                    <span
                      key={option.code}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {option.code}
                      {option.required && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {plan.addons.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Add-ons available: {plan.addons.length}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                <Price cents={plan.base_price_cents} currency={plan.currency} />
              </div>
              <div className="text-sm text-gray-500 mt-1">base price</div>
            </div>
            <Button
              variant={isSelected ? "secondary" : "primary"}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(plan);
              }}
            >
              {isSelected ? "Selected" : "Select Plan"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
