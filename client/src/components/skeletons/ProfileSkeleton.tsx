import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardContent className="flex items-center gap-5 py-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-44" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
              {Array.from({ length: 6 }).map((__, j) => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-36" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { ProfileSkeleton };


