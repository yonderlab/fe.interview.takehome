import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEstimate } from "@/lib/api";
import type { EstimatesResponse } from "@/types/api";

interface Options {
  onSuccess?: () => void;
}

export function useDeleteEstimate({ onSuccess }: Options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estimateId: string) => deleteEstimate(estimateId),
    onMutate: async (estimateId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["estimates"] });

      // Snapshot the previous value
      const previousEstimates = queryClient.getQueryData<EstimatesResponse>([
        "estimates",
      ]);

      // Optimistically update to the new value
      if (previousEstimates) {
        queryClient.setQueryData<EstimatesResponse>(["estimates"], {
          items: previousEstimates.items.filter(
            (estimate) => estimate.id !== estimateId
          ),
        });
      }

      return { previousEstimates };
    },
    onError: (err, estimateId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEstimates) {
        queryClient.setQueryData(["estimates"], context.previousEstimates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      onSuccess?.();
    },
  });
}

