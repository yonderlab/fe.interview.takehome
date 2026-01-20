"use client";

import { useState, useEffect } from "react";
import type { Plan, Estimate } from "@/types/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface Props {
  plan: Plan;
  estimate: Estimate;
  onUpdate: (selections: Record<string, string | string[]>) => void;
}

export const PlanConfigs: React.FC<Props> = (props) => {
  const { plan, estimate, onUpdate } = props;

  const [selections, setSelections] = useState<
    Record<string, string | string[]>
  >(estimate.selections || {});

  useEffect(() => {
    setSelections(estimate.selections || {});
  }, [estimate.selections]);

  return (
    <div className="space-y-6">
      {/* Options */}
      {plan.options.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Options</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {plan.options.map((option) => {
              const currentValue = selections[option.code] as
                | string
                | undefined;

              return (
                <div key={option.code}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {option.code
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                    {option.required && (
                      <span className="text-red-600 ml-1">*</span>
                    )}
                    {option.description && (
                      <span className="text-gray-500 font-normal ml-2">
                        - {option.description}
                      </span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {option.values.map((value) => (
                      <label
                        key={value}
                        className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                        style={{
                          borderColor:
                            currentValue === value ? "#2563eb" : "#e5e7eb",
                          backgroundColor:
                            currentValue === value ? "#eff6ff" : "transparent",
                        }}
                      >
                        <input
                          type="radio"
                          name={option.code}
                          value={value}
                          checked={currentValue === value}
                          onChange={() => {
                            const newSelections = {
                              ...selections,
                              [option.code]: value,
                            };
                            setSelections(newSelections);
                            onUpdate(newSelections);
                          }}
                          className="mr-3"
                          required={option.required}
                        />
                        <span className="text-gray-900">
                          {value
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Addons */}
      {plan.addons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Add-ons</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {plan.addons.map((addon) => {
              const isSelected =
                (selections.addons as string[])?.includes(addon.id) || false;

              return (
                <label
                  key={addon.id}
                  className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                  style={{
                    borderColor: isSelected ? "#2563eb" : "#e5e7eb",
                    backgroundColor: isSelected ? "#eff6ff" : "transparent",
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const currentAddons =
                          (selections.addons as string[]) || [];
                        const newAddons = currentAddons.includes(addon.id)
                          ? currentAddons.filter((id) => id !== addon.id)
                          : [...currentAddons, addon.id];

                        const newSelections = {
                          ...selections,
                          addons: newAddons,
                        };
                        setSelections(newSelections);
                        onUpdate(newSelections);
                      }}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-900 font-medium">
                      {addon.name}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {(addon.price_cents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: addon.currency,
                    })}
                  </span>
                </label>
              );
            })}
          </div>
        </Card>
      )}

      {plan.options.length === 0 && plan.addons.length === 0 && (
        <Card>
          <div className="text-center py-8 text-gray-500">
            No configuration options available for this plan
          </div>
        </Card>
      )}
    </div>
  );
};
