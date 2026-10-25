export function ComingSoon({ section }: { section: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[var(--card)] px-6 py-16 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-400/80">
        Coming soon
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{section}</h2>
      <p className="mt-2 text-sm text-slate-400">
        This page is a placeholder. The live chain is already connected on the
        Dashboard.
      </p>
    </div>
  );
}
