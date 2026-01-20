"use client";

import { Button } from "@/components/ui/Button";
import type { Estimate } from "@/types/api";
import { useFinaliseEstimate } from "./useFinaliseEstimate";

interface Props {
  estimate: Estimate;
  estimateId: string;
}

export const FinaliseButton: React.FC<Props> = (props) => {
  const { estimate, estimateId } = props;

  const { finaliseEstimate, isPending, error } = useFinaliseEstimate({
    estimateId,
  });

  const canFinalise =
    (estimate.status === "draft" || estimate.status === "pending_approval") &&
    estimate.blocking_reasons.length === 0;

  if (!canFinalise) {
    return null;
  }

  const errorMessage = getErrorMessage(error);

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <Button
        variant="primary"
        onClick={() => {
          finaliseEstimate();
        }}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Submitting..." : "Submit Estimate"}
      </Button>
    </div>
  );
};

function getErrorMessage(error: Error | null) {
  if (!error) {
    return null;
  }
  return error instanceof Error ? error.message : "Failed to finalise estimate";
}
