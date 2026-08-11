import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent",
        className
      )}
    />
  );
}

export function FullPageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <Spinner />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
