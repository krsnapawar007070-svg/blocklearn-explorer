/**
 * Server-side access to the shared BlockLearn chain.
 *
 * The React UI never mines or hashes by itself. It always asks this module
 * for the real Blockchain instance (the same classes used by the terminal demo).
 *
 * Stored on globalThis so Next.js hot reload does not create a second chain.
 */

import { Block } from "@blockchain/Block";
import { Blockchain } from "@blockchain/Blockchain";
import { Transaction } from "@blockchain/Transaction";

type GlobalChain = typeof globalThis & {
  blocklearnChain?: Blockchain;
};

function seedWithRealTransactions(chain: Blockchain): void {
  // These are real Transaction objects, then really mined into a block.
  // The dashboard reads counts from the chain — it does not hardcode stats.
  chain.addTransaction(new Transaction("Alice", "Bob", 50));
  chain.addTransaction(new Transaction("Bob", "Carol", 20));
  chain.minePendingTransactions();
}

function createChain(): Blockchain {
  // Difficulty 2 keeps the first page load reasonable in the browser.
  // Proof of Work is still real; it is just fewer leading zeros than the CLI demo.
  const chain = new Blockchain(2);
  seedWithRealTransactions(chain);
  return chain;
}

export function getBlockchain(): Blockchain {
  const globalStore = globalThis as GlobalChain;

  if (!globalStore.blocklearnChain) {
    globalStore.blocklearnChain = createChain();
  }

  return globalStore.blocklearnChain;
}

export function countConfirmedTransactions(chain: Blockchain): number {
  return chain.chain.reduce(
    (total, block) => total + block.transactions.length,
    0
  );
}

type GlobalSnapshot = typeof globalThis & {
  blocklearnChainSnapshot?: string;
};

export function saveSnapshotIfNeeded(): void {
  const globalStore = globalThis as GlobalSnapshot;
  if (!globalStore.blocklearnChainSnapshot) {
    const chain = getBlockchain();
    globalStore.blocklearnChainSnapshot = JSON.stringify(chain.chain);
  }
}

export function restoreSnapshot(): boolean {
  const globalStore = globalThis as GlobalSnapshot;
  const blockchain = getBlockchain();

  if (!globalStore.blocklearnChainSnapshot) {
    return false;
  }

  try {
    const parsedBlocks = JSON.parse(globalStore.blocklearnChainSnapshot);
    const restoredChain = parsedBlocks.map((b: any) => {
      const txs = b.transactions.map((t: any) => {
        const tx = new Transaction(t.sender, t.receiver, t.amount);
        // Preserve exact timestamp & id
        (tx as any).timestamp = t.timestamp;
        (tx as any).id = t.id;
        return tx;
      });
      const block = new Block(b.index, b.timestamp, txs, b.previousHash);
      block.nonce = b.nonce;
      block.hash = b.hash;
      return block;
    });

    blockchain.chain = restoredChain;
    return true;
  } catch (err) {
    console.error("Failed to restore chain snapshot", err);
    return false;
  }
}

export type BlockAnalysis = {
  index: number;
  storedHash: string;
  calculatedHash: string;
  hashMatch: boolean;
  previousHash: string;
  expectedPreviousHash: string | null;
  previousHashMatch: boolean;
  status: "valid" | "tampered" | "broken_link";
  explanation: string;
};

export function analyzeChainIntegrity(chain: Blockchain): BlockAnalysis[] {
  return chain.chain.map((block, i) => {
    const calculatedHash = block.calculateHash();
    const hashMatch = block.hash === calculatedHash;
    const expectedPreviousHash = i > 0 ? chain.chain[i - 1].hash : null;
    const previousHashMatch = i === 0 ? block.previousHash === "0" : block.previousHash === expectedPreviousHash;

    let status: "valid" | "tampered" | "broken_link" = "valid";
    let explanation = "Block data and hash link are valid.";

    if (!hashMatch) {
      status = "tampered";
      explanation = `Block #${block.index} transaction data was modified. Calculated hash (${calculatedHash.slice(0, 10)}...) does not match stored hash (${block.hash.slice(0, 10)}...).`;
    } else if (!previousHashMatch) {
      status = "broken_link";
      explanation = `Block #${block.index} stores previousHash (${block.previousHash.slice(0, 10)}...), but Block #${i - 1}'s hash is now (${expectedPreviousHash?.slice(0, 10)}...). Link is broken.`;
    }

    return {
      index: block.index,
      storedHash: block.hash,
      calculatedHash,
      hashMatch,
      previousHash: block.previousHash,
      expectedPreviousHash,
      previousHashMatch,
      status,
      explanation,
    };
  });
}
