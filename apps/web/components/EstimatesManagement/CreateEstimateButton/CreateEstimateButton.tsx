"use client";

import { Button } from "@/components/ui/Button";
import { Estimate } from "@/types/api";
import { useCreateEstimate } from "./useCreateEstimate";

interface CreateEstimateButtonProps {
  onEstimateCreated: (estimateId: string) => void;
}

export function CreateEstimateButton({
  onEstimateCreated,
}: CreateEstimateButtonProps) {
  const { mutate, isPending } = useCreateEstimate({
    onSuccess: (newEstimate: Estimate) => {
      onEstimateCreated(newEstimate.id);
    },
  });

  return (
    <Button variant="primary" onClick={() => mutate()} disabled={isPending}>
      {isPending ? "Creating..." : "Create New Estimate"}
    </Button>
  );
}
