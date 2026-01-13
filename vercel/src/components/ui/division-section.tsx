import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type DivisionId = "wholeSchool" | "elementary" | "middleSchool" | "highSchool";

// Division color configurations
export const divisionThemes = {
  wholeSchool: {
    bg: "bg-gradient-to-br from-slate-50 to-blue-50",
    border: "border-slate-200",
    gradientBar: "bg-gradient-to-r from-slate-400 via-blue-400 to-slate-400",
    text: "text-slate-700",
    color: "#64748b",
  },
  elementary: {
    bg: "bg-gradient-to-br from-sky-50 to-cyan-50",
    border: "border-sky-200",
    gradientBar: "bg-gradient-to-r from-[#228ec2] via-sky-400 to-[#228ec2]",
    text: "text-[#228ec2]",
    color: "#228ec2",
  },
  middleSchool: {
    bg: "bg-gradient-to-br from-rose-50 to-red-50",
    border: "border-rose-200",
    gradientBar: "bg-gradient-to-r from-[#a0192a] via-rose-400 to-[#a0192a]",
    text: "text-[#a0192a]",
    color: "#a0192a",
  },
  highSchool: {
    bg: "bg-gradient-to-br from-indigo-50 to-blue-50",
    border: "border-indigo-200",
    gradientBar: "bg-gradient-to-r from-[#1a2d58] via-indigo-400 to-[#1a2d58]",
    text: "text-[#1a2d58]",
    color: "#1a2d58",
  },
} as const;

interface DivisionSectionProps {
  division: DivisionId;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  showGradientBar?: boolean;
}

export function DivisionSection({
  division,
  title,
  description,
  children,
  className,
  showGradientBar = true,
}: DivisionSectionProps) {
  const theme = divisionThemes[division];

  return (
    <section className={cn("mb-8", className)}>
      <div
        className={cn(
          "border-2 rounded-xl p-6 shadow-sm relative overflow-hidden",
          theme.bg,
          theme.border
        )}
      >
        {showGradientBar && (
          <div className={cn("absolute top-0 left-0 right-0 h-1", theme.gradientBar)} />
        )}
        <h2 className={cn("text-xl font-bold flex items-center gap-2 mb-1", theme.text)}>
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}

// Preset themed sections
export function EnterpriseSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />
        {children}
      </div>
    </section>
  );
}

export function WhatsNewSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-8", className)}>
      <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6 shadow-sm">
        {children}
      </div>
    </section>
  );
}
