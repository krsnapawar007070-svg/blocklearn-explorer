"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { TransactionCard } from "@/components/TransactionCard";
import {
  IconActivity,
  IconInbox,
  IconLayers,
} from "@/components/icons";
import type { Transaction } from "@blockchain/Transaction";

export default function TransactionsPage() {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [totalConfirmed, setTotalConfirmed] = useState<number>(0);
  const [totalBlocks, setTotalBlocks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [sender, setSender] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // Feedback state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setPendingTransactions(data.pendingTransactions || []);
        setTotalConfirmed(data.totalConfirmed || 0);
        setTotalBlocks(data.totalBlocks || 0);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client side validation
    const trimmedSender = sender.trim();
    const trimmedReceiver = receiver.trim();
    const parsedAmount = Number(amount);

    if (!trimmedSender) {
      setErrorMessage("Sender name or address cannot be empty.");
      return;
    }

    if (!trimmedReceiver) {
      setErrorMessage("Receiver name or address cannot be empty.");
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Amount must be a number greater than 0.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: trimmedSender,
          receiver: trimmedReceiver,
          amount: parsedAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create transaction.");
      } else {
        setSuccessMessage(`Transaction created! ID: ${data.transaction.id.slice(0, 12)}…`);
        setSender("");
        setReceiver("");
        setAmount("");
        if (data.pendingTransactions) {
          setPendingTransactions(data.pendingTransactions);
          setTotalConfirmed(data.totalConfirmed);
          setTotalBlocks(data.totalBlocks);
        } else {
          fetchState();
        }
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* 1. Transaction statistics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Pending Transactions"
          value={loading ? "..." : String(pendingTransactions.length)}
          hint="Waiting in the mempool"
          icon={<IconInbox className="h-4 w-4" />}
        />
        <StatCard
          label="Total Confirmed"
          value={loading ? "..." : String(totalConfirmed)}
          hint="Sealed inside mined blocks"
          icon={<IconActivity className="h-4 w-4" />}
        />
        <StatCard
          label="Total Blocks"
          value={loading ? "..." : String(totalBlocks)}
          hint="Chain height including genesis"
          icon={<IconLayers className="h-4 w-4" />}
        />
      </section>

      {/* 2. Educational explanation */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-cyan-300">
              What is a pending transaction?
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300 md:text-sm">
              When you broadcast a transfer on a blockchain, it doesn't instantly join history.
              Instead, it is held in a temporary staging area called the <span className="font-semibold text-cyan-200">mempool</span> (memory pool).
              Transactions remain pending until a miner bundles them into a new block and solves the Proof-of-Work puzzle.
            </p>
          </div>

          {/* Flow Visualizer */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/30 px-4 py-3 border border-white/5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">1</span>
              <span className="text-xs font-medium text-slate-200">Transaction Created</span>
            </div>
            <span className="hidden text-slate-500 sm:inline">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-bold text-amber-300">2</span>
              <span className="text-xs font-medium text-amber-200">Pending / Mempool</span>
            </div>
            <span className="hidden text-slate-500 sm:inline">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-300">3</span>
              <span className="text-xs font-medium text-slate-200">Mining</span>
            </div>
            <span className="hidden text-slate-500 sm:inline">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-300">4</span>
              <span className="text-xs font-medium text-emerald-200">Confirmed in Block</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Form + Mempool List */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Section 1: Create Transaction Form */}
        <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-5 lg:col-span-2 md:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Create Transaction</h2>
            <p className="text-xs text-slate-400">
              Submit a value transfer into the blockchain's mempool pool.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                {successMessage}
              </div>
            )}

            <div>
              <label htmlFor="sender" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-300">
                Sender
              </label>
              <input
                id="sender"
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. Alice"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <div>
              <label htmlFor="receiver" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-300">
                Receiver
              </label>
              <input
                id="receiver"
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="e.g. Bob"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <div>
              <label htmlFor="amount" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-300">
                Amount (Coins)
              </label>
              <input
                id="amount"
                type="number"
                step="any"
                min="0.000001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
            >
              {submitting ? "Creating Transaction..." : "Create Transaction"}
            </button>
          </form>
        </section>

        {/* Section 2: Pending Transaction Pool */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Pending Transaction Pool
              </h2>
              <p className="text-xs text-slate-400">
                Transactions in mempool waiting to be mined into a block
              </p>
            </div>
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-400/20">
              {pendingTransactions.length} pending
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-sm text-slate-400">
              Loading pending transactions...
            </div>
          ) : pendingTransactions.length === 0 ? (
            <EmptyState
              title="No pending transactions"
              message="Create a transaction above to add one to the mempool."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {pendingTransactions.map((tx) => (
                <TransactionCard key={tx.id} transaction={tx} showCopyButton />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
