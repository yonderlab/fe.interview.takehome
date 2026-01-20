import { useQuery } from "@tanstack/react-query";
import { getProviders } from "@/lib/api";

export function useProviders() {
  const {
    data: providersResponse,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });

  const providers = providersResponse?.items || [];
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load providers"
    : null;

  return {
    providers,
    isLoading,
    error,
  };
}

