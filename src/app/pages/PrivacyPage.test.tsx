import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Static import — no Firebase mocking needed (pure static content)
import { PrivacyPage } from "@/app/pages/PrivacyPage";

// ── Helper ────────────────────────────────────────────────────────────────────
function renderPrivacyPage() {
  return render(<PrivacyPage />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("PrivacyPage", () => {
  it("renders without crashing", () => {
    expect(() => renderPrivacyPage()).not.toThrow();
  });

  it("renders the Privacy Policy heading", () => {
    renderPrivacyPage();
    expect(
      screen.getByRole("heading", { name: /privacy policy/i }),
    ).toBeInTheDocument();
  });

  it("renders the 'Personal Information We Collect' section heading", () => {
    renderPrivacyPage();
    expect(
      screen.getByRole("heading", { name: /personal information we collect/i }),
    ).toBeInTheDocument();
  });

  it("renders the 'How We Protect Your Information' section", () => {
    renderPrivacyPage();
    expect(
      screen.getByText(/how we protect your information/i),
    ).toBeInTheDocument();
  });

  it("renders the contact email address", () => {
    renderPrivacyPage();
    expect(
      screen.getByRole("link", { name: /info@mdarc\.org/i }),
    ).toHaveAttribute("href", "mailto:info@mdarc.org");
  });
});
