import { render, screen } from "@testing-library/react";
import { EstimatesLoading } from "./EstimatesLoading";

describe("EstimatesLoading", () => {
  it("renders the loading message", () => {
    render(<EstimatesLoading />);

    expect(screen.getByText("Loading estimates...")).toBeInTheDocument();
  });
});
