import { render, screen, fireEvent } from "@testing-library/react";
import { EstimateCard } from "./EstimateCard";
import type { Estimate } from "@/types/api";

const createEstimate = (overrides?: Partial<Estimate>): Estimate => ({
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

describe("EstimateCard", () => {
  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the plan name", () => {
    const estimate = createEstimate({ plan: { id: "plan_1", name: "Premium Plan" } });
    render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

    expect(screen.getByText("Premium Plan")).toBeInTheDocument();
  });

  it("renders the estimate ID", () => {
    const estimate = createEstimate({ id: "est_456" });
    render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

    expect(screen.getByText("ID: est_456")).toBeInTheDocument();
  });

  it("renders the status badge with formatted status", () => {
    const estimate = createEstimate({ status: "pending_approval" });
    render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

    expect(screen.getByText("Pending Approval")).toBeInTheDocument();
  });

  it("renders the base price", () => {
    const estimate = createEstimate({ pricing: { base: 50000, addons: 0, total: 50000, currency: "EUR" } });
    render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

    expect(screen.getByText("Base Price")).toBeInTheDocument();
    const basePriceSection = screen.getByText("Base Price").closest("div");
    expect(basePriceSection).toHaveTextContent("€500.00");
  });

  it("renders the total price", () => {
    const estimate = createEstimate({ pricing: { base: 10000, addons: 0, total: 10000, currency: "EUR" } });
    render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

    expect(screen.getByText("Total")).toBeInTheDocument();
    const totalSection = screen.getByText("Total").closest("div");
    expect(totalSection).toHaveTextContent("€100.00");
  });

  describe("when addons are present", () => {
    it("renders the addons price", () => {
      const estimate = createEstimate({
        pricing: { base: 10000, addons: 5000, total: 15000, currency: "EUR" },
      });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.getByText("Add-ons")).toBeInTheDocument();
      const addonsSection = screen.getByText("Add-ons").closest("div");
      expect(addonsSection).toHaveTextContent("€50.00");
    });
  });

  describe("when addons are not present", () => {
    it("does NOT render the addons section", () => {
      const estimate = createEstimate({
        pricing: { base: 10000, addons: 0, total: 10000, currency: "EUR" },
      });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.queryByText("Add-ons")).not.toBeInTheDocument();
    });
  });

  describe("when blocking reasons are present", () => {
    it("renders the blocking reasons count for single issue", () => {
      const estimate = createEstimate({
        blocking_reasons: ["Missing required field"],
      });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.getByText("1 issue")).toBeInTheDocument();
    });

    it("renders the blocking reasons count for multiple issues", () => {
      const estimate = createEstimate({
        blocking_reasons: ["Missing required field", "Invalid addon"],
      });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.getByText("2 issues")).toBeInTheDocument();
    });
  });

  describe("when blocking reasons are not present", () => {
    it("does NOT render the blocking reasons section", () => {
      const estimate = createEstimate({ blocking_reasons: [] });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.queryByText(/issue/)).not.toBeInTheDocument();
    });
  });

  describe("when delete handler is provided", () => {
    it("renders the delete button", () => {
      const estimate = createEstimate();
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole("button", { name: /delete estimate/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it("calls onDelete with estimate ID when delete button is clicked", () => {
      const estimate = createEstimate({ id: "est_789" });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole("button", { name: /delete estimate/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith("est_789");
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("does NOT call onClick when delete button is clicked", () => {
      const estimate = createEstimate();
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} onDelete={mockOnDelete} />);

      const deleteButton = screen.getByRole("button", { name: /delete estimate/i });
      fireEvent.click(deleteButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("when delete handler is NOT provided", () => {
    it("does NOT render the delete button", () => {
      const estimate = createEstimate();
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.queryByRole("button", { name: /delete estimate/i })).not.toBeInTheDocument();
    });
  });

  it("calls onClick when the card is clicked", () => {
    const estimate = createEstimate();
    render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

    const card = screen.getByText("Test Plan").closest("div[class*='cursor-pointer']");
    if (card) {
      fireEvent.click(card);
    }

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  describe("when estimate has different statuses", () => {
    it("renders draft status badge", () => {
      const estimate = createEstimate({ status: "draft" });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.getByText("Draft")).toBeInTheDocument();
    });

    it("renders finalised status badge", () => {
      const estimate = createEstimate({ status: "finalised" });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.getByText("Finalised")).toBeInTheDocument();
    });

    it("renders rejected status badge", () => {
      const estimate = createEstimate({ status: "rejected" });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("renders draft status badge when status is unknown", () => {
      const estimate = createEstimate({ status: "unknown_status" as any });
      render(<EstimateCard estimate={estimate} onClick={mockOnClick} />);

      expect(screen.getByText("Unknown Status")).toBeInTheDocument();
    });
  });
});

