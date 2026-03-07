import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConferenceHeaderErrorBoundary } from "@/app/components/ConferenceHeaderErrorBoundary";

// Suppress the expected console.error output in tests
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function ThrowingComponent(): React.ReactElement {
  throw new Error("Test render error");
}

function OkComponent() {
  return <div data-testid="ok-child">OK</div>;
}

describe("ConferenceHeaderErrorBoundary", () => {
  it("renders children normally when there is no error", () => {
    render(
      <ConferenceHeaderErrorBoundary>
        <OkComponent />
      </ConferenceHeaderErrorBoundary>,
    );
    expect(screen.getByTestId("ok-child")).toBeInTheDocument();
  });

  it("renders the fallback UI when a child throws", () => {
    render(
      <ConferenceHeaderErrorBoundary>
        <ThrowingComponent />
      </ConferenceHeaderErrorBoundary>,
    );
    expect(screen.getByTestId("conference-header-error")).toBeInTheDocument();
    expect(screen.getByTestId("conference-header-error")).toHaveTextContent(
      "Conference header could not be loaded.",
    );
  });

  it("does not render children when a child has thrown", () => {
    render(
      <ConferenceHeaderErrorBoundary>
        <ThrowingComponent />
      </ConferenceHeaderErrorBoundary>,
    );
    expect(screen.queryByTestId("ok-child")).not.toBeInTheDocument();
  });
});
