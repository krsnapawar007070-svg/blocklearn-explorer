import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: "default" | "success" | "danger";
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: StatCardProps) {
  const valueColor =
    tone === "success"
      ? "text-emerald-300"
      : tone === "danger"
        ? "text-rose-300"
        : "text-white";

  return (
    <article className="rounded-2xl border border-white/10 bg-[var(--card)] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-colors duration-200 hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-cyan-300">
          {icon}
        </div>
      </div>
      <p className={`mt-4 text-2xl font-semibold tracking-tight ${valueColor}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </article>
  );
}
