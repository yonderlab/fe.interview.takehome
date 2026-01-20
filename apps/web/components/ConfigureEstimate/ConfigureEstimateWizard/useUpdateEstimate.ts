import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEstimate } from "@/lib/api";
import type { Estimate, UpdateEstimateRequest } from "@/types/api";

interface UseUpdateEstimateOptions {
  estimateId: string;
  onSuccess?: (updatedEstimate: Estimate) => void;
  onError?: (error: Error) => void;
}

export function useUpdateEstimate({
  estimateId,
  onSuccess,
  onError,
}: UseUpdateEstimateOptions) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UpdateEstimateRequest) => updateEstimate(data),
    onSuccess: (updatedEstimate: Estimate) => {
      queryClient.setQueryData(["estimate", estimateId], updatedEstimate);
      onSuccess?.(updatedEstimate);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
  return { updateEstimate: mutate, isPending };
}
