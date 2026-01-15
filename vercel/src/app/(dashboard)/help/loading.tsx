import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function HelpLoading() {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Quick links */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-8 mb-3" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6 text-center">
                <Skeleton className="h-10 w-10 rounded-full mx-auto mb-3" />
                <Skeleton className="h-5 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto mb-1" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-64" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b last:border-0 pb-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
