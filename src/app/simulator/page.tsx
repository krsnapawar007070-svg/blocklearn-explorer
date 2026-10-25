"use client";

import { useEffect, useState } from "react";
import { ChainStatusBanner } from "@/components/ChainStatusBanner";
import { StatCard } from "@/components/StatCard";
import {
  IconActivity,
  IconCheck,
  IconCpu,
  IconFlask,
  IconHash,
  IconLayers,
  IconLink,
  IconShieldCheck,
  IconShieldX,
} from "@/components/icons";
import type { BlockAnalysis } from "@/lib/blockchainStore";
import type { Block } from "@blockchain/Block";
import type { Transaction } from "@blockchain/Transaction";

export default function SimulatorPage() {
  const [chain, setChain] = useState<Block[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<BlockAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form selection state
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(1);
  const [selectedTxIndex, setSelectedTxIndex] = useState<number>(0);
  const [newAmount, setNewAmount] = useState<string>("5000");

  // Feedback states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fetchSimulatorState = async () => {
    try {
      const res = await fetch("/api/simulator");
      if (res.ok) {
        const json = await res.json();
        setChain(json.chain || []);
        setIsValid(json.isValid);
        setAnalysis(json.analysis || []);

        // Default selection to first non-genesis block with transactions
        const nonGenesisBlock = (json.chain || []).find(
          (b: Block) => b.index > 0 && b.transactions.length > 0
        );
        if (nonGenesisBlock) {
          setSelectedBlockIndex(nonGenesisBlock.index);
        }
      }
    } catch (err) {
      console.error("Failed to fetch simulator state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulatorState();
  }, []);

  const selectedBlock = chain.find((b) => b.index === selectedBlockIndex);
  const selectedTx: Transaction | undefined =
    selectedBlock?.transactions?.[selectedTxIndex];

  const handleTamper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlock || selectedBlock.index === 0) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/simulator/tamper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockIndex: selectedBlockIndex,
          txIndex: selectedTxIndex,
          newAmount: Number(newAmount),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: json.error || "Tamper failed.", type: "error" });
      } else {
        setChain(json.chain || []);
        setIsValid(json.isValid);
        setAnalysis(json.analysis || []);
        setStatusMessage({
          text: `❌ Transaction tampered! Amount changed to ${newAmount}. Blockchain validity failed.`,
          type: "error",
        });
      }
    } catch {
      setStatusMessage({ text: "An error occurred during tampering.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecalculateHash = async () => {
    if (!selectedBlock || selectedBlock.index === 0) return;

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/simulator/recalculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockIndex: selectedBlockIndex }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: json.error || "Recalculation failed.", type: "error" });
      } else {
        setChain(json.chain || []);
        setIsValid(json.isValid);
        setAnalysis(json.analysis || []);
        setStatusMessage({
          text: `⚠️ Block #${selectedBlockIndex} hash recalculated! However, the next block still references the old hash, keeping the chain invalid.`,
          type: "info",
        });
      }
    } catch {
      setStatusMessage({ text: "An error occurred during recalculation.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async () => {
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/simulator/restore", {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: json.error || "Restore failed.", type: "error" });
      } else {
        setChain(json.chain || []);
        setIsValid(json.isValid);
        setAnalysis(json.analysis || []);
        setStatusMessage({
          text: "✓ Blockchain restored successfully to original valid state.",
          type: "success",
        });
      }
    } catch {
      setStatusMessage({ text: "An error occurred during restoration.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const shortenHash = (hash: string) => {
    if (!hash || hash.length <= 16) return hash;
    return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* Header Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <IconFlask className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Blockchain Security Simulator
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          See what happens when someone tries to modify a confirmed block.
        </p>
      </div>

      {/* 2. Educational Warning Banner */}
      <section className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-amber-950/20 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 font-bold text-amber-300">
            ℹ
          </span>
          <div>
            <h2 className="text-sm font-semibold text-amber-300">Safe Educational Sandbox</h2>
            <p className="mt-1 text-xs text-amber-200/80 leading-relaxed">
              This is a safe educational simulation. Changes are made to the in-memory blockchain state and can be completely restored at any time. Unlike real decentralized cryptocurrencies, no permanent network state is harmed.
            </p>
          </div>
        </div>
      </section>

      {/* Prominent Validity Status */}
      <ChainStatusBanner valid={isValid} />

      {/* Main Grid: Control Panel + Visual Chain */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Left: Tamper Controls & Action Center */}
        <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-5 lg:col-span-2 md:p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-white">Tamper Control Panel</h2>
            <p className="text-xs text-slate-400">
              Select a confirmed block and alter its transaction amount.
            </p>
          </div>

          <form onSubmit={handleTamper} className="flex flex-col gap-4">
            {/* Block Selector */}
            <div>
              <label htmlFor="block-select" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-300">
                Select Block to Modify
              </label>
              <select
                id="block-select"
                value={selectedBlockIndex}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedBlockIndex(idx);
                  setSelectedTxIndex(0);
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              >
                {chain.map((b) => (
                  <option key={b.index} value={b.index} disabled={b.index === 0}>
                    {b.index === 0
                      ? "Block #0 (Genesis - Locked)"
                      : `Block #${b.index} (${b.transactions.length} txs)`}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction Selector */}
            {selectedBlock && selectedBlock.transactions.length > 0 && (
              <div>
                <label htmlFor="tx-select" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Select Transaction inside Block #{selectedBlock.index}
                </label>
                <select
                  id="tx-select"
                  value={selectedTxIndex}
                  onChange={(e) => setSelectedTxIndex(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                >
                  {selectedBlock.transactions.map((tx, idx) => (
                    <option key={tx.id} value={idx}>
                      Tx #{idx + 1}: {tx.sender} → {tx.receiver} ({tx.amount} coins)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount Field */}
            {selectedTx && (
              <div className="rounded-xl bg-black/40 p-3.5 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Original Amount:</span>
                  <span className="font-semibold text-emerald-300">{selectedTx.amount} coins</span>
                </div>

                <div>
                  <label htmlFor="tamper-amount" className="mb-1 block text-xs font-medium uppercase tracking-wider text-rose-300">
                    Tampered New Amount:
                  </label>
                  <input
                    id="tamper-amount"
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-rose-500/40 bg-slate-950 px-3.5 py-2 text-sm font-semibold text-rose-300 placeholder-slate-500 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
                  />
                </div>
              </div>
            )}

            {/* Tamper Button */}
            <button
              type="submit"
              disabled={submitting || !selectedTx}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-50"
            >
              <span>Tamper With Transaction</span>
            </button>
          </form>

          <hr className="border-white/10" />

          {/* Educational Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleRecalculateHash}
              disabled={submitting || isValid}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-500/20 disabled:opacity-40"
            >
              <span>Recalculate Block Hash (Educational Action)</span>
            </button>

            <button
              type="button"
              onClick={handleRestore}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
            >
              <span>Restore Original Blockchain</span>
            </button>
          </div>

          {statusMessage && (
            <div
              className={`rounded-xl border p-3.5 text-xs leading-relaxed ${
                statusMessage.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : statusMessage.type === "error"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  : "border-purple-500/30 bg-purple-500/10 text-purple-300"
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </section>

        {/* Right: Visual Chain with Tamper Status */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Visual Blockchain Status</h2>
              <p className="text-xs text-slate-400">
                Real-time integrity analysis per block
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                isValid
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-rose-400/30 bg-rose-400/10 text-rose-300"
              }`}
            >
              {isValid ? "✓ Chain Intact" : "❌ Chain Tampered"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-sm text-slate-400">
              Loading simulator state...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {chain.map((block, i) => {
                const itemAnalysis = analysis.find((a) => a.index === block.index);
                const isGenesis = block.index === 0;
                const status = itemAnalysis?.status || "valid";

                return (
                  <div key={block.index} className="flex flex-col items-stretch">
                    {/* Visual Connector Arrow */}
                    {i > 0 && (
                      <div className="my-1.5 flex flex-col items-center">
                        <div
                          className={`h-5 w-0.5 ${
                            status === "broken_link"
                              ? "bg-rose-500"
                              : "bg-cyan-400/50"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                            status === "broken_link"
                              ? "text-rose-400"
                              : "text-slate-500"
                          }`}
                        >
                          {status === "broken_link"
                            ? "❌ BROKEN LINK"
                            : "previousHash ↓"}
                        </span>
                        <div
                          className={`h-5 w-0.5 ${
                            status === "broken_link"
                              ? "bg-rose-500"
                              : "bg-cyan-400/50"
                          }`}
                        />
                      </div>
                    )}

                    {/* Block Tile */}
                    <div
                      className={`rounded-2xl border p-4 transition-all ${
                        status === "tampered"
                          ? "border-rose-500/50 bg-rose-950/20 ring-2 ring-rose-500/30"
                          : status === "broken_link"
                          ? "border-amber-500/50 bg-amber-950/20 ring-2 ring-amber-500/30"
                          : isGenesis
                          ? "border-amber-500/30 bg-amber-950/10"
                          : "border-white/10 bg-[var(--card)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {isGenesis ? "GENESIS BLOCK (#0)" : `BLOCK #${block.index}`}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({block.transactions.length} {block.transactions.length === 1 ? "tx" : "txs"})
                          </span>
                        </div>

                        {/* Validity Badge */}
                        {status === "valid" ? (
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                            ✓ Valid
                          </span>
                        ) : status === "tampered" ? (
                          <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/40 animate-pulse">
                            ❌ TAMPERED
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40">
                            ❌ BROKEN LINK
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-slate-500">Stored Hash: </span>
                          <span className="font-mono text-cyan-300">{shortenHash(block.hash)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Previous Hash: </span>
                          <span className="font-mono text-slate-400">{shortenHash(block.previousHash)}</span>
                        </div>
                      </div>

                      {/* Display transactions */}
                      {block.transactions.length > 0 && (
                        <div className="mt-3 border-t border-white/5 pt-2 flex flex-wrap gap-2">
                          {block.transactions.map((tx) => (
                            <span
                              key={tx.id}
                              className="rounded bg-black/40 px-2 py-1 font-mono text-[11px] text-slate-300 border border-white/5"
                            >
                              {tx.sender} → {tx.receiver}: <strong className="text-white">{tx.amount} coins</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Diagnostic Explanation if Tampered/Broken */}
                      {status !== "valid" && itemAnalysis && (
                        <div className="mt-3 rounded-xl bg-black/50 p-3 text-xs border border-rose-500/30 text-rose-200">
                          <p className="font-semibold text-rose-300">
                            {status === "tampered" ? "❌ Block Hash Mismatch:" : "❌ Previous Hash Mismatch:"}
                          </p>
                          <p className="mt-1 leading-relaxed text-slate-300">{itemAnalysis.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 7. Forensic Security Analysis Breakdown */}
      {!isValid && analysis.some((a) => a.status !== "valid") && (
        <section className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-slate-900/80 to-rose-950/30 p-5 md:p-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 font-bold text-rose-400">
              🚨
            </span>
            <h2 className="text-base font-bold text-white">Forensic Security Breakdown</h2>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {analysis
              .filter((a) => a.status !== "valid")
              .map((item) => (
                <div key={item.index} className="rounded-xl bg-black/50 p-4 border border-rose-500/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-rose-300 text-sm">
                      BLOCK #{item.index} - {item.status === "tampered" ? "DATA TAMPERED" : "LINK BROKEN"}
                    </h3>
                    <span className="font-mono text-xs text-rose-400">isChainValid() = false</span>
                  </div>

                  <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                    <div className="rounded bg-slate-950 p-2.5 border border-white/5">
                      <p className="text-slate-400">Stored Hash in Block Header:</p>
                      <p className="mt-1 break-all font-mono font-semibold text-cyan-300">{item.storedHash}</p>
                    </div>
                    <div className="rounded bg-slate-950 p-2.5 border border-white/5">
                      <p className="text-slate-400">Current Recalculated Hash from Contents:</p>
                      <p className="mt-1 break-all font-mono font-semibold text-rose-400">{item.calculatedHash}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {item.status === "tampered"
                      ? "The transaction data changed, so the calculated hash changed. However, the block header still stores its original hash. SHA-256 fingerprint verification failed."
                      : "The previous block's hash changed, but this block still points to the old previousHash string. The chain continuity is broken."}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 11. Security Explanation Section */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-cyan-300">
              Why is blockchain difficult to tamper with?
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300 md:text-sm">
              Blockchain immutability relies on cryptographic hash pointers linked in a chain structure:
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-black/40 p-3.5 border border-white/5">
              <span className="font-semibold text-cyan-300 text-xs">1. Unique Fingerprints</span>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Every block has a unique SHA-256 hash derived from its exact contents.
              </p>
            </div>

            <div className="rounded-xl bg-black/40 p-3.5 border border-white/5">
              <span className="font-semibold text-cyan-300 text-xs">2. Cryptographic Links</span>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Each block stores the exact previous block's hash link.
              </p>
            </div>

            <div className="rounded-xl bg-black/40 p-3.5 border border-white/5">
              <span className="font-semibold text-cyan-300 text-xs">3. Instant Hash Mutation</span>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Changing even 1 coin amount instantly changes the calculated block hash.
              </p>
            </div>

            <div className="rounded-xl bg-black/40 p-3.5 border border-white/5">
              <span className="font-semibold text-cyan-300 text-xs">4. Stale Reference Pointer</span>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                The next block in history still references the old hash.
              </p>
            </div>

            <div className="rounded-xl bg-black/40 p-3.5 border border-white/5">
              <span className="font-semibold text-cyan-300 text-xs">5. Automatic Detection</span>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                All nodes running <code className="text-cyan-300">isChainValid()</code> instantly reject the chain.
              </p>
            </div>

            <div className="rounded-xl bg-black/40 p-3.5 border border-white/5">
              <span className="font-semibold text-cyan-300 text-xs">6. Proof of Work Cost</span>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                To rewrite history, an attacker must re-mine every subsequent block with expensive Proof of Work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
