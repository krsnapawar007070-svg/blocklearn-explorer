"use client";

import { useState } from "react";
import { Transaction } from "@blockchain/Transaction";
import { IconCheck, IconCopy } from "./icons";

type TransactionCardProps = {
  transaction: Transaction;
  showCopyButton?: boolean;
};

function shortenId(id: string): string {
  if (!id) return "";
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

export function TransactionCard({
  transaction,
  showCopyButton = true,
}: TransactionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transaction.id) return;
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-[var(--card)] p-4 transition-colors duration-200 hover:border-white/15">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-400" title={transaction.id}>
            ID: {shortenId(transaction.id)}
          </span>
          {showCopyButton && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
              title="Copy full transaction ID"
            >
              {copied ? (
                <>
                  <IconCheck className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <IconCopy className="h-3 w-3 text-slate-400" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          )}
        </div>
        <p className="text-sm font-semibold tabular-nums text-cyan-300">
          {transaction.amount} coins
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-slate-200">
          <span className="font-medium text-white">{transaction.sender}</span>
          <span className="mx-2 text-slate-500">→</span>
          <span className="font-medium text-white">{transaction.receiver}</span>
        </p>
        <p className="text-xs text-slate-500">
          {new Date(transaction.timestamp).toLocaleString()}
        </p>
      </div>
    </article>
  );
}
