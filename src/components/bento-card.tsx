import { cn } from "@/lib/utils";

export function BentoCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
