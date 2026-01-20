import { render, screen } from "@testing-library/react";
import { EstimatesManagement } from "./EstimatesManagement";

jest.mock("./CreateEstimateButton/CreateEstimateButton", () => ({
  CreateEstimateButton: ({
    onEstimateCreated,
  }: {
    onEstimateCreated: (estimateId: string) => void;
  }) => (
    <div data-testid="create-estimate-button">
      <button onClick={() => onEstimateCreated("new-estimate-id")}>
        Create Estimate
      </button>
    </div>
  ),
}));

jest.mock("./EstimatesList/EstimatesList", () => ({
  EstimatesList: ({
    onCreateClick,
    onClick,
  }: {
    onCreateClick: (estimateId: string) => void;
    onClick: (estimateId: string) => void;
  }) => (
    <div data-testid="estimates-list">
      <button onClick={() => onCreateClick("created-estimate-id")}>
        Create from List
      </button>
      <button onClick={() => onClick("clicked-estimate-id")}>
        Click Estimate
      </button>
    </div>
  ),
}));

describe("EstimatesManagement", () => {
  const mockOnCreateClick = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page title", () => {
    render(
      <EstimatesManagement
        onCreateClick={mockOnCreateClick}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByText("Event Estimates")).toBeInTheDocument();
  });

  it("renders the page description", () => {
    render(
      <EstimatesManagement
        onCreateClick={mockOnCreateClick}
        onClick={mockOnClick}
      />,
    );

    expect(
      screen.getByText("Manage your event estimates and create new ones"),
    ).toBeInTheDocument();
  });

  it("renders the CreateEstimateButton component", () => {
    render(
      <EstimatesManagement
        onCreateClick={mockOnCreateClick}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByTestId("create-estimate-button")).toBeInTheDocument();
  });

  it("renders the EstimatesList component", () => {
    render(
      <EstimatesManagement
        onCreateClick={mockOnCreateClick}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByTestId("estimates-list")).toBeInTheDocument();
  });

  it("passes onCreateClick to CreateEstimateButton as onEstimateCreated", () => {
    render(
      <EstimatesManagement
        onCreateClick={mockOnCreateClick}
        onClick={mockOnClick}
      />,
    );

    const createButton = screen.getByText("Create Estimate");
    createButton.click();

    expect(mockOnCreateClick).toHaveBeenCalledWith("new-estimate-id");
    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it("passes onCreateClick to EstimatesList", () => {
    render(
      <EstimatesManagement
        onCreateClick={mockOnCreateClick}
        onClick={mockOnClick}
      />,
    );

    const createFromListButton = screen.getByText("Create from List");
    createFromListButton.click();

    expect(mockOnCreateClick).toHaveBeenCalledWith("created-estimate-id");
    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it("passes onClick to EstimatesList", () => {
    render(
      <EstimatesManagement
        onCreateClick={mockOnCreateClick}
        onClick={mockOnClick}
      />,
    );

    const clickEstimateButton = screen.getByText("Click Estimate");
    clickEstimateButton.click();

    expect(mockOnClick).toHaveBeenCalledWith("clicked-estimate-id");
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
