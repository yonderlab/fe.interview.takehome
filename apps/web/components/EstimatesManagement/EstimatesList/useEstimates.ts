import { useQuery } from "@tanstack/react-query";
import { listEstimates } from "@/lib/api";

export function useEstimates() {
  const {
    data: estimatesResponse,
    isLoading,
    error: queryError,
  } = useQuery({ queryKey: ["estimates"], queryFn: listEstimates });

  const estimates = estimatesResponse?.items || [];
  const error = getErrorMessage(queryError);

  return { estimates, isLoading, error };
}

function getErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return error instanceof Error ? error.message : "Failed to load estimates";
}
