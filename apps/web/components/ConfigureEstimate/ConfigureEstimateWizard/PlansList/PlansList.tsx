"use client";

import { PlanCard } from "./PlanCard";
import { Card } from "@/components/ui/Card";
import { usePlans } from "./usePlans";
import { Plan } from "@/types/api";

interface Props {
  providerId: string;
  selectedId?: string;
  onSelect: (plan: Plan) => void;
}

export const PlansList: React.FC<Props> = (props) => {
  const { providerId, selectedId, onSelect } = props;
  const { plans, isLoading, error } = usePlans(providerId);

  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-8">Loading plans...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 text-red-600">Error: {error}</div>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          No plans available for this provider
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isSelected={selectedId === plan.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
