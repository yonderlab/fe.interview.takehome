"use client";
import { useConfiguration } from "@/context/ConfigurationContext";
import { useEstimateWithDrift, useUpdateEstimate } from "@/fetch/hooks";
import { currencyFormatter, handleUnknownDescription } from "@/functions";
import {
  Badge,
  Button,
  Callout,
  Card,
  CheckboxCards,
  Grid,
  Heading,
  Select,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OptionsAddonsPage() {
  const { data } = useEstimateWithDrift();
  const { mutate } = useUpdateEstimate();
  const { selectedPlan, selectedProvider, setWarningBarData } =
    useConfiguration();
  const router = useRouter();

  // Auto-select single-value required options
  useEffect(() => {
    if (!data?.estimate) return;
    const autoSelected: Record<string, string> = {};
    selectedPlan?.options.forEach((option) => {
      if (
        option.required &&
        Array.isArray(option.values) &&
        option.values.length === 1 &&
        data.estimate.selections?.[option.code] !== option.values[0]
      ) {
        autoSelected[option.code] = option.values[0];
      }
    });
    if (Object.keys(autoSelected).length > 0) {
      mutate({
        plan_id: selectedPlan?.id,
        selections: {
          ...data.estimate.selections,
          ...autoSelected,
          addons: data.estimate.selections?.addons as string[],
        },
      });
    }
  }, [selectedPlan?.id, selectedPlan?.options, data?.estimate, mutate]);

  if (!data?.estimate || !selectedPlan) {
    router.push("/configure");
    return null;
  }

  const handleAddonChange = (addonId: string) => {
    const existingAddons =
      (data?.estimate?.selections?.addons as string[]) || [];
    let updatedAddons: string[];
    if (existingAddons.includes(addonId)) {
      // Remove the addon
      updatedAddons = existingAddons.filter((id) => id !== addonId);
    } else {
      // Add the addon
      updatedAddons = [...existingAddons, addonId];
    }

    try {
      mutate({
        plan_id: selectedPlan.id,
        selections: {
          ...data?.estimate?.selections,
          addons: updatedAddons,
        },
      });
    } catch (error) {
      console.error(error);
      setWarningBarData({
        type: "error",
        message:
          "Failed to update estimate with the selected add-ons. Please try again.",
      });
    }
  };

  const handleChangeOption = (code: string, value: string) => {
    const updatedOptions = { ...data?.estimate?.selections, [code]: value };
    try {
      mutate({
        plan_id: selectedPlan.id,
        selections: {
          ...updatedOptions,
          addons: data?.estimate?.selections?.addons as string[],
        },
      });
    } catch (error) {
      console.error(error);
      setWarningBarData({
        type: "error",
        message:
          "Failed to update estimate with the selected option. Please try again.",
      });
    }
  };

  return (
    <Grid columns={"3"} gap={"5"} width="auto">
      <div className="col-span-3 sm:col-span-2">
        <Card>
          <Heading as="h2">Package Options</Heading>
          {selectedPlan.options.length === 0 && (
            <p className="mt-4">No configurable options for this plan.</p>
          )}

          <div className="flex flex-col gap-4 mt-4">
            {selectedPlan.options.map((option) => (
              <div
                key={option.code}
                className="flex justify-between flex-col gap-2"
              >
                <label>
                  {option.description || handleUnknownDescription(option.code)}
                  <Badge
                    color={option.required ? "red" : "gray"}
                    size="1"
                    className="ml-2"
                  >
                    {option.required ? "Required" : "Optional"}
                  </Badge>
                </label>
                {Array.isArray(option.values) && option.values.length === 1 ? (
                  // Single value option - display as read-only, auto-select on mount
                  <Text className="px-3 py-2 bg-gray-100 rounded border text-gray-700">
                    {option.values[0]}
                  </Text>
                ) : Array.isArray(option.values) && option.values.length > 1 ? (
                  <Select.Root
                    value={data?.estimate?.selections?.[option.code] as string}
                    name={option.code}
                    onValueChange={(value) =>
                      handleChangeOption(option.code, value)
                    }
                  >
                    <Select.Trigger placeholder="Select an option" />
                    <Select.Content>
                      {option.values.map((value) => (
                        <Select.Item key={value} value={value}>
                          {value}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
        <Card className="mt-6 flex flex-col gap-4">
          <Heading as="h2">Add-Ons</Heading>
          {selectedPlan.addons.length === 0 && (
            <p className="mt-4">No add-ons available for this plan.</p>
          )}
          <CheckboxCards.Root
            columns={"1"}
            value={data?.estimate.selections.addons as string[]}
            aria-label="Add-On options"
          >
            {selectedPlan.addons.map((addon) => (
              <CheckboxCards.Item
                key={addon.id}
                value={addon.id}
                className="flex flex-row justify-between items-center"
                onClick={(e) => handleAddonChange(e.currentTarget.value)}
              >
                <Text weight="bold">
                  {addon.name || handleUnknownDescription(addon.id)}
                </Text>
                <Text>
                  {addon.price_cents === 0
                    ? "Free"
                    : currencyFormatter(
                        addon.currency,
                        addon.price_cents / 100,
                      )}
                </Text>
              </CheckboxCards.Item>
            ))}
          </CheckboxCards.Root>
        </Card>
      </div>
      <Card className="col-span-3 sm:col-span-1">
        <h2 className="text-2xl font-bold mb-4">Summary</h2>
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Provider</p>
            <p className="font-medium">{selectedProvider?.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Plan</p>
            <p className="font-medium">{selectedPlan.name}</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">Base Price</p>
            <p className="text-lg font-semibold">
              {currencyFormatter(
                data.estimate.pricing.currency,
                data.estimate.pricing.base / 100,
              )}
            </p>
          </div>
          {(data.estimate?.selections?.addons as string[]) &&
            (data.estimate?.selections.addons as string[]).length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Add-ons</p>
                <div className="space-y-1 text-sm">
                  {(data.estimate?.selections.addons as string[]).map(
                    (addOnId) => {
                      const addOn = selectedPlan.addons.find(
                        (a) => a.id === addOnId,
                      );
                      return addOn ? (
                        <div key={addOn.id} className="flex justify-between">
                          <span className="text-gray-700">{addOn.name}</span>
                          <span className="font-medium">
                            {addOn.price_cents === 0
                              ? "Free"
                              : currencyFormatter(
                                  addOn.currency,
                                  addOn.price_cents / 100,
                                )}
                          </span>
                        </div>
                      ) : null;
                    },
                  )}
                </div>
              </div>
            )}

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">Total Price</p>
            <p
              className="text-3xl font-bold text-blue-600"
              role="status"
              aria-live="polite"
            >
              {currencyFormatter(
                data?.estimate.pricing.currency,
                data?.estimate.pricing.total / 100,
              )}
            </p>
          </div>

          {data?.estimate.blocking_reasons.length > 0 && (
            <Callout.Root color="red" className="mb-2">
              <strong>Required:</strong>
              <ul className="list-disc list-inside mt-1">
                {data.estimate.blocking_reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </Callout.Root>
          )}

          {data.hasDrifted && (
            <Callout.Root color="amber" className="mb-2">
              <Callout.Text>
                Your total has changed. Please review the price.
              </Callout.Text>
            </Callout.Root>
          )}
        </div>

        <div className="col-span-3 flex flex-row justify-end gap-2">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => router.push("/configure")}
          >
            Back
          </Button>
          <Button
            disabled={data?.estimate.blocking_reasons.length > 0}
            aria-disabled={data?.estimate.blocking_reasons.length > 0}
            onClick={() => router.push("/configure/review")}
          >
            Review
          </Button>
        </div>
      </Card>
    </Grid>
  );
}
