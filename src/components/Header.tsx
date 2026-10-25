type HeaderProps = {
  title?: string;
  subtitle?: string;
};

export function Header({
  title = "BlockLearn Explorer",
  subtitle = "Educational Blockchain Explorer & Transaction Simulator",
}: HeaderProps) {
  return (
    <header className="border-b border-white/10 px-4 py-5 md:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-400/80">
        BlockLearn
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">
        {title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-400">{subtitle}</p>
    </header>
  );
}
