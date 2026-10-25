"use client";

import { useEffect, useState } from "react";
import { BlockCard } from "@/components/BlockCard";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { TransactionCard } from "@/components/TransactionCard";
import {
  IconCpu,
  IconHash,
  IconInbox,
  IconLayers,
  IconPickaxe,
  IconShieldCheck,
} from "@/components/icons";
import type { Block } from "@blockchain/Block";
import type { Transaction } from "@blockchain/Transaction";

type MinedResult = {
  block: Block;
  durationMs: number;
  difficulty: number;
};

export default function MiningPage() {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [totalBlocks, setTotalBlocks] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(4);
  const [latestBlockHash, setLatestBlockHash] = useState<string>("0");
  const [chain, setChain] = useState<Block[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Mining state
  const [isMining, setIsMining] = useState<boolean>(false);
  const [minedResult, setMinedResult] = useState<MinedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMiningState = async () => {
    try {
      const res = await fetch("/api/mining");
      if (res.ok) {
        const data = await res.json();
        setPendingTransactions(data.pendingTransactions || []);
        setTotalBlocks(data.totalBlocks || 0);
        setDifficulty(data.difficulty || 4);
        setLatestBlockHash(data.latestBlock?.hash || "0");
        setChain(data.chain || []);
      }
    } catch (err) {
      console.error("Failed to load mining state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiningState();
  }, []);

  const handleMineBlock = async () => {
    if (pendingTransactions.length === 0 || isMining) return;

    setIsMining(true);
    setErrorMessage(null);
    setMinedResult(null);

    try {
      const res = await fetch("/api/mining", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Mining failed.");
      } else {
        setMinedResult({
          block: data.minedBlock,
          durationMs: data.durationMs,
          difficulty: data.difficulty,
        });

        setPendingTransactions(data.pendingTransactions || []);
        setTotalBlocks(data.totalBlocks || 0);
        setDifficulty(data.difficulty || 4);
        setLatestBlockHash(data.latestBlock?.hash || "0");
        setChain(data.chain || []);
      }
    } catch {
      setErrorMessage("An unexpected network error occurred while mining.");
    } finally {
      setIsMining(false);
    }
  };

  const shortenHash = (hash: string) => {
    if (!hash || hash.length <= 16) return hash;
    return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} seconds`;
  };

  const recentBlocks = [...chain].reverse();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* 1. Mining Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Transactions"
          value={loading ? "..." : String(pendingTransactions.length)}
          hint="Mempool queue to mine"
          icon={<IconInbox className="h-4 w-4" />}
        />
        <StatCard
          label="Blockchain Height"
          value={loading ? "..." : `${totalBlocks} Blocks`}
          hint="Chain length including genesis"
          icon={<IconLayers className="h-4 w-4" />}
        />
        <StatCard
          label="Mining Difficulty"
          value={loading ? "..." : String(difficulty)}
          hint={`Must start with ${difficulty} zeros ("${"0".repeat(difficulty)}...")`}
          icon={<IconCpu className="h-4 w-4" />}
        />
        <StatCard
          label="Latest Block Hash"
          value={loading ? "..." : shortenHash(latestBlockHash)}
          hint="Parent hash for next block"
          icon={<IconHash className="h-4 w-4" />}
        />
      </section>

      {/* 2 & 3. Mining Controller & Pending Transactions */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: Mining Controller */}
        <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-5 lg:col-span-2 md:p-6 flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <IconPickaxe className="h-5 w-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">Proof-of-Work Miner</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Mine pending transfers into a cryptographically sealed block.
            </p>

            {/* Mining Status Box */}
            {isMining && (
              <div className="mt-5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-center animate-pulse">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  Mining block...
                </div>
                <p className="mt-2 text-xs text-cyan-200/80">
                  Current difficulty: <span className="font-mono font-bold text-white">{difficulty}</span>
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Searching for a valid nonce...
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Mine Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleMineBlock}
                disabled={isMining || pendingTransactions.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconPickaxe className={`h-4 w-4 ${isMining ? "animate-spin" : ""}`} />
                <span>
                  {isMining
                    ? "Mining in Progress..."
                    : pendingTransactions.length === 0
                    ? "No Transactions to Mine"
                    : `Mine ${pendingTransactions.length} Pending ${
                        pendingTransactions.length === 1 ? "Transaction" : "Transactions"
                      }`}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.02] p-3 border border-white/5 text-xs text-slate-400">
            <span className="font-medium text-white">Rule:</span> Proof-of-Work checks every nonce until the block's SHA-256 hash begins with exactly <span className="font-mono text-cyan-300">{difficulty} leading zeros</span>.
          </div>
        </section>

        {/* Right: Mempool Queue */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">
                Pending Mempool Queue
              </h2>
              <p className="text-xs text-slate-400">
                Transfers queued to be packed into the next block
              </p>
            </div>
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-400/20">
              {pendingTransactions.length} ready
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-sm text-slate-400">
              Loading mempool state...
            </div>
          ) : pendingTransactions.length === 0 ? (
            <EmptyState
              title="No transactions waiting for mining"
              message="Create a transaction on the Transactions page first to add transfers to the pool."
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

      {/* 4 & 5. Mining Result Card */}
      {minedResult && (
        <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-slate-900/80 to-emerald-950/20 p-5 md:p-6 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                ✓
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                  Block Mined Successfully
                </p>
                <h3 className="text-lg font-bold text-white">
                  Block #{minedResult.block.index}
                </h3>
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
              Mined in {formatDuration(minedResult.durationMs)}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl bg-black/40 p-3 border border-white/5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Block Number</p>
              <p className="mt-1 text-sm font-semibold text-white">#{minedResult.block.index}</p>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Nonce (Work Proof)</p>
              <p className="mt-1 text-sm font-mono font-semibold text-cyan-300">{minedResult.block.nonce}</p>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Transactions Mined</p>
              <p className="mt-1 text-sm font-semibold text-white">{minedResult.block.transactions.length}</p>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/5">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Difficulty Level</p>
              <p className="mt-1 text-sm font-semibold text-white">{minedResult.difficulty} zero prefix</p>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/5 sm:col-span-2 md:col-span-2">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Block Hash</p>
              <p className="mt-1 break-all font-mono text-xs text-emerald-300">{minedResult.block.hash}</p>
            </div>
            <div className="rounded-xl bg-black/40 p-3 border border-white/5 sm:col-span-2 md:col-span-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Previous Block Hash</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-400">{minedResult.block.previousHash}</p>
            </div>
          </div>
        </section>
      )}

      {/* 6. Educational Section */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-cyan-300">
              How Proof of Work works
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300 md:text-sm">
              Mining repeatedly changes the nonce and calculates the block hash until the hash satisfies the network's difficulty requirement.
              At difficulty <span className="font-semibold text-cyan-200">{difficulty}</span>, the SHA-256 hash must begin with four zeros (<span className="font-mono text-cyan-300">"0000..."</span>).
            </p>
          </div>

          {/* Flow Visualizer Diagram */}
          <div className="mt-2 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/30 p-5 border border-white/5">
            <div className="flex flex-wrap items-center justify-center gap-3 text-center">
              <div className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white border border-white/10">
                Block Data
              </div>
              <span className="text-slate-500">↓</span>
              <div className="rounded-lg bg-cyan-900/50 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-400/30">
                Nonce (e.g. 0, 1, 2...)
              </div>
              <span className="text-slate-500">↓</span>
              <div className="rounded-lg bg-purple-900/50 px-3.5 py-1.5 text-xs font-semibold text-purple-300 border border-purple-400/30">
                SHA-256 Hashing
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-slate-500">↓</span>
              <div className="rounded-xl bg-black/60 px-4 py-2 text-xs font-bold text-amber-300 border border-amber-400/30">
                Valid Hash? Starts with {"0".repeat(difficulty)}?
              </div>
              <div className="flex items-center gap-12 text-xs">
                <div className="flex flex-col items-center text-rose-400">
                  <span>No ↙</span>
                  <span className="mt-1 rounded bg-rose-500/10 px-2 py-0.5 font-mono text-[11px] text-rose-300">Change nonce (+1)</span>
                </div>
                <div className="flex flex-col items-center text-emerald-400">
                  <span>↘ Yes</span>
                  <span className="mt-1 rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-300">Block Mined!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Mining History */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Mined Block History</h2>
            <p className="text-xs text-slate-500">
              Read directly from the live blockchain chain (newest first)
            </p>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-mono text-slate-400 border border-white/10">
            {recentBlocks.length} total blocks
          </span>
        </div>

        <div className="grid gap-4">
          {recentBlocks.map((block) => (
            <BlockCard key={`${block.index}-${block.hash}`} block={block} />
          ))}
        </div>
      </section>
    </div>
  );
}
