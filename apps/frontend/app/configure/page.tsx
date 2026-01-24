"use client";

import { useConfiguration } from "@/context/ConfigurationContext";
import {
  useEstimateWithDrift,
  usePlans,
  useProviders,
  useUpdateEstimate,
} from "@/fetch/hooks";
import {
  Badge,
  Button,
  Flex,
  Grid,
  RadioCards,
  Spinner,
  Text,
} from "@radix-ui/themes";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { currencyFormatter } from "@/functions";
import { useRouter } from "next/navigation";

const approvalTypeMap = {
  none: "No Approval",
  manager_review: "Manager Review",
};
export default function ConfigurePage() {
  const router = useRouter();
  const {
    selectedProvider,
    selectedPlan,
    setSelectedPlan,
    setSelectedProvider,
    setWarningBarData,
  } = useConfiguration();
  const { data: providers, isLoading: isLoadingProviders } = useProviders();
  const { data: plans, isLoading: isLoadingPlans } = usePlans(
    selectedProvider?.id,
  );

  const { mutate } = useUpdateEstimate();
  const { data } = useEstimateWithDrift();

  const handleNextStep = async () => {
    const existingSelections = data?.estimate.selections || {};

    // Get available option codes and their valid values from the new plan
    const availableOptions = new Map(
      selectedPlan?.options.map((opt) => [opt.code, opt.values]) || [],
    );

    // Get available addon IDs from the new plan
    const availableAddonIds = new Set(
      selectedPlan?.addons.map((addon) => addon.id) || [],
    );

    // Filter existing selections to only keep valid options and values
    const filteredSelections: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(existingSelections)) {
      if (key === "addons") {
        // Filter addons to only keep those available in the new plan
        const existingAddons = Array.isArray(value) ? value : [];
        filteredSelections.addons = existingAddons.filter((addonId) =>
          availableAddonIds.has(addonId),
        );
      } else if (key !== "provider_id" && key !== "plan_id") {
        // Check if this option exists in the new plan
        const validValues = availableOptions.get(key);
        if (validValues) {
          // Keep the selection if the value is still valid
          if (Array.isArray(value)) {
            const filteredValues = value.filter((v) => validValues.includes(v));
            if (filteredValues.length > 0) {
              filteredSelections[key] = filteredValues;
            }
          } else if (typeof value === "string" && validValues.includes(value)) {
            filteredSelections[key] = value;
          }
        }
      }
    }

    try {
      await mutate({
        plan_id: selectedPlan?.id,
        selections: filteredSelections,
      });
      router.push("/configure/options");
    } catch (error) {
      console.error("Failed to update estimate with the selected plan.", error);
      setWarningBarData({
        type: "error",
        message:
          "Failed to update estimate with the selected plan. Please try again.",
      });
    }
  };

  return (
    <Grid columns="2" gap="5" width="auto" className="pb-4">
      <div className="col-span-2 sm:col-span-1">
        <fieldset aria-labelledby="provider-legend" className="mb-6">
          <legend id="provider-legend" className="text-2xl font-bold mb-4">
            Select a Provider
          </legend>
          {isLoadingProviders && (
            <Flex align="center" justify="center" py="6">
              <Spinner size="3" />
            </Flex>
          )}
          {!isLoadingProviders && providers?.length === 0 && (
            <Text>No providers available at this time.</Text>
          )}
          {!isLoadingProviders && providers && providers.length > 0 && (
            <RadioCards.Root
              columns={"1"}
              aria-label="Provider options"
              role="radiogroup"
              value={selectedProvider?.id}
            >
              {providers.map((provider) => (
                <RadioCards.Item
                  value={provider.id}
                  key={provider.id}
                  aria-label={provider.name}
                  aria-checked={selectedProvider?.id === provider.id}
                  role="radio"
                  onClick={() => setSelectedProvider(provider)}
                >
                  <Flex direction="column" width="100%">
                    {provider.logo_url ? (
                      <Image
                        src={provider.logo_url}
                        alt={provider.name + " logo"}
                        width={200}
                        height={24}
                      />
                    ) : (
                      <span aria-label="No logo available" role="img">
                        <Building2 size={24} aria-hidden="true" />
                      </span>
                    )}
                    <Text
                      as="span"
                      weight="bold"
                      id={`provider-label-${provider.id}`}
                    >
                      {provider.name}
                    </Text>
                    {provider.location && (
                      <Text as="span" id={`provider-location-${provider.id}`}>
                        {provider.location}
                      </Text>
                    )}
                  </Flex>
                </RadioCards.Item>
              ))}
            </RadioCards.Root>
          )}
        </fieldset>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <fieldset aria-labelledby="plan-legend">
          <legend id="plan-legend" className="text-2xl font-bold mb-4">
            Select a plan
          </legend>
          {/* Plan selection components go here */}
          <div aria-live="polite">
            {!selectedProvider?.id && (
              <Text>Please select a provider to see available plans.</Text>
            )}
            {selectedProvider?.id && isLoadingPlans && (
              <Flex align="center" justify="center" py="6">
                <Spinner size="3" />
              </Flex>
            )}
            {selectedProvider?.id && plans?.length === 0 && !isLoadingPlans && (
              <Text>No plans available for the selected provider.</Text>
            )}
          </div>
          {!isLoadingPlans && plans && plans.length > 0 && (
            <RadioCards.Root columns={"1"} value={selectedPlan?.id}>
              {plans?.map((plan) => (
                <RadioCards.Item
                  value={plan.id}
                  key={plan.id}
                  aria-label={plan.name}
                  aria-checked={selectedPlan?.id === plan.id}
                  role="radio"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Flex
                    direction="column"
                    width="100%"
                    className="flex flex-col gap-2"
                  >
                    <Text as="span" weight="bold" id={`plan-label-${plan.id}`}>
                      {plan.name}
                    </Text>
                    {plan.description && (
                      <Text as="span" id={`plan-description-${plan.id}`}>
                        {plan.description}
                      </Text>
                    )}
                    <Flex gap="2">
                      <Badge color="gray">
                        Lead time: {plan.lead_time_days} days
                      </Badge>
                      <Badge color="gray">
                        Minimum participants: {plan.min_participants}
                      </Badge>
                      <Badge color="gray">
                        Approval type: {approvalTypeMap[plan.approval_type]}
                      </Badge>
                    </Flex>
                    <Text
                      as="span"
                      id={`plan-price-${plan.id}`}
                      className="text-lg font-bold"
                    >
                      Base Price:{" "}
                      {currencyFormatter(
                        plan.currency,
                        plan.base_price_cents / 100,
                      )}
                    </Text>
                  </Flex>
                </RadioCards.Item>
              ))}
            </RadioCards.Root>
          )}
        </fieldset>
      </div>
      <div className="col-span-2 justify-end flex mt-4">
        <Button
          disabled={!selectedProvider?.id || !selectedPlan?.id}
          onClick={handleNextStep}
          aria-disabled={!selectedProvider?.id || !selectedPlan?.id}
          aria-label="Next: Configure Package"
        >
          Next: Configure Package
        </Button>
      </div>
    </Grid>
  );
}
