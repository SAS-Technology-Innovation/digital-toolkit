import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppDetailModal } from "@/components/app-detail-modal";
import type { AppData } from "@/components/app-card";

// Helper to create mock app data
function createMockApp(overrides: Partial<AppData> = {}): AppData {
  return {
    product: "Test App",
    description: "A test application",
    category: "Productivity",
    subject: "Math",
    department: "Technology",
    audience: "Teachers, Students",
    website: "https://example.com",
    tutorialLink: "https://tutorial.com",
    ssoEnabled: true,
    mobileApp: "Yes",
    division: "Whole School",
    gradeLevels: "K-12",
    licenseType: "Site License",
    dateAdded: "2024-01-01",
    ...overrides,
  };
}

describe("AppDetailModal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset body overflow style
    document.body.style.overflow = "";
  });

  it("renders the modal with app name", () => {
    const app = createMockApp({ product: "My Cool App" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("My Cool App")).toBeInTheDocument();
  });

  it("renders app description", () => {
    const app = createMockApp({ description: "Detailed description here" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("Detailed description here")).toBeInTheDocument();
  });

  it("sets body overflow to hidden when opened", () => {
    const app = createMockApp();
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("resets body overflow when unmounted", () => {
    const app = createMockApp();
    const { unmount } = render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("calls onClose when escape key is pressed", () => {
    const app = createMockApp();
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const app = createMockApp();
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    // Click the backdrop (the outer fixed div)
    const backdrop = screen.getByText(app.product).closest(".fixed");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("does not call onClose when modal content is clicked", () => {
    const app = createMockApp();
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    // Click on the app title (inside modal content)
    fireEvent.click(screen.getByText(app.product));

    // Reset the mock call from potential backdrop events
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    const app = createMockApp();
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("renders category badge", () => {
    const app = createMockApp({ category: "Creative" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("Creative")).toBeInTheDocument();
  });

  it("renders subject when provided", () => {
    const app = createMockApp({ subject: "Mathematics" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("Mathematics")).toBeInTheDocument();
  });

  it("renders department when provided", () => {
    const app = createMockApp({ department: "Engineering" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("renders division when provided", () => {
    const app = createMockApp({ division: "High School" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("High School")).toBeInTheDocument();
  });

  it("renders grade levels when provided", () => {
    const app = createMockApp({ gradeLevels: "6-8" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("6-8")).toBeInTheDocument();
  });

  it("renders audience badges", () => {
    const app = createMockApp({ audience: "Teachers, Students, Parents" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("Parents")).toBeInTheDocument();
  });

  it("renders license type when provided", () => {
    const app = createMockApp({ licenseType: "Enterprise" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders date added when provided", () => {
    const app = createMockApp({ dateAdded: "2024-06-15" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    // Date is formatted, so check for formatted output
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("renders SSO Enabled badge when ssoEnabled is true", () => {
    const app = createMockApp({ ssoEnabled: true });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("SSO Enabled")).toBeInTheDocument();
  });

  it("does not render SSO badge when ssoEnabled is false", () => {
    const app = createMockApp({ ssoEnabled: false, mobileApp: "No" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.queryByText("SSO Enabled")).not.toBeInTheDocument();
  });

  it("renders Mobile App Available badge when mobileApp is Yes", () => {
    const app = createMockApp({ mobileApp: "Yes" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.getByText("Mobile App Available")).toBeInTheDocument();
  });

  it("does not render Mobile badge when mobileApp is No", () => {
    const app = createMockApp({ mobileApp: "No", ssoEnabled: false });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.queryByText("Mobile App Available")).not.toBeInTheDocument();
  });

  it("renders website link when provided", () => {
    const app = createMockApp({ website: "https://myapp.com" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    const visitLink = screen.getByText("Visit Website");
    expect(visitLink.closest("a")).toHaveAttribute("href", "https://myapp.com");
  });

  it("renders tutorial link when provided", () => {
    const app = createMockApp({ tutorialLink: "https://tutorial.myapp.com" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    const tutorialLink = screen.getByText("View Tutorial");
    expect(tutorialLink.closest("a")).toHaveAttribute("href", "https://tutorial.myapp.com");
  });

  it("does not render website button when website is #", () => {
    const app = createMockApp({ website: "#" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.queryByText("Visit Website")).not.toBeInTheDocument();
  });

  it("does not render website button when website is N/A", () => {
    const app = createMockApp({ website: "N/A" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.queryByText("Visit Website")).not.toBeInTheDocument();
  });

  it("does not render tutorial button when tutorialLink is N/A", () => {
    const app = createMockApp({ tutorialLink: "N/A" });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    expect(screen.queryByText("View Tutorial")).not.toBeInTheDocument();
  });

  it("hides N/A values for optional fields", () => {
    const app = createMockApp({
      category: "N/A",
      subject: "N/A",
      gradeLevels: "N/A",
    });
    render(<AppDetailModal app={app} onClose={mockOnClose} />);

    // Should not display N/A as a visible value
    const naElements = screen.queryAllByText("N/A");
    expect(naElements.length).toBe(0);
  });
});

describe("getFaviconUrl helper (via logo display)", () => {
  it("displays logo when logoUrl is provided", () => {
    const app = createMockApp({ logoUrl: "https://example.com/logo.png" });
    render(<AppDetailModal app={app} onClose={vi.fn()} />);

    const logo = screen.getByAltText("Test App logo");
    expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("uses favicon fallback when no logoUrl but website provided", () => {
    const app = createMockApp({
      logoUrl: undefined,
      website: "https://example.com",
    });
    render(<AppDetailModal app={app} onClose={vi.fn()} />);

    const logo = screen.getByAltText("Test App logo");
    expect(logo.getAttribute("src")).toContain("google.com/s2/favicons");
  });
});
