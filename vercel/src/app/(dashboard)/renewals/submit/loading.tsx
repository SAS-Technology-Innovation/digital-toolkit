import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RenewalSubmitLoading() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-56" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>

      {/* App selector */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Assessment form */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form fields */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Rating section */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Submit button */}
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    </div>
  );
}
