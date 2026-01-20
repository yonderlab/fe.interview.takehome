"use client";

import { CreateEstimateButton } from "./CreateEstimateButton/CreateEstimateButton";
import { EstimatesList } from "./EstimatesList/EstimatesList";

interface EstimatesManagementProps {
  onCreateClick: (estimateId: string) => void;
  onClick: (estimateId: string) => void;
}

export const EstimatesManagement: React.FC<EstimatesManagementProps> = ({
  onCreateClick,
  onClick,
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Event Estimates
          </h1>
          <p className="text-gray-600">
            Manage your event estimates and create new ones
          </p>
        </div>
        <CreateEstimateButton onEstimateCreated={onCreateClick} />
      </div>

      <EstimatesList onCreateClick={onCreateClick} onClick={onClick} />
    </>
  );
};
