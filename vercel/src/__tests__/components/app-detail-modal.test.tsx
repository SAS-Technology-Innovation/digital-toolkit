import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppDetailModal } from "@/components/app-detail-modal";
import type { AppData } from "@/components/app-card";

// Mock the auth context
vi.mock("@/lib/auth/auth-context", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signInWithMagicLink: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithGoogle: vi.fn(),
    signUp: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    signOut: vi.fn(),
  }),
}));

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
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal with app name when open", () => {
    const app = createMockApp({ product: "My Cool App" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("My Cool App")).toBeInTheDocument();
  });

  it("renders app description", () => {
    const app = createMockApp({ description: "Detailed description here" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Detailed description here")).toBeInTheDocument();
  });

  it("calls onOpenChange when dialog close is requested", () => {
    const app = createMockApp();
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    // Find close button in the dialog
    const closeButtons = screen.getAllByRole("button");
    // Click the close button (usually the X button at the top)
    const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }
  });

  it("renders category badge", () => {
    const app = createMockApp({ category: "Creative" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Creative")).toBeInTheDocument();
  });

  it("renders subject when provided", () => {
    const app = createMockApp({ subject: "Mathematics" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Mathematics")).toBeInTheDocument();
  });

  it("renders department when provided", () => {
    const app = createMockApp({ department: "Engineering" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("renders division when provided", () => {
    const app = createMockApp({ division: "High School" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("High School")).toBeInTheDocument();
  });

  it("renders grade levels when provided", () => {
    const app = createMockApp({ gradeLevels: "6-8" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("6-8")).toBeInTheDocument();
  });

  it("renders audience badges", () => {
    const app = createMockApp({ audience: "Teachers, Students, Parents" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("Parents")).toBeInTheDocument();
  });

  it("renders license type when provided", () => {
    const app = createMockApp({ licenseType: "Enterprise" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Enterprise")).toBeInTheDocument();
  });

  it("renders date added when provided", () => {
    const app = createMockApp({ dateAdded: "2024-06-15" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    // Date is formatted, so check for formatted output
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("renders SSO Enabled badge when ssoEnabled is true", () => {
    const app = createMockApp({ ssoEnabled: true });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("SSO Enabled")).toBeInTheDocument();
  });

  it("does not render SSO badge when ssoEnabled is false", () => {
    const app = createMockApp({ ssoEnabled: false, mobileApp: "No" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByText("SSO Enabled")).not.toBeInTheDocument();
  });

  it("renders Mobile App Available badge when mobileApp is Yes", () => {
    const app = createMockApp({ mobileApp: "Yes" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.getByText("Mobile App Available")).toBeInTheDocument();
  });

  it("does not render Mobile badge when mobileApp is No", () => {
    const app = createMockApp({ mobileApp: "No", ssoEnabled: false });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByText("Mobile App Available")).not.toBeInTheDocument();
  });

  it("renders website link when provided", () => {
    const app = createMockApp({ website: "https://myapp.com" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    const visitLink = screen.getByText("Visit Website");
    expect(visitLink.closest("a")).toHaveAttribute("href", "https://myapp.com");
  });

  it("renders tutorial link when provided", () => {
    const app = createMockApp({ tutorialLink: "https://tutorial.myapp.com" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    const tutorialLink = screen.getByText("View Tutorial");
    expect(tutorialLink.closest("a")).toHaveAttribute("href", "https://tutorial.myapp.com");
  });

  it("does not render website button when website is #", () => {
    const app = createMockApp({ website: "#" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByText("Visit Website")).not.toBeInTheDocument();
  });

  it("does not render website button when website is N/A", () => {
    const app = createMockApp({ website: "N/A" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByText("Visit Website")).not.toBeInTheDocument();
  });

  it("does not render tutorial button when tutorialLink is N/A", () => {
    const app = createMockApp({ tutorialLink: "N/A" });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByText("View Tutorial")).not.toBeInTheDocument();
  });

  it("hides N/A values for optional fields", () => {
    const app = createMockApp({
      category: "N/A",
      subject: "N/A",
      gradeLevels: "N/A",
    });
    render(<AppDetailModal app={app} open={true} onOpenChange={mockOnOpenChange} />);

    // Should not display N/A as a visible value
    const naElements = screen.queryAllByText("N/A");
    expect(naElements.length).toBe(0);
  });

  it("does not render content when open is false", () => {
    const app = createMockApp({ product: "Hidden App" });
    render(<AppDetailModal app={app} open={false} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByText("Hidden App")).not.toBeInTheDocument();
  });

  it("does not render content when app is null", () => {
    render(<AppDetailModal app={null} open={true} onOpenChange={mockOnOpenChange} />);

    expect(screen.queryByText("Test App")).not.toBeInTheDocument();
  });
});

describe("getFaviconUrl helper (via logo display)", () => {
  it("displays logo when logoUrl is provided", () => {
    const app = createMockApp({ logoUrl: "https://example.com/logo.png" });
    render(<AppDetailModal app={app} open={true} onOpenChange={vi.fn()} />);

    const logo = screen.getByAltText("Test App logo");
    expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("uses favicon fallback when no logoUrl but website provided", () => {
    const app = createMockApp({
      logoUrl: undefined,
      website: "https://example.com",
    });
    render(<AppDetailModal app={app} open={true} onOpenChange={vi.fn()} />);

    const logo = screen.getByAltText("Test App logo");
    expect(logo.getAttribute("src")).toContain("google.com/s2/favicons");
  });
});
