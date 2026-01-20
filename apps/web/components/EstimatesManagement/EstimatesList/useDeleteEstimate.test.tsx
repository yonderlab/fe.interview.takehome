import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteEstimate } from "./useDeleteEstimate";
import * as api from "@/lib/api";
import type { EstimatesResponse } from "@/types/api";

jest.mock("@/lib/api", () => ({
  deleteEstimate: jest.fn(),
}));

const createMockEstimate = (id: string) => ({
  id,
  status: "draft" as const,
  plan: { id: "plan_1", name: "Test Plan" },
  selections: { addons: [] },
  pricing: {
    base: 10000,
    addons: 0,
    total: 10000,
    currency: "EUR",
  },
  blocking_reasons: [],
});

const createMockEstimatesResponse = (
  items: EstimatesResponse["items"]
): EstimatesResponse => ({
  items,
});

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteEstimate", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  it("returns mutation object with mutate function", () => {
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

    expect(result.current).toHaveProperty("mutate");
    expect(result.current).toHaveProperty("isPending");
    expect(typeof result.current.mutate).toBe("function");
  });

  it("calls deleteEstimate API with estimate ID when mutate is called", async () => {
    (api.deleteEstimate as jest.Mock).mockResolvedValue(undefined);
    const wrapper = createWrapper(queryClient);
    const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

    result.current.mutate("est_123");

    await waitFor(() => {
      expect(api.deleteEstimate).toHaveBeenCalledWith("est_123");
      expect(api.deleteEstimate).toHaveBeenCalledTimes(1);
    });
  });

  describe("when mutation succeeds", () => {
    it("invalidates estimates query", async () => {
      (api.deleteEstimate as jest.Mock).mockResolvedValue(undefined);
      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

      result.current.mutate("est_123");

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ["estimates"],
        });
      });
    });

    it("calls onSuccess callback when provided", async () => {
      const mockOnSuccess = jest.fn();
      (api.deleteEstimate as jest.Mock).mockResolvedValue(undefined);
      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useDeleteEstimate({ onSuccess: mockOnSuccess }), {
        wrapper,
      });

      result.current.mutate("est_123");

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("does NOT call onSuccess when it is not provided", async () => {
      (api.deleteEstimate as jest.Mock).mockResolvedValue(undefined);
      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

      result.current.mutate("est_123");

      await waitFor(() => {
        expect(api.deleteEstimate).toHaveBeenCalled();
      });
    });
  });

  describe("optimistic updates", () => {
    it("removes estimate from cache optimistically before API call", async () => {
      const estimates = createMockEstimatesResponse([
        createMockEstimate("est_1"),
        createMockEstimate("est_2"),
        createMockEstimate("est_3"),
      ]);
      queryClient.setQueryData(["estimates"], estimates);
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      (api.deleteEstimate as jest.Mock).mockReturnValue(deletePromise);
      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

      result.current.mutate("est_2");

      await waitFor(() => {
        const cachedData = queryClient.getQueryData<EstimatesResponse>(["estimates"]);
        expect(cachedData?.items).toHaveLength(2);
        expect(cachedData?.items.find((e) => e.id === "est_2")).toBeUndefined();
        expect(cachedData?.items.find((e) => e.id === "est_1")).toBeDefined();
        expect(cachedData?.items.find((e) => e.id === "est_3")).toBeDefined();
      });

      resolveDelete!();
      await waitFor(() => {
        expect(api.deleteEstimate).toHaveBeenCalled();
      });
    });

    it("rolls back optimistic update when mutation fails", async () => {
      const estimates = createMockEstimatesResponse([
        createMockEstimate("est_1"),
        createMockEstimate("est_2"),
      ]);
      queryClient.setQueryData(["estimates"], estimates);
      const error = new Error("Delete failed");
      (api.deleteEstimate as jest.Mock).mockRejectedValue(error);
      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

      result.current.mutate("est_2");

      await waitFor(() => {
        const cachedData = queryClient.getQueryData<EstimatesResponse>(["estimates"]);
        expect(cachedData?.items).toEqual(estimates.items);
        expect(cachedData?.items.length).toBe(2);
        expect(cachedData?.items.find((e) => e.id === "est_2")).toBeDefined();
      });
    });

    it("does NOT update cache when previous estimates do NOT exist", async () => {
      (api.deleteEstimate as jest.Mock).mockResolvedValue(undefined);
      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

      result.current.mutate("est_123");

      await waitFor(() => {
        expect(api.deleteEstimate).toHaveBeenCalled();
      });

      const cachedData = queryClient.getQueryData<EstimatesResponse>(["estimates"]);
      expect(cachedData).toBeUndefined();
    });
  });

  describe("when mutation fails", () => {
    it("handles API errors", async () => {
      const error = new Error("Delete failed");
      (api.deleteEstimate as jest.Mock).mockRejectedValue(error);
      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useDeleteEstimate(), { wrapper });

      result.current.mutate("est_123");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});

