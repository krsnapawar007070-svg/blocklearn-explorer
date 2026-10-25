import { IconShieldCheck, IconShieldX } from "./icons";

export function ChainStatusBanner({ valid }: { valid: boolean }) {
  if (valid) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-emerald-200">
        <IconShieldCheck className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">✓ Blockchain Valid</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-rose-200">
      <IconShieldX className="h-5 w-5 shrink-0" />
      <p className="text-sm font-medium">✕ Blockchain Invalid</p>
    </div>
  );
}
