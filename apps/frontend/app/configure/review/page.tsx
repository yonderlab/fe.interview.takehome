"use client";
import { useConfiguration } from "@/context/ConfigurationContext";
import { useEstimateWithDrift, useFinaliseEstimate } from "@/fetch/hooks";
import { currencyFormatter } from "@/functions";
import { Button, Card, DataList, Heading } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export default function ReviewPage() {
  const router = useRouter();
  const { selectedPlan, selectedProvider, setWarningBarData } =
    useConfiguration();
  const { data } = useEstimateWithDrift();
  const { mutate } = useFinaliseEstimate();
  if (!selectedPlan || !selectedProvider || !data?.estimate) {
    router.push("/configure");
    return null;
  }

  const { addons, ...options } = data.estimate.selections;

  const submitEstimate = async () => {
    try {
      await mutate();
      router.push("/configure/submitted");
    } catch (error) {
      console.error(error);
      setWarningBarData({
        type: "error",
        message: "Failed to finalise estimate. Please try again.",
      });
    }
  };

  return (
    <Card className="w-auto">
      <Heading as="h1" className="mb-4">
        Review Your Event
      </Heading>
      {/* provider and plan details */}
      <div className="flex flex-col mb-4 py-2 border-b ">
        <div className="mb-2">
          <strong>Provider:</strong> {selectedProvider.name}
        </div>
        <div className="mb-2">
          <strong>Plan:</strong> {selectedPlan.name}
        </div>
      </div>

      {/* Options chosen */}
      <div className="flex flex-col mb-4 py-2 border-b gap-2">
        <strong>Options:</strong>
        {Object.keys(options).length === 0 && (
          <p className="mt-2">No options selected.</p>
        )}
        <DataList.Root size={"2"}>
          {Object.entries(options).map(([code, value]) => (
            <DataList.Item key={code}>
              <DataList.Label>
                {selectedPlan.options.find((opt) => opt.code === code)
                  ?.description || code}
              </DataList.Label>
              <DataList.Value>{value as string}</DataList.Value>
            </DataList.Item>
          ))}
        </DataList.Root>
      </div>

      {/* Addons chosen */}
      <div className="flex flex-col mb-4 py-2 border-b gap-2">
        <strong>Add-Ons:</strong>
        {(!addons || (Array.isArray(addons) && addons.length === 0)) && (
          <p className="mt-2">No add-ons selected.</p>
        )}
        <DataList.Root size={"2"}>
          {Array.isArray(addons) &&
            addons.map((addonId) => {
              const addon = selectedPlan.addons.find((a) => a.id === addonId);
              return (
                addon && (
                  <DataList.Item key={addon.id}>
                    <DataList.Label>{addon.name}</DataList.Label>
                    <DataList.Value>
                      {currencyFormatter(
                        addon.currency,
                        addon.price_cents / 100,
                      )}
                    </DataList.Value>
                  </DataList.Item>
                )
              );
            })}
        </DataList.Root>
      </div>

      {/* Estimated cost breakdown */}
      <div className="flex flex-col mb-4 py-2 border-b gap-2">
        <strong>Estimated Cost Breakdown:</strong>
        <DataList.Root size={"2"}>
          <DataList.Item>
            <DataList.Label>Base Price</DataList.Label>
            <DataList.Value>
              {currencyFormatter(
                data.estimate.pricing.currency,
                data.estimate.pricing.base / 100,
              )}
            </DataList.Value>
          </DataList.Item>
          {data.estimate.pricing.addons > 0 && (
            <DataList.Item>
              <DataList.Label>Add-Ons Total</DataList.Label>
              <DataList.Value>
                {currencyFormatter(
                  data.estimate.pricing.currency,
                  data.estimate.pricing.addons / 100,
                )}
              </DataList.Value>
            </DataList.Item>
          )}
          <DataList.Item>
            <DataList.Label>Total Price</DataList.Label>
            <DataList.Value className="text-lg font-bold text-blue-600">
              {currencyFormatter(
                data.estimate.pricing.currency,
                data.estimate.pricing.total / 100,
              )}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </div>

      <div className="flex flex-row justify-end gap-2">
        <Button
          variant="outline"
          className="mr-2"
          onClick={() => router.push("/configure/options")}
        >
          Back
        </Button>
        <Button
          disabled={data?.estimate.blocking_reasons.length > 0}
          aria-disabled={data?.estimate.blocking_reasons.length > 0}
          onClick={submitEstimate}
        >
          Submit your estimate
        </Button>
      </div>
    </Card>
  );
}
