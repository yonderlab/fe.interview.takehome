import { useQuery } from "@tanstack/react-query";
import { getPlans } from "@/lib/api";

export function usePlans(providerId: string | undefined) {
  const {
    data: plansResponse,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["plans", providerId],
    queryFn: () => {
      if (!providerId) {
        throw new Error("Provider ID is required");
      }
      return getPlans(providerId);
    },
    enabled: !!providerId,
  });

  const plans = plansResponse?.items || [];
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load plans"
    : null;

  return {
    plans,
    isLoading,
    error,
  };
}
