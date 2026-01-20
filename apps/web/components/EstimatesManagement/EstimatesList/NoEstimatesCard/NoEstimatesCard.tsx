"use client";

import { Card } from "@/components/ui/Card";
import { CreateEstimateButton } from "../../CreateEstimateButton/CreateEstimateButton";

interface Props {
  onCreateClick: (estimateId: string) => void;
}

export const NoEstimatesCard: React.FC<Props> = ({ onCreateClick }) => {
  return (
    <Card>
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No estimates found</p>
        <CreateEstimateButton onEstimateCreated={onCreateClick} />
      </div>
    </Card>
  );
};
