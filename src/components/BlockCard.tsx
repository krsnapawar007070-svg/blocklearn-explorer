import { Block } from "@blockchain/Block";
import { IconClock, IconCpu, IconHash, IconLink } from "./icons";

type BlockCardProps = {
  block: Block;
  featured?: boolean;
};

function shortenHash(hash: string): string {
  if (hash.length <= 20) {
    return hash;
  }
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function BlockCard({ block, featured = false }: BlockCardProps) {
  const details = [
    {
      label: "Hash",
      value: featured ? block.hash : shortenHash(block.hash),
      icon: IconHash,
      mono: true,
    },
    {
      label: "Previous hash",
      value: featured ? block.previousHash : shortenHash(block.previousHash),
      icon: IconLink,
      mono: true,
    },
    {
      label: "Nonce",
      value: String(block.nonce),
      icon: IconCpu,
      mono: false,
    },
    {
      label: "Timestamp",
      value: formatTime(block.timestamp),
      icon: IconClock,
      mono: false,
    },
  ];

  return (
    <article
      className={`rounded-2xl border border-white/10 bg-[var(--card)] p-5 transition-colors duration-200 hover:border-white/15 ${
        featured ? "md:p-6" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            {block.index === 0 ? "Genesis block" : "Block"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            #{block.index}
          </h3>
        </div>
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-400/20">
          {block.transactions.length}{" "}
          {block.transactions.length === 1 ? "transaction" : "transactions"}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {details.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl bg-white/[0.03] px-3 py-3 ring-1 ring-white/5"
            >
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </dt>
              <dd
                className={`mt-1 break-all text-sm text-slate-200 ${
                  item.mono ? "font-mono text-xs leading-relaxed" : ""
                }`}
              >
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </article>
  );
}
