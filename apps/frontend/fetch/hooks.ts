import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ProvidersResponse,
  PlansResponse,
  Plan,
  Estimate,
  UpdateEstimateBody,
  Provider,
} from "../types";
import { detectEstimatePriceDrift } from "@/functions";

const API_BASE_URL = "http://localhost:3002";

export function useProviders() {
  return useQuery<ProvidersResponse, Error, Provider[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/providers`);
      if (!res.ok) {
        throw new Error("Failed to fetch providers");
      }
      return res.json();
    },
    select: (data) => data.items,
  });
}

export function usePlans(providerId: string | null | undefined) {
  return useQuery<PlansResponse, Error, Plan[]>({
    queryKey: ["plans", providerId ?? ""],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE_URL}/plans?provider_id=${encodeURIComponent(providerId!)}`,
      );
      if (!res.ok) {
        throw new Error("Failed to fetch plans");
      }
      return res.json();
    },
    enabled: Boolean(providerId),
    select: (data) => data.items,
  });
}

export function useEstimateWithDrift() {
  const qc = useQueryClient();

  return useQuery<Estimate, Error, { estimate: Estimate; hasDrifted: boolean }>(
    {
      queryKey: ["estimate"],
      queryFn: async () => {
        const res = await fetch(`${API_BASE_URL}/estimate`);
        if (!res.ok) {
          throw new Error("Failed to fetch estimate");
        }
        return res.json();
      },
      select: (next) => {
        const prev = qc.getQueryData<Estimate>(["estimate"]);
        const hasDrifted = prev ? detectEstimatePriceDrift(prev, next) : false;
        return { estimate: next, hasDrifted };
      },
      refetchOnWindowFocus: true,
      staleTime: 15_000,
    },
  );
}

export function useUpdateEstimate() {
  const qc = useQueryClient();

  return useMutation<Estimate, Error, UpdateEstimateBody>({
    mutationFn: async (body: UpdateEstimateBody) => {
      const res = await fetch(`${API_BASE_URL}/estimate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("Failed to update estimate");
      }
      return res.json();
    },
    onSuccess: (next) => {
      qc.setQueryData(["estimate"], next);
    },
  });
}

export function useFinaliseEstimate() {
  const qc = useQueryClient();

  return useMutation<Estimate, Error, void>({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/estimate/finalise`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to finalise estimate");
      }
      return res.json();
    },
    onSuccess: (next) => {
      qc.setQueryData(["estimate"], next);
      qc.invalidateQueries({ queryKey: ["estimate"] });
    },
  });
}
