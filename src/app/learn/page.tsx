"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/StatCard";
import {
  IconActivity,
  IconArrowLeftRight,
  IconBlocks,
  IconCheck,
  IconClose,
  IconCpu,
  IconFlask,
  IconGraduation,
  IconHash,
  IconInbox,
  IconLayers,
  IconLink,
  IconPickaxe,
  IconSearch,
  IconShieldCheck,
  IconWallet,
} from "@/components/icons";

type GlossaryItem = {
  term: string;
  definition: string;
};

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: "Block",
    definition: "A container or page in the blockchain notebook that stores a set of confirmed transactions, a timestamp, a nonce, and cryptographic hashes.",
  },
  {
    term: "Blockchain",
    definition: "A growing list of records (blocks) that are securely linked together using SHA-256 cryptographic hashes into an immutable ledger.",
  },
  {
    term: "Hash",
    definition: "A unique 64-character hexadecimal fingerprint generated from data using a mathematical hashing algorithm like SHA-256.",
  },
  {
    term: "SHA-256",
    definition: "Secure Hash Algorithm 256-bit. A cryptographic hash function that produces a unique 256-bit (64 hex characters) output for any given input.",
  },
  {
    term: "Nonce",
    definition: "Number used once. A number miners increment during Proof-of-Work mining to search for a block hash that meets network difficulty rules.",
  },
  {
    term: "Mining",
    definition: "The computational process of verifying pending transactions, solving a Proof-of-Work puzzle, and sealing new blocks onto the blockchain.",
  },
  {
    term: "Proof of Work",
    definition: "A consensus protocol requiring miners to perform computational work (guessing nonces) to prove a block is valid before adding it to the chain.",
  },
  {
    term: "Mempool",
    definition: "Short for memory pool. The temporary staging area where newly created transactions wait until a miner packs them into a block.",
  },
  {
    term: "Transaction",
    definition: "A record of value moving from a sender address to a receiver address, secured by a unique SHA-256 transaction ID.",
  },
  {
    term: "Wallet",
    definition: "An educational identifier representing a user's address and transaction history, whose balance is derived by subtracting sent funds from received funds.",
  },
  {
    term: "Genesis Block",
    definition: "The very first block in a blockchain (Block #0). It has no previous block to link to, so its previousHash is set to '0'.",
  },
  {
    term: "Previous Hash",
    definition: "The hash pointer stored inside a block header referencing the exact SHA-256 hash of the block preceding it in history.",
  },
  {
    term: "Consensus",
    definition: "The mechanism by which distributed nodes on a blockchain network agree on the true, un-tampered state of the blockchain ledger.",
  },
];

export default function LearnPage() {
  // Module selection & progress
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [completedModuleIds, setCompletedModuleIds] = useState<number[]>([]);
  const [glossaryQuery, setGlossaryQuery] = useState<string>("");

  // Live Hashing Demo State
  const [hashInput, setHashInput] = useState<string>("Hello Blockchain");
  const [hashResult, setHashResult] = useState<string>("");
  const [hashLoading, setHashLoading] = useState<boolean>(false);

  // Live mempool stats for Module 6
  const [mempoolCount, setMempoolCount] = useState<number>(0);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("blocklearn_completed_modules");
      if (saved) {
        setCompletedModuleIds(JSON.parse(saved));
      }
    } catch {
      // Fallback if localStorage unavailable
    }

    // Fetch mempool count for educational module
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.pendingTransactions) {
          setMempoolCount(data.pendingTransactions.length);
        }
      })
      .catch(() => {});
  }, []);

  // Compute live hash via server API when hashInput changes
  useEffect(() => {
    const computeHash = async () => {
      setHashLoading(true);
      try {
        const res = await fetch("/api/learn/hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: hashInput }),
        });
        if (res.ok) {
          const json = await res.json();
          setHashResult(json.hash);
        }
      } catch (err) {
        console.error("Failed to compute hash", err);
      } finally {
        setHashLoading(false);
      }
    };

    const timer = setTimeout(computeHash, 150);
    return () => clearTimeout(timer);
  }, [hashInput]);

  const toggleModuleComplete = (id: number) => {
    let updated: number[];
    if (completedModuleIds.includes(id)) {
      updated = completedModuleIds.filter((mId) => mId !== id);
    } else {
      updated = [...completedModuleIds, id];
    }
    setCompletedModuleIds(updated);
    try {
      localStorage.setItem("blocklearn_completed_modules", JSON.stringify(updated));
    } catch {
      // Fallback
    }
  };

  const modules = [
    {
      id: 1,
      title: "1. What is Blockchain?",
      difficulty: "Beginner",
      icon: IconBlocks,
      shortDescription: "Understand the core concept of a distributed chain of linked blocks.",
      ctaLink: "/explorer",
      ctaText: "Explore Blocks",
    },
    {
      id: 2,
      title: "2. Transactions",
      difficulty: "Beginner",
      icon: IconArrowLeftRight,
      shortDescription: "Learn how value transfers are created, structured, and identified.",
      ctaLink: "/transactions",
      ctaText: "Create a Transaction",
    },
    {
      id: 3,
      title: "3. Blocks",
      difficulty: "Beginner",
      icon: IconLayers,
      shortDescription: "Discover what data fields live inside a block header and body.",
      ctaLink: "/explorer",
      ctaText: "Inspect Block Header",
    },
    {
      id: 4,
      title: "4. Hashing",
      difficulty: "Beginner",
      icon: IconHash,
      shortDescription: "Test SHA-256 cryptographic fingerprinting with an interactive calculator.",
      ctaLink: "/explorer",
      ctaText: "Inspect Hashes",
    },
    {
      id: 5,
      title: "5. Previous Hash",
      difficulty: "Intermediate",
      icon: IconLink,
      shortDescription: "Explore how blocks link together cryptographically via previousHash pointers.",
      ctaLink: "/explorer",
      ctaText: "View Block Pointers",
    },
    {
      id: 6,
      title: "6. Mempool",
      difficulty: "Beginner",
      icon: IconInbox,
      shortDescription: "Learn about the temporary staging pool where pending transfers wait.",
      ctaLink: "/transactions",
      ctaText: "Go to Mempool",
    },
    {
      id: 7,
      title: "7. Mining",
      difficulty: "Intermediate",
      icon: IconPickaxe,
      shortDescription: "See how miners pack pending transactions and solve block puzzles.",
      ctaLink: "/mining",
      ctaText: "Try Mining Simulator",
    },
    {
      id: 8,
      title: "8. Proof of Work",
      difficulty: "Intermediate",
      icon: IconCpu,
      shortDescription: "Understand the nonce searching loop and difficulty zero-prefix rule.",
      ctaLink: "/mining",
      ctaText: "Start Mining",
    },
    {
      id: 9,
      title: "9. Blockchain Immutability",
      difficulty: "Intermediate",
      icon: IconShieldCheck,
      shortDescription: "Demonstrate why modifying past block data breaks chain validity.",
      ctaLink: "/simulator",
      ctaText: "Try Tampering Simulator",
    },
    {
      id: 10,
      title: "10. Wallets & Balances",
      difficulty: "Beginner",
      icon: IconWallet,
      shortDescription: "Learn how balances are calculated from confirmed transactions history.",
      ctaLink: "/wallet",
      ctaText: "Inspect Wallets",
    },
  ];

  const activeModule = modules.find((m) => m.id === activeModuleId) || modules[0];
  const isCompleted = completedModuleIds.includes(activeModule.id);

  const filteredGlossary = GLOSSARY_ITEMS.filter((item) => {
    const q = glossaryQuery.trim().toLowerCase();
    if (!q) return true;
    return item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      {/* 1. Header & Progress Indicator */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <IconGraduation className="h-6 w-6 text-cyan-400" />
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Blockchain Learning Center
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Understand how BlockLearn works through interactive explanations.
        </p>
      </div>

      {/* Progress Bar Card */}
      <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">Learning Progress</h2>
            <p className="text-xs text-slate-400">
              Track your module completion in this session
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-cyan-300">
              {completedModuleIds.length} / {modules.length} completed
            </span>
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-400/20">
              {Math.round((completedModuleIds.length / modules.length) * 100)}%
            </span>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
            style={{
              width: `${(completedModuleIds.length / modules.length) * 100}%`,
            }}
          />
        </div>
      </section>

      {/* 2. Learning Modules Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {modules.map((m) => {
          const Icon = m.icon;
          const done = completedModuleIds.includes(m.id);
          const active = m.id === activeModuleId;

          return (
            <div
              key={m.id}
              onClick={() => setActiveModuleId(m.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between gap-3 ${
                active
                  ? "border-cyan-400/60 bg-cyan-950/30 ring-1 ring-cyan-400/40"
                  : done
                  ? "border-emerald-500/30 bg-emerald-950/10"
                  : "border-white/10 bg-[var(--card)] hover:border-white/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-cyan-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  {done ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      ✓ Done
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                      {m.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{m.title}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{m.shortDescription}</p>
              </div>

              <button
                type="button"
                className={`w-full rounded-xl py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {active ? "Viewing Topic" : "Explore →"}
              </button>
            </div>
          );
        })}
      </section>

      {/* Active Module Interactive Content Inspector */}
      <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30">
              {activeModule.id}
            </span>
            <div>
              <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                Module {activeModule.id} of 10 ({activeModule.difficulty})
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                {activeModule.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleModuleComplete(activeModule.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isCompleted
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
              }`}
            >
              <IconCheck className="h-4 w-4" />
              <span>{isCompleted ? "Mark Incomplete" : "Mark Complete"}</span>
            </button>

            <Link
              href={activeModule.ctaLink}
              className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-all hover:bg-cyan-300"
            >
              <span>{activeModule.ctaText}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Topic Content */}
        {activeModule.id === 1 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              A blockchain is a chain of blocks where each block contains data and a reference to the previous block.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-black/40 p-6 border border-white/5 text-center">
              <div className="rounded-xl bg-amber-950/30 p-4 border border-amber-400/30">
                <p className="text-xs font-bold text-amber-300">Block 0 (Genesis)</p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">previousHash: "0"</p>
              </div>
              <span className="text-cyan-400 text-lg">→</span>
              <div className="rounded-xl bg-slate-900 p-4 border border-white/10">
                <p className="text-xs font-bold text-white">Block 1</p>
                <p className="mt-1 font-mono text-[11px] text-cyan-300">hash link ↑</p>
              </div>
              <span className="text-cyan-400 text-lg">→</span>
              <div className="rounded-xl bg-slate-900 p-4 border border-white/10">
                <p className="text-xs font-bold text-white">Block 2</p>
                <p className="mt-1 font-mono text-[11px] text-cyan-300">hash link ↑</p>
              </div>
              <span className="text-cyan-400 text-lg">→</span>
              <div className="rounded-xl bg-slate-900 p-4 border border-white/10">
                <p className="text-xs font-bold text-white">Block 3</p>
                <p className="mt-1 font-mono text-[11px] text-cyan-300">hash link ↑</p>
              </div>
            </div>

            <p>
              Every block calculates a unique cryptographic hash fingerprint. By storing the previous block's hash inside the current block, all blocks form an unbroken, append-only security chain.
            </p>
          </div>
        )}

        {activeModule.id === 2 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              A transaction represents a transfer of value from one participant to another.
            </p>

            <div className="flex items-center justify-center gap-4 rounded-2xl bg-black/40 p-6 border border-white/5 text-center">
              <div className="rounded-xl bg-cyan-950/40 px-5 py-3 border border-cyan-400/30 text-white font-bold">
                Alice (Sender)
              </div>
              <div className="flex flex-col items-center text-cyan-300 font-semibold text-xs">
                <span>↓</span>
                <span>50 coins</span>
                <span>↓</span>
              </div>
              <div className="rounded-xl bg-cyan-950/40 px-5 py-3 border border-cyan-400/30 text-white font-bold">
                Bob (Receiver)
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-xl bg-slate-900 p-3 border border-white/5">
                <span className="text-xs text-slate-400 uppercase">Sender</span>
                <p className="mt-1 text-sm font-semibold text-white">Who is sending funds</p>
              </div>
              <div className="rounded-xl bg-slate-900 p-3 border border-white/5">
                <span className="text-xs text-slate-400 uppercase">Receiver</span>
                <p className="mt-1 text-sm font-semibold text-white">Who is receiving funds</p>
              </div>
              <div className="rounded-xl bg-slate-900 p-3 border border-white/5">
                <span className="text-xs text-slate-400 uppercase">Amount</span>
                <p className="mt-1 text-sm font-semibold text-cyan-300">Value of coins transferred</p>
              </div>
              <div className="rounded-xl bg-slate-900 p-3 border border-white/5">
                <span className="text-xs text-slate-400 uppercase">Timestamp</span>
                <p className="mt-1 text-sm font-semibold text-white">Creation time in ms</p>
              </div>
              <div className="rounded-xl bg-slate-900 p-3 border border-white/5 sm:col-span-2">
                <span className="text-xs text-slate-400 uppercase">Transaction ID</span>
                <p className="mt-1 font-mono text-xs text-cyan-300">SHA-256 hash of sender+receiver+amount+time</p>
              </div>
            </div>

            <p className="rounded-xl bg-amber-400/10 p-3.5 border border-amber-400/20 text-xs text-amber-200">
              Note: Transactions first enter the temporary mempool before miners confirm and seal them into a block.
            </p>
          </div>
        )}

        {activeModule.id === 3 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              A block acts as a cryptographically sealed page in the blockchain notebook. It stores key header metadata along with confirmed transactions.
            </p>

            <div className="rounded-2xl bg-black/40 p-5 border border-white/10">
              <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Block Anatomy Example</h4>
              <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 md:grid-cols-3">
                <div className="rounded-xl bg-slate-900 p-3 border border-white/5">
                  <span className="text-slate-400">Index:</span> <strong className="text-white">#1</strong>
                </div>
                <div className="rounded-xl bg-slate-900 p-3 border border-white/5">
                  <span className="text-slate-400">Timestamp:</span> <strong className="text-white">1790527575662</strong>
                </div>
                <div className="rounded-xl bg-slate-900 p-3 border border-white/5">
                  <span className="text-slate-400">Nonce:</span> <strong className="text-cyan-300">189</strong>
                </div>
                <div className="rounded-xl bg-slate-900 p-3 border border-white/5 sm:col-span-3">
                  <span className="text-slate-400">Block Hash:</span> <code className="text-cyan-300">001242ce212ebf7965b...</code>
                </div>
                <div className="rounded-xl bg-slate-900 p-3 border border-white/5 sm:col-span-3">
                  <span className="text-slate-400">Previous Hash:</span> <code className="text-slate-400">0048cd708ab6feac04b...</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeModule.id === 4 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              A hash is a 64-character fingerprint generated from data using SHA-256. Small changes to the input produce a completely different hash output.
            </p>

            {/* 6. Interactive Hashing Demonstration */}
            <div className="rounded-2xl border border-cyan-400/30 bg-black/40 p-5 flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-cyan-300">Interactive SHA-256 Calculator</h4>

              <div>
                <label htmlFor="hash-input" className="mb-1 block text-xs font-medium uppercase text-slate-300">
                  Input Text:
                </label>
                <input
                  id="hash-input"
                  type="text"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Type any text..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-white/5">
                <span className="text-xs uppercase tracking-wider text-slate-400">Generated SHA-256 Hash Output (64 hex characters):</span>
                <p className="mt-1 break-all font-mono text-sm font-bold text-cyan-300">
                  {hashLoading ? "Calculating..." : hashResult || "..."}
                </p>
              </div>

              <p className="text-xs text-slate-400 italic">
                Notice: Type even one additional character (e.g. "Hello Blockchain!") to watch the entire 64-character hash mutate completely.
              </p>
            </div>
          </div>
        )}

        {activeModule.id === 5 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              Every block stores the exact SHA-256 hash of the block before it as its <span className="font-mono text-cyan-300">previousHash</span> pointer.
            </p>

            <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/40 p-6 border border-white/5">
              <div className="rounded-xl bg-slate-900 p-4 border border-cyan-400/30 w-full max-w-md">
                <p className="text-xs font-bold text-white">Block #1</p>
                <p className="mt-1 font-mono text-xs text-cyan-300">Hash: 0000abcd1234...</p>
              </div>
              <span className="text-slate-500 font-bold">↓ stored as ↓</span>
              <div className="rounded-xl bg-slate-900 p-4 border border-purple-400/30 w-full max-w-md">
                <p className="text-xs font-bold text-white">Block #2</p>
                <p className="mt-1 font-mono text-xs text-purple-300">Previous Hash: 0000abcd1234...</p>
              </div>
            </div>

            <p>
              If someone modifies data inside Block #1, its hash changes. Since Block #2 still holds the old hash pointer, the link breaks immediately!
            </p>
          </div>
        )}

        {activeModule.id === 6 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              The mempool (memory pool) is a temporary staging area for transactions that have been created but have not yet been included in a block.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/40 px-5 py-4 border border-white/5">
              <span className="text-xs font-medium text-slate-300">Current Mempool Queue Status:</span>
              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-400/20">
                {mempoolCount} pending transfers in pool
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-center text-xs">
              <span className="rounded-lg bg-cyan-900/40 px-3 py-2 text-cyan-300 border border-cyan-400/20">Create Tx</span>
              <span>→</span>
              <span className="rounded-lg bg-amber-900/40 px-3 py-2 text-amber-300 border border-amber-400/20">Mempool Pool</span>
              <span>→</span>
              <span className="rounded-lg bg-purple-900/40 px-3 py-2 text-purple-300 border border-purple-400/20">Mining</span>
              <span>→</span>
              <span className="rounded-lg bg-emerald-900/40 px-3 py-2 text-emerald-300 border border-emerald-400/20">Confirmed Block</span>
            </div>
          </div>
        )}

        {activeModule.id === 7 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              Mining is the process where miners verify pending mempool transfers, solve Proof-of-Work puzzles, and attach new blocks to the chain.
            </p>

            <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/40 p-6 border border-white/5 text-center text-xs">
              <div className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white">Block Data</div>
              <span>↓</span>
              <div className="rounded-lg bg-cyan-950 px-4 py-2 font-semibold text-cyan-300 border border-cyan-400/30">Nonce (0, 1, 2...)</div>
              <span>↓</span>
              <div className="rounded-lg bg-purple-950 px-4 py-2 font-semibold text-purple-300 border border-purple-400/30">SHA-256 Hashing</div>
              <span>↓</span>
              <div className="rounded-lg bg-amber-950 px-4 py-2 font-bold text-amber-300 border border-amber-400/30">Valid Hash? Starts with 0000?</div>
              <div className="mt-2 flex justify-center gap-12 text-xs">
                <span className="text-rose-400">No → Change nonce</span>
                <span className="text-emerald-400">Yes → Block mined!</span>
              </div>
            </div>
          </div>
        )}

        {activeModule.id === 8 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              The miner repeatedly changes the nonce until the block hash satisfies the difficulty requirement.
            </p>

            <div className="rounded-2xl bg-black/40 p-5 border border-cyan-400/30 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Network Difficulty Rule:</span>
                <span className="font-mono font-bold text-cyan-300">Difficulty = 4</span>
              </div>
              <div className="rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-emerald-300 border border-emerald-500/30">
                Valid Hash must start with four zeroes: "0000..."
              </div>
            </div>

            <p>
              Higher difficulty requires more leading zeroes, forcing miners to guess millions of nonce values, which secures the network through computational energy cost.
            </p>
          </div>
        )}

        {activeModule.id === 9 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              Blockchain immutability guarantees that once data is confirmed in a block, it cannot be altered without breaking the entire chain.
            </p>

            <div className="flex flex-col gap-3 rounded-2xl bg-black/40 p-5 border border-rose-500/30 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Original Block #1 Hash: <code className="text-cyan-300">ABC123</code></span>
                <span>Block #2 Previous Hash: <code className="text-cyan-300">ABC123</code></span>
              </div>
              <div className="h-0.5 bg-rose-500/40 my-1" />
              <div className="flex flex-col gap-1 text-rose-300">
                <span>Modify Block #1 transaction data</span>
                <span>↓ Hash changes to <code className="text-rose-400 font-bold">999XYZ</code></span>
                <span>↓ Block #2 still stores <code className="text-slate-400">ABC123</code></span>
                <span className="font-bold text-rose-400 mt-1">❌ Chain becomes invalid!</span>
              </div>
            </div>
          </div>
        )}

        {activeModule.id === 10 && (
          <div className="flex flex-col gap-5 text-sm leading-relaxed text-slate-300">
            <p>
              A blockchain calculates a wallet's balance by aggregating confirmed ledger transactions:
            </p>

            <div className="rounded-2xl bg-black/40 p-6 border border-white/5 text-center font-bold text-sm text-cyan-300">
              Money Received minus Money Sent equals Current Balance
            </div>

            <p>
              Pending transactions in the mempool are excluded until they are confirmed into a block by a miner.
            </p>
          </div>
        )}

        {/* Previous & Next Module Controls */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => setActiveModuleId(Math.max(1, activeModuleId - 1))}
            disabled={activeModuleId === 1}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-40"
          >
            <span>← Previous Topic</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            {activeModuleId} of {modules.length}
          </span>

          <button
            type="button"
            onClick={() => setActiveModuleId(Math.min(modules.length, activeModuleId + 1))}
            disabled={activeModuleId === modules.length}
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 disabled:opacity-40"
          >
            <span>Next Topic →</span>
          </button>
        </div>
      </section>

      {/* 15. Searchable Glossary Section */}
      <section className="rounded-2xl border border-white/10 bg-[var(--card)] p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Blockchain Glossary</h2>
            <p className="text-xs text-slate-400">Beginner-friendly definitions of core blockchain terms</p>
          </div>

          <div className="relative flex items-center w-full sm:w-72">
            <IconSearch className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={glossaryQuery}
              onChange={(e) => setGlossaryQuery(e.target.value)}
              placeholder="Filter terms (e.g. Nonce, Hash)..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 py-2 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredGlossary.length === 0 ? (
            <div className="col-span-full text-center text-xs text-slate-500 py-6">
              No matching glossary terms found.
            </div>
          ) : (
            filteredGlossary.map((g) => (
              <div key={g.term} className="rounded-xl bg-black/40 p-4 border border-white/5 flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-cyan-300">{g.term}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{g.definition}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 16. App Feature Navigation Shortcuts */}
      <section className="rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-cyan-950/20 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold text-cyan-300">Try BlockLearn Explorer Features Live</h2>
          <p className="text-xs text-slate-400">Put your knowledge to practice using the live engine:</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
          >
            <IconArrowLeftRight className="h-4 w-4 text-cyan-400" />
            <span>Create a Transaction →</span>
          </Link>
          <Link
            href="/mining"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
          >
            <IconPickaxe className="h-4 w-4 text-cyan-400" />
            <span>Start Mining →</span>
          </Link>
          <Link
            href="/explorer"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
          >
            <IconBlocks className="h-4 w-4 text-cyan-400" />
            <span>Explore Blocks →</span>
          </Link>
          <Link
            href="/simulator"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
          >
            <IconFlask className="h-4 w-4 text-cyan-400" />
            <span>Try Tampering →</span>
          </Link>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
          >
            <IconWallet className="h-4 w-4 text-cyan-400" />
            <span>Inspect Wallets →</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
