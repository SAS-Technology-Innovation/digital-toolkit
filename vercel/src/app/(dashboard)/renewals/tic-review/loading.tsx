import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TicReviewLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* App list */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assessment items */}
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
