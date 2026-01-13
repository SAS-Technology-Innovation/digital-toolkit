import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Category color mapping
const categoryColors: Record<string, string> = {
  productivity: "bg-indigo-500 text-white",
  "learning management": "bg-violet-500 text-white",
  creative: "bg-fuchsia-500 text-white",
  stem: "bg-cyan-500 text-white",
  math: "bg-blue-500 text-white",
  assessment: "bg-orange-500 text-white",
  portfolio: "bg-teal-500 text-white",
  reading: "bg-green-500 text-white",
  coding: "bg-slate-700 text-white",
  english: "bg-rose-500 text-white",
  learning: "bg-purple-500 text-white",
  communication: "bg-sky-500 text-white",
  administration: "bg-gray-600 text-white",
  "college & career": "bg-amber-600 text-white",
  "ap courses": "bg-red-600 text-white",
  music: "bg-pink-500 text-white",
  "study tools": "bg-lime-600 text-white",
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const key = category.toLowerCase();
  const colorClass = categoryColors[key] || "bg-indigo-500 text-white";

  return (
    <Badge className={cn("text-xs font-medium border-0", colorClass, className)}>
      {category}
    </Badge>
  );
}
