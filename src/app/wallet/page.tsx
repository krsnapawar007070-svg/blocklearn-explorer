"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import {
  IconActivity,
  IconCheck,
  IconClose,
  IconCopy,
  IconHash,
  IconLayers,
  IconSearch,
  IconWallet,
} from "@/components/icons";
import type { WalletInfo } from "@/app/api/wallet/route";

export default function WalletPage() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [totalBlocks, setTotalBlocks] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWalletName, setSelectedWalletName] = useState<string>("Alice");

  // Copy feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchWalletState = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const json = await res.json();
        setWallets(json.wallets || []);
        setTotalBlocks(json.totalConfirmedBlocks || 0);

        // Default selection to first wallet if current selection doesn't exist
        if (json.wallets && json.wallets.length > 0) {
          const exists = json.wallets.some((w: WalletInfo) => w.name === selectedWalletName);
          if (!exists) {
            setSelectedWalletName(json.wallets[0].name);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch wallet state", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletState();
  }, []);

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // Fallback
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  const shortenId = (id: string) => {
    if (!id || id.length <= 16) return id;
    return `${id.slice(0, 8)}…${id.slice(-6)}`;
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredWallets = wallets.filter((w) => {
    if (!query) return true;
    return w.name.toLowerCase().includes(query) || w.address.toLowerCase().includes(query);
  });

  const selectedWallet = wallets.find((w) => w.name === selectedWalletName) || wallets[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* 1. Header & Educational Disclaimer */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <IconWallet className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Wallet & Address Inspector
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Explore educational wallet balances and transaction history from the simulated blockchain.
        </p>
      </div>

      <section className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/20 font-bold text-cyan-300">
            ℹ
          </span>
          <div>
            <h2 className="text-sm font-semibold text-cyan-300">Educational Simulation Disclaimer</h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              These wallets are simulated for educational purposes only. They do not hold real cryptocurrency or connect to a real blockchain network.
            </p>
          </div>
        </div>
      </section>

      {/* Top Statistics Tiles */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Wallets Detected"
          value={loading ? "..." : String(wallets.length)}
          hint="Participants with history"
          icon={<IconWallet className="h-4 w-4" />}
        />
        <StatCard
          label="Confirmed Blocks"
          value={loading ? "..." : String(totalBlocks)}
          hint="Source for balance calculation"
          icon={<IconLayers className="h-4 w-4" />}
        />
        <StatCard
          label="Total Wallet Activity"
          value={loading ? "..." : String(wallets.reduce((acc, w) => acc + w.transactionCount, 0))}
          hint="Confirmed transactions processed"
          icon={<IconActivity className="h-4 w-4" />}
        />
      </section>

      {/* 6. Address Search Bar */}
      <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-4 shadow-xl">
        <div className="relative flex items-center">
          <IconSearch className="absolute left-4 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wallet name or educational address (e.g. Alice, EDU-A1C3)..."
            className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 rounded-md p-1 text-slate-400 hover:text-white"
            >
              <IconClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Main Grid: Wallet List Cards + Selected Wallet Inspector */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* 4. Wallet List */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Detected Wallets</h2>
            <span className="text-xs text-slate-400">{filteredWallets.length} available</span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-sm text-slate-400">
              Calculating wallet balances...
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-slate-400">
              <p className="text-sm font-semibold text-white">No matching wallets found.</p>
              <p className="mt-1 text-xs text-slate-500">Try searching for "Alice" or "Bob".</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredWallets.map((wallet) => {
                const isSelected = wallet.name === selectedWalletName;

                return (
                  <div
                    key={wallet.address}
                    onClick={() => setSelectedWalletName(wallet.name)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? "border-cyan-400/60 bg-cyan-950/20 ring-1 ring-cyan-400/40"
                        : "border-white/10 bg-[var(--card)] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">{wallet.name}</h3>
                      <span className="text-base font-extrabold text-cyan-300">
                        {wallet.balance} coins
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-slate-400" title={wallet.address}>
                        {wallet.address}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(wallet.address);
                        }}
                        className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        {copiedText === wallet.address ? (
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        ) : (
                          <span>Copy Address</span>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-2">
                      <span>{wallet.transactionCount} confirmed {wallet.transactionCount === 1 ? "tx" : "txs"}</span>
                      <span className="text-cyan-400/80 font-medium">Click to inspect →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. Wallet Detail Inspector */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          {selectedWallet ? (
            <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-5 md:p-6 flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                    Wallet Inspector
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-0.5">
                    {selectedWallet.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{selectedWallet.address}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedWallet.address)}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      {copiedText === selectedWallet.address ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-black/40 px-4 py-3 border border-white/5 text-right">
                  <p className="text-[11px] uppercase text-slate-400">Current Balance</p>
                  <p className="text-2xl font-bold text-cyan-300">{selectedWallet.balance} coins</p>
                </div>
              </div>

              <div className="rounded-xl bg-cyan-400/5 p-3 border border-cyan-400/20 text-xs text-cyan-200">
                ✓ Balance calculated from confirmed blockchain transactions. (Pending transactions in mempool are ignored until mined).
              </div>

              {/* Transaction History List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    Confirmed Transaction History ({selectedWallet.history.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Sent: {selectedWallet.totalSent} | Received: {selectedWallet.totalReceived}
                  </span>
                </div>

                {selectedWallet.history.length === 0 ? (
                  <div className="rounded-xl bg-black/30 p-6 text-center text-xs text-slate-500 border border-white/5">
                    No confirmed transactions recorded for this wallet yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedWallet.history.map((item, idx) => (
                      <article
                        key={`${item.txId}-${idx}`}
                        className="rounded-xl bg-black/40 p-4 border border-white/5 transition-all hover:border-white/15"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {item.type === "RECEIVED" ? (
                              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                                RECEIVED (+{item.amount})
                              </span>
                            ) : (
                              <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/30">
                                SENT (-{item.amount})
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-slate-400" title={item.txId}>
                              ID: {shortenId(item.txId)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.txId)}
                              className="text-[10px] text-slate-400 hover:text-white"
                            >
                              {copiedText === item.txId ? "Copied" : "Copy ID"}
                            </button>
                          </div>

                          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-white/5">
                            Block #{item.blockIndex}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="text-slate-200">
                            <span className="font-semibold text-white">{item.sender}</span>
                            <span className="mx-2 text-slate-500">→</span>
                            <span className="font-semibold text-white">{item.receiver}</span>
                          </div>
                          <span className="text-slate-500">{formatTime(item.timestamp)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-slate-400">
              Select a wallet from the list to inspect details.
            </div>
          )}
        </section>
      </div>

      {/* 10. Educational Explanation Section */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-cyan-300">
              How Blockchain Balances Work
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300 md:text-sm">
              A blockchain does not need a traditional balance database. A simplified model calculates a wallet's balance by iterating through all confirmed transactions in the ledger:
              <br />
              <span className="font-semibold text-white">Money received</span> minus <span className="font-semibold text-white">Money sent</span> equals <span className="font-semibold text-cyan-300">Current balance</span>.
            </p>
          </div>

          {/* Visual Flow Diagram */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/30 px-4 py-3 border border-white/5 text-center text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">1</span>
              <span className="text-xs font-medium text-slate-200">Confirmed Transactions</span>
            </div>
            <span className="hidden text-slate-500 sm:inline">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-300">2</span>
              <span className="text-xs font-medium text-purple-200">Identify Wallet</span>
            </div>
            <span className="hidden text-slate-500 sm:inline">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-300">3</span>
              <span className="text-xs font-medium text-emerald-200">Add Received</span>
            </div>
            <span className="hidden text-slate-500 sm:inline">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-xs font-bold text-rose-300">4</span>
              <span className="text-xs font-medium text-rose-200">Subtract Sent</span>
            </div>
            <span className="hidden text-slate-500 sm:inline">→</span>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/20 text-xs font-bold text-cyan-300">5</span>
              <span className="text-xs font-bold text-cyan-300">Current Balance</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
