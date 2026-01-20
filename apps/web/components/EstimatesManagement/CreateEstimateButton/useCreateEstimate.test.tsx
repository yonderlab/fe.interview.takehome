import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateEstimate } from "./useCreateEstimate";
import * as api from "@/lib/api";
import type { Estimate } from "@/types/api";

jest.mock("@/lib/api", () => ({
  createEstimate: jest.fn(),
}));

const createMockEstimate = (overrides?: Partial<Estimate>): Estimate => ({
  id: "est_123",
  status: "draft",
  plan: {
    id: "plan_1",
    name: "Test Plan",
  },
  selections: { addons: [] },
  pricing: {
    base: 10000,
    addons: 0,
    total: 10000,
    currency: "EUR",
  },
  blocking_reasons: [],
  ...overrides,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";

  return Wrapper;
};

describe("useCreateEstimate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mutation object with mutate function", () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateEstimate({}), { wrapper });

    expect(result.current).toHaveProperty("mutate");
    expect(result.current).toHaveProperty("isPending");
    expect(typeof result.current.mutate).toBe("function");
  });

  it("calls createEstimate API when mutate is called", async () => {
    const mockEstimate = createMockEstimate({ id: "est_456" });
    (api.createEstimate as jest.Mock).mockResolvedValue(mockEstimate);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateEstimate({}), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(api.createEstimate).toHaveBeenCalledTimes(1);
    });
  });

  describe("when mutation succeeds", () => {
    it("invalidates estimates query", async () => {
      const mockEstimate = createMockEstimate();
      (api.createEstimate as jest.Mock).mockResolvedValue(mockEstimate);
      const wrapper = createWrapper();
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });
      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
      const { result } = renderHook(() => useCreateEstimate({}), {
        wrapper: Wrapper,
      });

      result.current.mutate();

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ["estimates"],
        });
      });
    });

    it("calls onSuccess callback with new estimate", async () => {
      const mockEstimate = createMockEstimate({ id: "est_789" });
      const mockOnSuccess = jest.fn();
      (api.createEstimate as jest.Mock).mockResolvedValue(mockEstimate);
      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useCreateEstimate({ onSuccess: mockOnSuccess }),
        {
          wrapper,
        },
      );

      result.current.mutate();

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockEstimate);
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("does NOT call onSuccess when it is not provided", async () => {
      const mockEstimate = createMockEstimate();
      (api.createEstimate as jest.Mock).mockResolvedValue(mockEstimate);
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateEstimate({}), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(api.createEstimate).toHaveBeenCalled();
      });
    });
  });

  describe("when mutation fails", () => {
    it("handles API errors", async () => {
      const error = new Error("API Error");
      (api.createEstimate as jest.Mock).mockRejectedValue(error);
      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateEstimate({}), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
