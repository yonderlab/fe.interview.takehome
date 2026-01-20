"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEstimateById } from "@/lib/api";
import type { Provider, Plan } from "@/types/api";
import { Summary } from "./Summary";
import { ConfigureEstimateWizard } from "./ConfigureEstimateWizard";
import { Button } from "@/components/ui/Button";

interface Props {
  estimateId: string;
  onBackToEstimates: () => void;
}

export const ConfigureEstimate: React.FC<Props> = ({
  estimateId,
  onBackToEstimates,
}) => {
  const { estimate, isLoading, error } = useEstimate(estimateId);

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  if (isLoading) {
    return (
      <Container>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !estimate) {
    return (
      <Container>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl text-red-600">
              Error: {getErrorMessage(error) || "Estimate not found"}
            </div>
            <Button
              variant="secondary"
              onClick={onBackToEstimates}
              className="mt-4"
            >
              Back to Estimates
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Event Estimate Builder
          </h1>
          <p className="text-gray-600">
            Select a provider and plan, then configure your event
          </p>
        </div>
        <Button variant="secondary" onClick={onBackToEstimates}>
          Back to Estimates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ConfigureEstimateWizard
            estimateId={estimateId}
            estimate={estimate}
            onProviderSelected={(provider) => setSelectedProvider(provider)}
            onPlanSelected={(plan) => setCurrentPlan(plan)}
          />
        </div>
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8 space-y-6">
            <Summary
              estimate={estimate}
              provider={selectedProvider}
              plan={currentPlan}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

function useEstimate(estimateId: string) {
  const query = useQuery({
    queryKey: ["estimate", estimateId],
    queryFn: () => getEstimateById(estimateId),
  });
  return { estimate: query.data || null, ...query };
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : "Failed to load estimate";
}

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">{children}</div>
    </main>
  );
};
