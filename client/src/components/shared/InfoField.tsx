import type { LucideIcon } from "lucide-react";

type InfoFieldProps = {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  className?: string;
};

function InfoField({ icon: Icon, label, value, className }: InfoFieldProps) {
  return (
    <div className={className}>
      <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 text-sm font-medium break-words">
        {value && value.trim() ? value : "—"}
      </p>
    </div>
  );
}

export { InfoField };
