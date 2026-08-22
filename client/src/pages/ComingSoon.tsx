import { Construction } from "lucide-react";
import { useLocation } from "react-router";

export default function ComingSoon() {
  const { pathname } = useLocation();
  return (
    <div className="flex max-w-6xl mx-auto min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Construction className="size-7" />
      </span>
      <h1 className="mt-5 text-xl font-semibold">This page is coming next</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {pathname}
        </code>{" "}
        is queued in the build plan and will light up shortly.
      </p>
    </div>
  );
}


