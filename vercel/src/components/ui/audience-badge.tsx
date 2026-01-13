import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AudienceType = "staff" | "teachers" | "students" | "parents";

const audienceColors: Record<AudienceType, string> = {
  staff: "bg-purple-500 text-white hover:bg-purple-600",
  teachers: "bg-emerald-500 text-white hover:bg-emerald-600",
  students: "bg-amber-400 text-amber-900 hover:bg-amber-500",
  parents: "bg-pink-500 text-white hover:bg-pink-600",
};

interface AudienceBadgeProps {
  audience: string;
  className?: string;
}

export function AudienceBadge({ audience, className }: AudienceBadgeProps) {
  const key = audience.toLowerCase() as AudienceType;
  const colorClass = audienceColors[key] || "bg-gray-500 text-white";

  return (
    <Badge className={cn("text-xs font-medium border-0", colorClass, className)}>
      {audience}
    </Badge>
  );
}

interface AudienceBadgeListProps {
  audiences: string | string[];
  className?: string;
}

export function AudienceBadgeList({ audiences, className }: AudienceBadgeListProps) {
  const audienceList = typeof audiences === "string"
    ? audiences.split(",").map(a => a.trim()).filter(Boolean)
    : audiences;

  if (audienceList.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {audienceList.map((aud) => (
        <AudienceBadge key={aud} audience={aud} />
      ))}
    </div>
  );
}
