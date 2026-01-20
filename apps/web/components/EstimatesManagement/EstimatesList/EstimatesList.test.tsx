import { render, screen, fireEvent } from "@testing-library/react";
import { EstimatesList } from "./EstimatesList";
import type { Estimate } from "@/types/api";

const mockUseEstimates = jest.fn();
const mockUseDeleteEstimate = jest.fn();

jest.mock("./useEstimates", () => ({
  useEstimates: () => mockUseEstimates(),
}));

jest.mock("./useDeleteEstimate", () => ({
  useDeleteEstimate: () => mockUseDeleteEstimate(),
}));

jest.mock("./EstimatesLoading", () => ({
  EstimatesLoading: () => <div data-testid="estimates-loading">Loading estimates...</div>,
}));

jest.mock("./NoEstimatesCard/NoEstimatesCard", () => ({
  NoEstimatesCard: ({ onCreateClick }: { onCreateClick: (id: string) => void }) => (
    <div data-testid="no-estimates-card">
      <button onClick={() => onCreateClick("new-estimate-id")}>Create Estimate</button>
    </div>
  ),
}));

jest.mock("./EstimateCard/EstimateCard", () => ({
  EstimateCard: ({
    estimate,
    onClick,
    onDelete,
  }: {
    estimate: Estimate;
    onClick: () => void;
    onDelete?: (id: string) => void;
  }) => (
    <div data-testid={`estimate-card-${estimate.id}`}>
      <button onClick={onClick} data-testid={`card-click-${estimate.id}`}>
        View Estimate
      </button>
      {onDelete && (
        <button
          onClick={() => onDelete(estimate.id)}
          data-testid={`card-delete-${estimate.id}`}
        >
          Delete
        </button>
      )}
    </div>
  ),
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

describe("EstimatesList", () => {
  const mockOnCreateClick = jest.fn();
  const mockOnClick = jest.fn();
  const mockDeleteEstimate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeleteEstimate.mockReturnValue({
      mutate: mockDeleteEstimate,
    });
  });

  describe("when estimates are loading", () => {
    beforeEach(() => {
      mockUseEstimates.mockReturnValue({
        estimates: [],
        isLoading: true,
        error: null,
      });
    });

    it("renders the loading component", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.getByTestId("estimates-loading")).toBeInTheDocument();
    });

    it("does NOT render the error message", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
    });

    it("does NOT render the no estimates card", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.queryByTestId("no-estimates-card")).not.toBeInTheDocument();
    });

    it("does NOT render estimate cards", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.queryByTestId(/estimate-card-/)).not.toBeInTheDocument();
    });
  });

  describe("when there is an error", () => {
    beforeEach(() => {
      mockUseEstimates.mockReturnValue({
        estimates: [],
        isLoading: false,
        error: "Failed to load estimates",
      });
    });

    it("renders the error message", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.getByText("Failed to load estimates")).toBeInTheDocument();
    });

    it("renders the no estimates card when there are no estimates", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.getByTestId("no-estimates-card")).toBeInTheDocument();
    });
  });

  describe("when there are no estimates", () => {
    beforeEach(() => {
      mockUseEstimates.mockReturnValue({
        estimates: [],
        isLoading: false,
        error: null,
      });
    });

    it("renders the no estimates card", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.getByTestId("no-estimates-card")).toBeInTheDocument();
    });

    it("calls onCreateClick when create estimate button is clicked", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      const createButton = screen.getByText("Create Estimate");
      fireEvent.click(createButton);

      expect(mockOnCreateClick).toHaveBeenCalledWith("new-estimate-id");
      expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
    });

    it("does NOT render estimate cards", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.queryByTestId(/estimate-card-/)).not.toBeInTheDocument();
    });

    it("does NOT render the error message", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
    });
  });

  describe("when there are estimates", () => {
    const mockEstimates = [
      createMockEstimate({ id: "est_1", plan: { id: "plan_1", name: "Plan 1" } }),
      createMockEstimate({ id: "est_2", plan: { id: "plan_2", name: "Plan 2" } }),
    ];

    beforeEach(() => {
      mockUseEstimates.mockReturnValue({
        estimates: mockEstimates,
        isLoading: false,
        error: null,
      });
    });

    it("renders all estimate cards", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.getByTestId("estimate-card-est_1")).toBeInTheDocument();
      expect(screen.getByTestId("estimate-card-est_2")).toBeInTheDocument();
    });

    it("does NOT render the no estimates card", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.queryByTestId("no-estimates-card")).not.toBeInTheDocument();
    });

    it("calls onClick with estimate ID when estimate card is clicked", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      const cardButton = screen.getByTestId("card-click-est_1");
      fireEvent.click(cardButton);

      expect(mockOnClick).toHaveBeenCalledWith("est_1");
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("calls deleteEstimate with estimate ID when delete button is clicked", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      const deleteButton = screen.getByTestId("card-delete-est_1");
      fireEvent.click(deleteButton);

      expect(mockDeleteEstimate).toHaveBeenCalledWith("est_1");
      expect(mockDeleteEstimate).toHaveBeenCalledTimes(1);
    });

    it("does NOT render the error message", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.queryByText(/failed to load/i)).not.toBeInTheDocument();
    });
  });

  describe("when there is an error and estimates exist", () => {
    const mockEstimates = [createMockEstimate({ id: "est_1" })];

    beforeEach(() => {
      mockUseEstimates.mockReturnValue({
        estimates: mockEstimates,
        isLoading: false,
        error: "Network error",
      });
    });

    it("renders both the error message and estimate cards", () => {
      render(<EstimatesList onCreateClick={mockOnCreateClick} onClick={mockOnClick} />);

      expect(screen.getByText("Network error")).toBeInTheDocument();
      expect(screen.getByTestId("estimate-card-est_1")).toBeInTheDocument();
    });
  });
});

