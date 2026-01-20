import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEstimates } from "./useEstimates";
import * as api from "@/lib/api";
import type { EstimatesResponse } from "@/types/api";

jest.mock("@/lib/api", () => ({
  listEstimates: jest.fn(),
}));

const createMockEstimatesResponse = (items: EstimatesResponse["items"] = []): EstimatesResponse => ({
  items,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useEstimates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns empty array when data is not loaded", () => {
    (api.listEstimates as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEstimates(), { wrapper });

    expect(result.current.estimates).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("returns estimates when API call succeeds", async () => {
    const mockEstimates = createMockEstimatesResponse([
      {
        id: "est_1",
        status: "draft",
        plan: { id: "plan_1", name: "Plan 1" },
        selections: { addons: [] },
        pricing: { base: 10000, addons: 0, total: 10000, currency: "EUR" },
        blocking_reasons: [],
      },
      {
        id: "est_2",
        status: "finalised",
        plan: { id: "plan_2", name: "Plan 2" },
        selections: { addons: [] },
        pricing: { base: 20000, addons: 0, total: 20000, currency: "EUR" },
        blocking_reasons: [],
      },
    ]);
    (api.listEstimates as jest.Mock).mockResolvedValue(mockEstimates);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEstimates(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.estimates).toEqual(mockEstimates.items);
    expect(result.current.estimates.length).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it("returns empty array when API returns empty items", async () => {
    const mockEstimates = createMockEstimatesResponse([]);
    (api.listEstimates as jest.Mock).mockResolvedValue(mockEstimates);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEstimates(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.estimates).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  describe("when API call fails", () => {
    it("returns error message when Error instance is thrown", async () => {
      const error = new Error("Network error");
      (api.listEstimates as jest.Mock).mockRejectedValue(error);
      const wrapper = createWrapper();
      const { result } = renderHook(() => useEstimates(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.estimates).toEqual([]);
    });

    it("returns default error message when non-Error is thrown", async () => {
      (api.listEstimates as jest.Mock).mockRejectedValue("Unknown error");
      const wrapper = createWrapper();
      const { result } = renderHook(() => useEstimates(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to load estimates");
      expect(result.current.estimates).toEqual([]);
    });

    it("returns null error when there is no error", async () => {
      const mockEstimates = createMockEstimatesResponse([]);
      (api.listEstimates as jest.Mock).mockResolvedValue(mockEstimates);
      const wrapper = createWrapper();
      const { result } = renderHook(() => useEstimates(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });
  });
});

