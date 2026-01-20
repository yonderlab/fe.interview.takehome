"use client";

import { useState, useEffect } from "react";
import type { Estimate, Plan, Provider } from "@/types/api";
import { ProvidersList } from "./ProvidersList";
import { PlansList } from "./PlansList";
import { PlanConfigs } from "./PlanConfigs";
import { FinaliseButton } from "./FinaliseButton";
import { Wizard } from "@/components/ui/Wizard/Wizard";
import { useUpdateEstimate } from "./useUpdateEstimate";
import { useProviders } from "./ProvidersList/useProviders";
import { usePlans } from "./PlansList/usePlans";
import { getPlans } from "@/lib/api";

interface Props {
  estimateId: string;
  estimate: Estimate | null;
  onProviderSelected?: (provider: Provider) => void;
  onPlanSelected?: (plan: Plan) => void;
}

export const ConfigureEstimateWizard: React.FC<Props> = (props) => {
  const { estimateId, estimate, onProviderSelected, onPlanSelected } = props;
  const { updateEstimate: updateEstimateMutation } = useUpdateEstimate({
    estimateId,
  });

  const [selectedProviderId, setSelectedProviderId] = useState<
    string | undefined
  >();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeStep, setActiveStep] = useState<
    "provider" | "plan" | "configure"
  >("provider");

  const { providers } = useProviders();
  const { plans: plansForProvider } = usePlans(selectedProviderId);

  // Initialize state from estimate when it loads
  useEffect(() => {
    if (
      !estimate ||
      !isInitializing ||
      selectedProviderId ||
      providers.length === 0
    )
      return;

    const findProviderAndPlan = async () => {
      for (const provider of providers) {
        try {
          const plansResponse = await getPlans(provider.id);
          const plan = plansResponse.items.find(
            (p: Plan) => p.id === estimate.plan.id
          );

          if (plan) {
            setSelectedProviderId(provider.id);
            setSelectedPlan(plan);
            setActiveStep("configure");
            onProviderSelected?.(provider);
            onPlanSelected?.(plan);
            setIsInitializing(false);
            return;
          }
        } catch (error) {
          // Continue to next provider if this one fails
          continue;
        }
      }
      setIsInitializing(false);
    };

    findProviderAndPlan();
  }, [
    estimate,
    providers,
    isInitializing,
    selectedProviderId,
    onProviderSelected,
    onPlanSelected,
  ]);

  // Also check plansForProvider when they load (fallback for when provider is already selected)
  useEffect(() => {
    if (
      !estimate ||
      selectedPlan ||
      !selectedProviderId ||
      plansForProvider.length === 0 ||
      !isInitializing
    )
      return;

    const plan = plansForProvider.find((p) => p.id === estimate.plan.id);
    if (plan) {
      setSelectedPlan(plan);
      setActiveStep("configure");
      onPlanSelected?.(plan);
      setIsInitializing(false);
    }
  }, [
    estimate,
    selectedProviderId,
    plansForProvider,
    selectedPlan,
    isInitializing,
    onPlanSelected,
  ]);

  return (
    <Wizard
      steps={[
        {
          id: "provider",
          title: "Select Provider",
          isCompleted: !!selectedProviderId,
          isActive: activeStep === "provider",
          onClick: () => {
            setActiveStep("provider");
          },
          component: (
            <ProvidersList
              onSelect={(provider) => {
                setSelectedProviderId(provider.id);
                setSelectedPlan(null);
                setActiveStep("plan");
                onProviderSelected?.(provider);
              }}
              selectedId={selectedProviderId}
            />
          ),
        },
        {
          id: "plan",
          title: "Select Plan",
          isCompleted: !!selectedPlan,
          isActive: activeStep === "plan",
          onClick: () => {
            if (selectedProviderId) {
              setActiveStep("plan");
            }
          },
          component: (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Available Plans
              </h2>
              {selectedProviderId && (
                <PlansList
                  providerId={selectedProviderId}
                  selectedId={selectedPlan?.id}
                  onSelect={(plan) => {
                    setSelectedPlan(plan);
                    setActiveStep("configure");
                    onPlanSelected?.(plan);

                    updateEstimateMutation({
                      plan_id: plan.id,
                      selections: estimate?.selections || { addons: [] },
                    });
                  }}
                />
              )}
            </>
          ),
        },
        {
          id: "configure",
          title: "Configure Event",
          isCompleted:
            !!estimate &&
            !!selectedPlan &&
            estimate.blocking_reasons.length === 0,
          isActive: activeStep === "configure",
          onClick: () => {
            if (selectedPlan && estimate) {
              setActiveStep("configure");
            }
          },
          component: (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Configure Your Event
              </h2>
              {selectedPlan && estimate && (
                <>
                  <PlanConfigs
                    plan={selectedPlan}
                    estimate={estimate}
                    onUpdate={(selections) => {
                      if (!selectedPlan) return;

                      updateEstimateMutation({
                        plan_id: selectedPlan.id,
                        selections,
                      });
                    }}
                  />
                  {(estimate.status === "draft" ||
                    estimate.status === "pending_approval") &&
                    estimate.blocking_reasons.length === 0 && (
                      <div className="mt-6">
                        <FinaliseButton
                          estimate={estimate}
                          estimateId={estimateId}
                        />
                      </div>
                    )}
                </>
              )}
            </>
          ),
        },
      ]}
    />
  );
};
