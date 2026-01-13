import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppCard } from "@/components/app-card";
import type { AppData } from "@/components/app-card";

// Helper function to create test app data
function createMockApp(overrides: Partial<AppData> = {}): AppData {
  return {
    product: "Test App",
    description: "A test application for testing purposes",
    category: "Productivity",
    subject: "All Subjects",
    department: "Technology",
    audience: "Teachers, Students",
    website: "https://example.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "whole-school",
    gradeLevels: "K-12",
    ...overrides,
  };
}

describe("AppCard Component", () => {
  it("renders app name correctly", () => {
    const app = createMockApp({ product: "My Test App" });
    render(<AppCard app={app} />);
    expect(screen.getByText("My Test App")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    const app = createMockApp({ description: "Test description here" });
    render(<AppCard app={app} />);
    expect(screen.getByText("Test description here")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const app = createMockApp({ description: undefined });
    render(<AppCard app={app} />);
    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  it("renders SSO badge when enabled", () => {
    const app = createMockApp({ ssoEnabled: true });
    render(<AppCard app={app} />);
    expect(screen.getByText("SSO")).toBeInTheDocument();
  });

  it("does not render SSO badge when disabled", () => {
    const app = createMockApp({ ssoEnabled: false });
    render(<AppCard app={app} />);
    expect(screen.queryByText("SSO")).not.toBeInTheDocument();
  });

  it("renders Mobile badge when mobile app available", () => {
    const app = createMockApp({ mobileApp: "Yes" });
    render(<AppCard app={app} />);
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("does not render Mobile badge when mobile app is 'No'", () => {
    const app = createMockApp({ mobileApp: "No" });
    render(<AppCard app={app} />);
    expect(screen.queryByText("Mobile")).not.toBeInTheDocument();
  });

  it("renders grade levels badge when provided", () => {
    const app = createMockApp({ gradeLevels: "K-5" });
    render(<AppCard app={app} />);
    expect(screen.getByText("K-5")).toBeInTheDocument();
  });

  it("does not render grade levels when N/A", () => {
    const app = createMockApp({ gradeLevels: "N/A" });
    render(<AppCard app={app} />);
    // The grade badge should not be present
    const badges = screen.queryAllByText("N/A");
    expect(badges.length).toBe(0);
  });

  it("shows NEW badge for recently added apps", () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10); // 10 days ago
    const app = createMockApp({ dateAdded: recentDate.toISOString() });
    render(<AppCard app={app} showNewBadge={true} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("does not show NEW badge for old apps", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100); // 100 days ago
    const app = createMockApp({ dateAdded: oldDate.toISOString() });
    render(<AppCard app={app} showNewBadge={true} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  it("does not show NEW badge when showNewBadge is false", () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10);
    const app = createMockApp({ dateAdded: recentDate.toISOString() });
    render(<AppCard app={app} showNewBadge={false} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  it("calls onShowDetails when Details button is clicked", () => {
    const onShowDetails = vi.fn();
    const app = createMockApp();
    render(<AppCard app={app} onShowDetails={onShowDetails} />);

    const detailsButton = screen.getByRole("button", { name: /details/i });
    fireEvent.click(detailsButton);

    expect(onShowDetails).toHaveBeenCalledWith(app);
  });

  it("renders website link correctly", () => {
    const app = createMockApp({ website: "https://test.com" });
    render(<AppCard app={app} />);

    const link = screen.getByRole("link", { name: app.product });
    expect(link).toHaveAttribute("href", "https://test.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders tutorial button when tutorialLink is provided", () => {
    const app = createMockApp({ tutorialLink: "https://tutorial.com" });
    render(<AppCard app={app} />);
    expect(screen.getByText("Tutorial")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const app = createMockApp();
    const { container } = render(<AppCard app={app} className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has truncate class on product name to prevent overflow", () => {
    const app = createMockApp({ product: "Very Long Product Name That Should Be Truncated" });
    render(<AppCard app={app} />);

    const link = screen.getByRole("link", { name: app.product });
    expect(link).toHaveClass("truncate");
  });

  it("has title attribute for product name tooltip", () => {
    const app = createMockApp({ product: "My Product" });
    render(<AppCard app={app} />);

    const link = screen.getByRole("link", { name: "My Product" });
    expect(link).toHaveAttribute("title", "My Product");
  });
});

describe("isWithinDays helper (via NEW badge)", () => {
  it("shows NEW for app added 1 day ago", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const app = createMockApp({ dateAdded: yesterday.toISOString() });
    render(<AppCard app={app} showNewBadge={true} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("shows NEW for app added 59 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 59);
    const app = createMockApp({ dateAdded: date.toISOString() });
    render(<AppCard app={app} showNewBadge={true} />);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("does not show NEW for app added 61 days ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 61);
    const app = createMockApp({ dateAdded: date.toISOString() });
    render(<AppCard app={app} showNewBadge={true} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  it("handles invalid date gracefully", () => {
    const app = createMockApp({ dateAdded: "invalid-date" });
    render(<AppCard app={app} showNewBadge={true} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });

  it("handles missing dateAdded", () => {
    const app = createMockApp({ dateAdded: undefined });
    render(<AppCard app={app} showNewBadge={true} />);
    expect(screen.queryByText("NEW")).not.toBeInTheDocument();
  });
});
