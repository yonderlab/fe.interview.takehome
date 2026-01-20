"use client";

import { NoEstimatesCard } from "./NoEstimatesCard/NoEstimatesCard";
import { EstimateCard } from "./EstimateCard/EstimateCard";
import { EstimatesLoading } from "./EstimatesLoading";
import { useEstimates } from "./useEstimates";
import { useDeleteEstimate } from "./useDeleteEstimate";

interface Props {
  onCreateClick: (estimateId: string) => void;
  onClick: (estimateId: string) => void;
}

export const EstimatesList: React.FC<Props> = ({ onCreateClick, onClick }) => {
  const { estimates, isLoading, error } = useEstimates();
  const { mutate: deleteEstimate } = useDeleteEstimate();

  if (isLoading) {
    return <EstimatesLoading />;
  }

  return (
    <>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      {estimates.length === 0 ? (
        <NoEstimatesCard onCreateClick={onCreateClick} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {estimates.map((estimate) => (
            <EstimateCard
              key={estimate.id}
              estimate={estimate}
              onClick={() => onClick(estimate.id)}
              onDelete={(estimateId) => deleteEstimate(estimateId)}
            />
          ))}
        </div>
      )}
    </>
  );
};
