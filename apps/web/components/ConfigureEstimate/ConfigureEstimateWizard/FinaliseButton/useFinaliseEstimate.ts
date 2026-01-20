import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finaliseEstimate } from "@/lib/api";
import type { FinaliseEstimateResponse } from "@/types/api";
import { useState } from "react";

interface Options {
  estimateId: string;
  onSuccess?: (response: FinaliseEstimateResponse) => void;
}

export function useFinaliseEstimate(options: Options) {
  const { estimateId, onSuccess } = options;
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: finaliseEstimate,
    onSuccess: (response: FinaliseEstimateResponse) => {
      queryClient.setQueryData(["estimate", estimateId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: response.status,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      onSuccess?.(response);
    },
    onError: (error: Error) => {
      setError(error);
    },
  });
  return { finaliseEstimate: mutate, isPending, error };
}
