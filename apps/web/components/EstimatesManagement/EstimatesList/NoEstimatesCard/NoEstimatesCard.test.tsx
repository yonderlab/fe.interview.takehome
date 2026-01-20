import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NoEstimatesCard } from "./NoEstimatesCard";
import * as api from "@/lib/api";

// Mock the API
jest.mock("@/lib/api", () => ({ createEstimate: jest.fn() }));

describe("NoEstimatesCard", () => {
  let queryClient: QueryClient;
  const mockOnCreateClick = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );
  };

  it("renders the no estimates message", () => {
    renderWithQueryClient(
      <NoEstimatesCard onCreateClick={mockOnCreateClick} />,
    );

    expect(screen.getByText("No estimates found")).toBeInTheDocument();
  });

  it("renders the create estimate button", () => {
    renderWithQueryClient(
      <NoEstimatesCard onCreateClick={mockOnCreateClick} />,
    );

    expect(
      screen.getByRole("button", { name: /create new estimate/i }),
    ).toBeInTheDocument();
  });

  it("calls onCreateClick when estimate is created", async () => {
    const mockEstimate = {
      id: "est_123",
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
    };
    (api.createEstimate as jest.Mock).mockResolvedValue(mockEstimate);
    renderWithQueryClient(
      <NoEstimatesCard onCreateClick={mockOnCreateClick} />,
    );
    const createButton = screen.getByRole("button", {
      name: /create new estimate/i,
    });

    createButton.click();

    await waitFor(() => {
      expect(mockOnCreateClick).toHaveBeenCalledWith("est_123");
    });
  });

  it("shows loading state when creating estimate", async () => {
    const mockEstimate = {
      id: "est_123",
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
    };
    let resolvePromise: ((value: typeof mockEstimate) => void) | undefined;
    const promise = new Promise<typeof mockEstimate>((resolve) => {
      resolvePromise = resolve;
    });
    (api.createEstimate as jest.Mock).mockReturnValue(promise);
    renderWithQueryClient(
      <NoEstimatesCard onCreateClick={mockOnCreateClick} />,
    );
    const createButton = screen.getByRole("button", {
      name: /create new estimate/i,
    });

    createButton.click();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /creating/i }),
      ).toBeInTheDocument();
    });
    if (resolvePromise) {
      resolvePromise(mockEstimate);
    }
    await waitFor(() => {
      expect(mockOnCreateClick).toHaveBeenCalledWith("est_123");
    });
  });
});
