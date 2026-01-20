import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEstimate } from "@/lib/api";
import type { Estimate } from "@/types/api";

interface Options {
  onSuccess?: (newEstimate: Estimate) => void;
}

export function useCreateEstimate({ onSuccess }: Options) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEstimate,
    onSuccess: (newEstimate: Estimate) => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      onSuccess?.(newEstimate);
    },
  });
}
