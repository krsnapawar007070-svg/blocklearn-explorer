"use client";

import { useEffect, useState } from "react";
import { ChainStatusBanner } from "@/components/ChainStatusBanner";
import { StatCard } from "@/components/StatCard";
import {
  IconActivity,
  IconCheck,
  IconClock,
  IconClose,
  IconCopy,
  IconCpu,
  IconHash,
  IconInbox,
  IconLayers,
  IconLink,
  IconSearch,
  IconShieldCheck,
  IconShieldX,
} from "@/components/icons";
import type { Block } from "@blockchain/Block";
import type { Transaction } from "@blockchain/Transaction";

type ExplorerState = {
  chain: Block[];
  pendingTransactions: Transaction[];
  totalBlocks: number;
  totalTransactions: number;
  pendingCount: number;
  difficulty: number;
  isValid: boolean;
};

export default function ExplorerPage() {
  const [data, setData] = useState<ExplorerState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selection states for modals/panels
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTxInfo, setSelectedTxInfo] = useState<{
    tx: Transaction;
    blockIndex: number;
  } | null>(null);

  // Copy feedback state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchExplorerData = async () => {
    try {
      const res = await fetch("/api/explorer");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load explorer data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorerData();
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

  const shortenHash = (hash: string) => {
    if (!hash || hash.length <= 16) return hash;
    return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  // Filter blocks and transactions based on search query
  const query = searchQuery.trim().toLowerCase();

  const filteredBlocks = (data?.chain || []).filter((block) => {
    if (!query) return true;

    // Search by index
    if (String(block.index) === query) return true;

    // Search by block hash
    if (block.hash.toLowerCase().includes(query)) return true;

    // Search by previous hash
    if (block.previousHash.toLowerCase().includes(query)) return true;

    // Search inside transactions of this block
    const matchesTransaction = block.transactions.some((tx) =>
      tx.id.toLowerCase().includes(query) ||
      tx.sender.toLowerCase().includes(query) ||
      tx.receiver.toLowerCase().includes(query)
    );

    return matchesTransaction;
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* 2. Explorer Statistics Header */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Blocks"
          value={loading ? "..." : String(data?.totalBlocks || 0)}
          hint="Chain height including genesis"
          icon={<IconLayers className="h-4 w-4" />}
        />
        <StatCard
          label="Total Transactions"
          value={loading ? "..." : String(data?.totalTransactions || 0)}
          hint="Confirmed in blocks"
          icon={<IconActivity className="h-4 w-4" />}
        />
        <StatCard
          label="Pending Pool"
          value={loading ? "..." : String(data?.pendingCount || 0)}
          hint="Mempool transfers"
          icon={<IconInbox className="h-4 w-4" />}
        />
        <StatCard
          label="Mining Difficulty"
          value={loading ? "..." : String(data?.difficulty || 4)}
          hint="Leading zeros required"
          icon={<IconCpu className="h-4 w-4" />}
        />
        <StatCard
          label="Chain Integrity"
          value={loading ? "..." : data?.isValid ? "Valid" : "Invalid"}
          hint="from isChainValid()"
          tone={data?.isValid ? "success" : "danger"}
          icon={
            data?.isValid ? (
              <IconShieldCheck className="h-4 w-4" />
            ) : (
              <IconShieldX className="h-4 w-4" />
            )
          }
        />
      </section>

      {/* 8. Prominent Chain Integrity Status */}
      {data && <ChainStatusBanner valid={data.isValid} />}

      {/* 3. Search Bar */}
      <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-4 shadow-xl">
        <div className="relative flex items-center">
          <IconSearch className="absolute left-4 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search block index, block hash, transaction ID, sender, or receiver..."
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

      {/* 9. Educational Connection Section */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-cyan-300">
              How blocks are connected
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300 md:text-sm">
              Every block stores the cryptographic SHA-256 hash of the previous block in its <span className="font-mono text-cyan-200">previousHash</span> field.
              If any block data is modified, its hash changes immediately. The next block will still contain the old hash link, breaking the chain continuity and causing <span className="font-mono text-rose-300">isChainValid()</span> to fail.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-black/40 px-4 py-3 border border-white/5 text-center text-xs">
            <span className="rounded bg-cyan-900/40 px-2.5 py-1 font-mono font-semibold text-cyan-300 border border-cyan-400/20">
              Block #1 Hash
            </span>
            <span className="text-slate-500">→ stored as →</span>
            <span className="rounded bg-purple-900/40 px-2.5 py-1 font-mono font-semibold text-purple-300 border border-purple-400/20">
              Block #2 previousHash
            </span>
          </div>
        </div>
      </section>

      {/* 4. Vertical Blockchain Visualization */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Live Blockchain Feed</h2>
            <p className="text-xs text-slate-400">
              Click any block or transaction to open its complete detail inspector
            </p>
          </div>
          {query && (
            <span className="text-xs text-cyan-400">
              Showing {filteredBlocks.length} matching {filteredBlocks.length === 1 ? "block" : "blocks"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-sm text-slate-400">
            Loading blockchain state...
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[var(--card)] p-8 text-center text-slate-400">
            <p className="text-base font-semibold text-white">No matching blocks or transactions found.</p>
            <p className="mt-1 text-xs text-slate-500">Try searching for a block index like "0", "1", or a participant name like "Alice".</p>
          </div>
        ) : (
          <div className="flex flex-col items-stretch gap-6">
            {filteredBlocks.map((block, index) => {
              const isGenesis = block.index === 0;

              return (
                <div key={`${block.index}-${block.hash}`} className="flex flex-col items-center">
                  {/* Connecting Arrow between blocks */}
                  {index > 0 && (
                    <div className="my-2 flex flex-col items-center gap-1">
                      <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-400/80 to-cyan-500/20" />
                      <div className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300 ring-1 ring-cyan-400/20">
                        previousHash ↓
                      </div>
                      <div className="h-6 w-0.5 bg-gradient-to-b from-cyan-500/20 to-cyan-400/80" />
                    </div>
                  )}

                  {/* Block Card Container */}
                  <div className="w-full">
                    <article
                      onClick={() => setSelectedBlock(block)}
                      className={`group cursor-pointer rounded-2xl border transition-all duration-200 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/5 ${
                        isGenesis
                          ? "border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-[var(--card)] to-[var(--card)]"
                          : "border-white/10 bg-[var(--card)]"
                      } p-5 md:p-6`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {isGenesis ? (
                            <span className="rounded-xl bg-amber-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
                              GENESIS BLOCK
                            </span>
                          ) : (
                            <span className="rounded-xl bg-cyan-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-400/30">
                              BLOCK #{block.index}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatTime(block.timestamp)}
                          </span>
                        </div>

                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
                          {block.transactions.length}{" "}
                          {block.transactions.length === 1 ? "transaction" : "transactions"}
                        </span>
                      </div>

                      {/* Block Data Grid */}
                      <dl className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {/* Block Hash */}
                        <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5 sm:col-span-2 md:col-span-3">
                          <dt className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <IconHash className="h-3.5 w-3.5 text-cyan-400" />
                              Block Hash
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(block.hash);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400 hover:bg-white/10 hover:text-white"
                            >
                              {copiedText === block.hash ? (
                                <span className="text-emerald-400">Copied</span>
                              ) : (
                                <span>Copy Hash</span>
                              )}
                            </button>
                          </dt>
                          <dd className="mt-1 break-all font-mono text-xs text-cyan-300">
                            {block.hash}
                          </dd>
                        </div>

                        {/* Previous Hash */}
                        <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5 sm:col-span-2">
                          <dt className="flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <IconLink className="h-3.5 w-3.5 text-slate-400" />
                              Previous Hash
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(block.previousHash);
                              }}
                              className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400 hover:bg-white/10 hover:text-white"
                            >
                              {copiedText === block.previousHash ? (
                                <span className="text-emerald-400">Copied</span>
                              ) : (
                                <span>Copy</span>
                              )}
                            </button>
                          </dt>
                          <dd className="mt-1 break-all font-mono text-xs text-slate-400">
                            {block.previousHash}
                          </dd>
                        </div>

                        {/* Nonce */}
                        <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">
                          <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                            <IconCpu className="h-3.5 w-3.5 text-purple-400" />
                            Nonce (PoW)
                          </dt>
                          <dd className="mt-1 font-mono text-sm font-semibold text-white">
                            {block.nonce}
                          </dd>
                        </div>
                      </dl>

                      {/* Included Transactions Preview */}
                      {block.transactions.length > 0 && (
                        <div className="mt-4 border-t border-white/5 pt-4">
                          <p className="text-xs font-semibold text-slate-300">
                            Transactions ({block.transactions.length}):
                          </p>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {block.transactions.map((tx) => (
                              <div
                                key={tx.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTxInfo({ tx, blockIndex: block.index });
                                }}
                                className="flex items-center justify-between rounded-xl bg-black/40 p-2.5 border border-white/5 transition-colors hover:border-cyan-400/40"
                              >
                                <div className="truncate text-xs text-slate-300">
                                  <span className="font-medium text-white">{tx.sender}</span>
                                  <span className="mx-1 text-slate-500">→</span>
                                  <span className="font-medium text-white">{tx.receiver}</span>
                                </div>
                                <span className="text-xs font-semibold text-cyan-300">
                                  {tx.amount} coins
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Block Details Modal / Panel */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[var(--panel)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                  Block Inspector
                </p>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {selectedBlock.index === 0 ? "GENESIS BLOCK (#0)" : `Block #${selectedBlock.index}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBlock(null)}
                className="rounded-xl bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            {/* Genesis explanation if block 0 */}
            {selectedBlock.index === 0 && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 text-xs text-amber-200">
                <span className="font-bold">GENESIS BLOCK:</span> The genesis block is the first block in the chain and does not reference another block (previousHash is "0").
              </div>
            )}

            {/* Block Header Stats */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                <p className="text-[11px] uppercase text-slate-400">Block Index</p>
                <p className="mt-1 font-semibold text-white">#{selectedBlock.index}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                <p className="text-[11px] uppercase text-slate-400">Timestamp</p>
                <p className="mt-1 text-xs text-slate-200">{formatTime(selectedBlock.timestamp)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                <p className="text-[11px] uppercase text-slate-400">Nonce (Proof of Work)</p>
                <p className="mt-1 font-mono text-sm font-semibold text-cyan-300">{selectedBlock.nonce}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                <p className="text-[11px] uppercase text-slate-400">Transactions Count</p>
                <p className="mt-1 font-semibold text-white">{selectedBlock.transactions.length}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase text-slate-400">Block Hash</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedBlock.hash)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    {copiedText === selectedBlock.hash ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-cyan-300">{selectedBlock.hash}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase text-slate-400">Previous Block Hash</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedBlock.previousHash)}
                    className="text-[10px] text-slate-400 hover:underline"
                  >
                    {copiedText === selectedBlock.previousHash ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-slate-400">{selectedBlock.previousHash}</p>
              </div>
            </div>

            {/* Block Transactions List */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-white">
                Block Transactions ({selectedBlock.transactions.length})
              </h4>
              {selectedBlock.transactions.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">No transactions sealed in this block.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-2.5">
                  {selectedBlock.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => {
                        setSelectedTxInfo({ tx, blockIndex: selectedBlock.index });
                      }}
                      className="cursor-pointer rounded-xl bg-black/40 p-3 border border-white/10 transition-colors hover:border-cyan-400/50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-slate-400" title={tx.id}>
                          ID: {shortenHash(tx.id)}
                        </span>
                        <span className="text-sm font-semibold text-cyan-300">{tx.amount} coins</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-200">
                        <span>
                          <strong className="text-white">{tx.sender}</strong> → <strong className="text-white">{tx.receiver}</strong>
                        </span>
                        <span className="text-[11px] text-slate-500">{formatTime(tx.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. Transaction Inspector Modal */}
      {selectedTxInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[var(--panel)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                  Transaction Detail
                </p>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedTxInfo.tx.sender} → {selectedTxInfo.tx.receiver}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxInfo(null)}
                className="rounded-xl bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase text-slate-400">Transaction ID</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTxInfo.tx.id)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    {copiedText === selectedTxInfo.tx.id ? "Copied!" : "Copy ID"}
                  </button>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-cyan-300">{selectedTxInfo.tx.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <p className="text-[11px] uppercase text-slate-400">Sender</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedTxInfo.tx.sender}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <p className="text-[11px] uppercase text-slate-400">Receiver</p>
                  <p className="mt-1 text-sm font-medium text-white">{selectedTxInfo.tx.receiver}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <p className="text-[11px] uppercase text-slate-400">Amount Sent</p>
                  <p className="mt-1 text-base font-semibold text-cyan-300">{selectedTxInfo.tx.amount} coins</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                  <p className="text-[11px] uppercase text-slate-400">Sealed In</p>
                  <p className="mt-1 text-sm font-semibold text-white">Block #{selectedTxInfo.blockIndex}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
                <p className="text-[11px] uppercase text-slate-400">Timestamp</p>
                <p className="mt-1 text-xs text-slate-200">{formatTime(selectedTxInfo.tx.timestamp)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
