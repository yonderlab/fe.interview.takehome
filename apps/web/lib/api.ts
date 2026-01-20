import type {
  ProvidersResponse,
  PlansResponse,
  Estimate,
  EstimatesResponse,
  UpdateEstimateRequest,
  FinaliseEstimateResponse,
  ApiError,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message || `API error: ${response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getProviders(): Promise<ProvidersResponse> {
  return fetchApi<ProvidersResponse>("/providers");
}

export async function getPlans(providerId: string): Promise<PlansResponse> {
  return fetchApi<PlansResponse>(
    `/plans?provider_id=${encodeURIComponent(providerId)}`
  );
}

export async function getEstimate(): Promise<Estimate> {
  return fetchApi<Estimate>("/estimate");
}

export async function updateEstimate(
  data: UpdateEstimateRequest
): Promise<Estimate> {
  return fetchApi<Estimate>("/estimate", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function finaliseEstimate(): Promise<FinaliseEstimateResponse> {
  return fetchApi<FinaliseEstimateResponse>("/estimate/finalise", {
    method: "POST",
  });
}

export async function listEstimates(): Promise<EstimatesResponse> {
  return fetchApi<EstimatesResponse>("/estimates");
}

export async function createEstimate(): Promise<Estimate> {
  return fetchApi<Estimate>("/estimates", {
    method: "POST",
  });
}

export async function getEstimateById(id: string): Promise<Estimate> {
  return fetchApi<Estimate>(`/estimates/${id}`);
}

export async function deleteEstimate(id: string): Promise<void> {
  return fetchApi<void>(`/estimates/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
