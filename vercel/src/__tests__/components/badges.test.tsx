import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AudienceBadge, AudienceBadgeList } from "@/components/ui/audience-badge";
import { CategoryBadge } from "@/components/ui/category-badge";

describe("AudienceBadge Component", () => {
  it("renders the audience text", () => {
    render(<AudienceBadge audience="Teachers" />);
    expect(screen.getByText("Teachers")).toBeInTheDocument();
  });

  it("applies correct color for Teachers", () => {
    const { container } = render(<AudienceBadge audience="Teachers" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-emerald-500");
  });

  it("applies correct color for Students", () => {
    const { container } = render(<AudienceBadge audience="Students" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-amber-400");
  });

  it("applies correct color for Parents", () => {
    const { container } = render(<AudienceBadge audience="Parents" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-pink-500");
  });

  it("applies correct color for Staff", () => {
    const { container } = render(<AudienceBadge audience="Staff" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-purple-500");
  });

  it("applies fallback color for unknown audience", () => {
    const { container } = render(<AudienceBadge audience="Unknown" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-gray-500");
  });

  it("handles case-insensitive audience names", () => {
    const { container } = render(<AudienceBadge audience="teachers" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-emerald-500");
  });

  it("applies custom className", () => {
    const { container } = render(<AudienceBadge audience="Teachers" className="custom-class" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("custom-class");
  });
});

describe("AudienceBadgeList Component", () => {
  it("renders multiple badges from comma-separated string", () => {
    render(<AudienceBadgeList audiences="Teachers, Students, Parents" />);
    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();
    expect(screen.getByText("Parents")).toBeInTheDocument();
  });

  it("renders badges from array", () => {
    render(<AudienceBadgeList audiences={["Teachers", "Students"]} />);
    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();
  });

  it("handles empty string", () => {
    const { container } = render(<AudienceBadgeList audiences="" />);
    expect(container.firstChild).toBeNull();
  });

  it("handles empty array", () => {
    const { container } = render(<AudienceBadgeList audiences={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("trims whitespace from audience names", () => {
    render(<AudienceBadgeList audiences="  Teachers  ,  Students  " />);
    expect(screen.getByText("Teachers")).toBeInTheDocument();
    expect(screen.getByText("Students")).toBeInTheDocument();
  });

  it("filters out empty entries", () => {
    render(<AudienceBadgeList audiences="Teachers,,Students" />);
    const badges = screen.getAllByRole("generic").filter(
      (el) => el.textContent === "Teachers" || el.textContent === "Students"
    );
    expect(badges.length).toBe(2);
  });

  it("applies custom className to container", () => {
    const { container } = render(
      <AudienceBadgeList audiences="Teachers" className="custom-container" />
    );
    expect(container.firstChild).toHaveClass("custom-container");
  });
});

describe("CategoryBadge Component", () => {
  it("renders the category text", () => {
    render(<CategoryBadge category="Productivity" />);
    expect(screen.getByText("Productivity")).toBeInTheDocument();
  });

  it("applies correct color for Productivity", () => {
    const { container } = render(<CategoryBadge category="Productivity" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-indigo-500");
  });

  it("applies correct color for Learning Management", () => {
    const { container } = render(<CategoryBadge category="Learning Management" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-violet-500");
  });

  it("applies correct color for Creative", () => {
    const { container } = render(<CategoryBadge category="Creative" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-fuchsia-500");
  });

  it("applies correct color for STEM", () => {
    const { container } = render(<CategoryBadge category="STEM" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-cyan-500");
  });

  it("applies correct color for Assessment", () => {
    const { container } = render(<CategoryBadge category="Assessment" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-orange-500");
  });

  it("applies correct color for Portfolio", () => {
    const { container } = render(<CategoryBadge category="Portfolio" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-teal-500");
  });

  it("applies correct color for Reading", () => {
    const { container } = render(<CategoryBadge category="Reading" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-green-500");
  });

  it("applies correct color for Coding", () => {
    const { container } = render(<CategoryBadge category="Coding" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-slate-700");
  });

  it("applies fallback color for unknown category", () => {
    const { container } = render(<CategoryBadge category="Unknown Category" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-indigo-500"); // default fallback
  });

  it("handles case-insensitive category names", () => {
    const { container } = render(<CategoryBadge category="CREATIVE" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("bg-fuchsia-500");
  });

  it("applies custom className", () => {
    const { container } = render(<CategoryBadge category="Productivity" className="custom-class" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("custom-class");
  });
});
