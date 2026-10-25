import { NextResponse } from "next/server";
import { getBlockchain } from "@/lib/blockchainStore";
import { createHash } from "crypto";

export type WalletHistoryItem = {
  type: "SENT" | "RECEIVED";
  txId: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: number;
  blockIndex: number;
};

export type WalletInfo = {
  name: string;
  address: string;
  balance: number;
  transactionCount: number;
  totalSent: number;
  totalReceived: number;
  history: WalletHistoryItem[];
};

function generateEducationalAddress(name: string): string {
  const hash = createHash("sha256").update(name).digest("hex").slice(0, 8).toUpperCase();
  return `EDU-${hash}-${name.toUpperCase()}`;
}

export async function GET() {
  try {
    const blockchain = getBlockchain();
    const walletMap = new Map<string, WalletInfo>();

    const getOrCreateWallet = (name: string): WalletInfo => {
      if (!walletMap.has(name)) {
        walletMap.set(name, {
          name,
          address: generateEducationalAddress(name),
          balance: 1000, // Base educational starting allocation
          transactionCount: 0,
          totalSent: 0,
          totalReceived: 0,
          history: [],
        });
      }
      return walletMap.get(name)!;
    };

    // Ensure common demo participants are pre-initialized
    getOrCreateWallet("Alice");
    getOrCreateWallet("Bob");
    getOrCreateWallet("Carol");

    // Process only confirmed transactions in the chain (ignoring pending mempool)
    for (const block of blockchain.chain) {
      for (const tx of block.transactions) {
        const sender = getOrCreateWallet(tx.sender);
        const receiver = getOrCreateWallet(tx.receiver);

        // Update sender state
        sender.balance -= tx.amount;
        sender.totalSent += tx.amount;
        sender.transactionCount += 1;
        sender.history.unshift({
          type: "SENT",
          txId: tx.id,
          sender: tx.sender,
          receiver: tx.receiver,
          amount: tx.amount,
          timestamp: tx.timestamp,
          blockIndex: block.index,
        });

        // Update receiver state
        receiver.balance += tx.amount;
        receiver.totalReceived += tx.amount;
        receiver.transactionCount += 1;
        receiver.history.unshift({
          type: "RECEIVED",
          txId: tx.id,
          sender: tx.sender,
          receiver: tx.receiver,
          amount: tx.amount,
          timestamp: tx.timestamp,
          blockIndex: block.index,
        });
      }
    }

    const wallets = Array.from(walletMap.values());

    return NextResponse.json({
      wallets,
      totalConfirmedBlocks: blockchain.chain.length,
      totalWalletsDetected: wallets.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch wallet state.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
