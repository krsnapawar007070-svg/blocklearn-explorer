import { IconInbox } from "./icons";

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/12 bg-[var(--card)] px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-slate-400">
        <IconInbox className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-200">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
    </div>
  );
}
