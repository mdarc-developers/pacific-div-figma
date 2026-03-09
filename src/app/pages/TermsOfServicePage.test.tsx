import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Static import — no Firebase mocking needed (pure static content)
import { TermsOfServicePage } from "@/app/pages/TermsOfServicePage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderTermsOfServicePage() {
  return render(
    <MemoryRouter>
      <TermsOfServicePage />
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("TermsOfServicePage", () => {
  it("renders without crashing", () => {
    expect(() => renderTermsOfServicePage()).not.toThrow();
  });

  it("renders the Terms of Use heading", () => {
    renderTermsOfServicePage();
    expect(
      screen.getByRole("heading", { name: /terms of use/i }),
    ).toBeInTheDocument();
  });

  it("renders the 'Prohibited Uses' section", () => {
    renderTermsOfServicePage();
    expect(screen.getByText(/prohibited uses/i)).toBeInTheDocument();
  });

  it("renders the 'Jurisdiction, Governing Law' section heading", () => {
    renderTermsOfServicePage();
    expect(
      screen.getByRole("heading", { name: /jurisdiction, governing law/i }),
    ).toBeInTheDocument();
  });

  it("renders a link to the privacy policy", () => {
    renderTermsOfServicePage();
    const privacyLink = screen.getByRole("link", { name: /\/privacy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("renders the contact email address", () => {
    renderTermsOfServicePage();
    expect(
      screen.getByRole("link", { name: /info@mdarc\.org/i }),
    ).toHaveAttribute("href", "mailto:info@mdarc.org");
  });
});
