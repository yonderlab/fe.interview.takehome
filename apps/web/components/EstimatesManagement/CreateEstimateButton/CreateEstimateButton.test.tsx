import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateEstimateButton } from "./CreateEstimateButton";
import type { Estimate } from "@/types/api";

const mockMutate = jest.fn();
const mockUseCreateEstimate = jest.fn();

jest.mock("./useCreateEstimate", () => ({
  useCreateEstimate: (options: {
    onSuccess?: (estimate: Estimate) => void;
  }) => {
    return mockUseCreateEstimate(options);
  },
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

describe("CreateEstimateButton", () => {
  const mockOnEstimateCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateEstimate.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("renders the create estimate button", () => {
    render(<CreateEstimateButton onEstimateCreated={mockOnEstimateCreated} />);

    expect(
      screen.getByRole("button", { name: /create new estimate/i })
    ).toBeInTheDocument();
  });

  it("calls the API endpoint to create an estimate when the button is clicked", () => {
    render(<CreateEstimateButton onEstimateCreated={mockOnEstimateCreated} />);

    const button = screen.getByRole("button", { name: /create new estimate/i });
    fireEvent.click(button);

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  describe("when the API call is pending", () => {
    beforeEach(() => {
      mockUseCreateEstimate.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });
    });

    it("shows creating text", () => {
      render(
        <CreateEstimateButton onEstimateCreated={mockOnEstimateCreated} />
      );

      expect(
        screen.getByRole("button", { name: /creating/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /create new estimate/i })
      ).not.toBeInTheDocument();
    });

    it("disables the button", () => {
      render(
        <CreateEstimateButton onEstimateCreated={mockOnEstimateCreated} />
      );

      const button = screen.getByRole("button", { name: /creating/i });
      expect(button).toBeDisabled();
    });
  });

  describe("when the API call succeeds", () => {
    it("calls onEstimateCreated with the new estimate ID", () => {
      const mockEstimate = createMockEstimate({ id: "est_456" });
      let successCallback: ((estimate: Estimate) => void) | undefined;
      mockUseCreateEstimate.mockImplementation((options) => {
        successCallback = options.onSuccess;
        return {
          mutate: () => {
            if (successCallback) {
              successCallback(mockEstimate);
            }
          },
          isPending: false,
        };
      });
      render(
        <CreateEstimateButton onEstimateCreated={mockOnEstimateCreated} />
      );
      const button = screen.getByRole("button", {
        name: /create new estimate/i,
      });

      fireEvent.click(button);

      expect(mockOnEstimateCreated).toHaveBeenCalledWith("est_456");
      expect(mockOnEstimateCreated).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the button is not pending", () => {
    it("shows create new estimate text", () => {
      render(
        <CreateEstimateButton onEstimateCreated={mockOnEstimateCreated} />
      );

      expect(
        screen.getByRole("button", { name: /create new estimate/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /creating/i })
      ).not.toBeInTheDocument();
    });

    it("enables the button", () => {
      render(
        <CreateEstimateButton onEstimateCreated={mockOnEstimateCreated} />
      );

      const button = screen.getByRole("button", {
        name: /create new estimate/i,
      });
      expect(button).not.toBeDisabled();
    });
  });
});
