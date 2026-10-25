import { NextResponse } from "next/server";
import { getBlockchain } from "@/lib/blockchainStore";

export async function GET() {
  try {
    const blockchain = getBlockchain();
    const latestBlock = blockchain.getLatestBlock();

    return NextResponse.json({
      pendingTransactions: blockchain.pendingTransactions,
      totalBlocks: blockchain.chain.length,
      difficulty: blockchain.difficulty,
      latestBlock,
      chain: blockchain.chain,
      isValid: blockchain.isChainValid(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch mining state.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST() {
  try {
    const blockchain = getBlockchain();

    if (blockchain.pendingTransactions.length === 0) {
      return NextResponse.json(
        { error: "No pending transactions available in the mempool to mine." },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Call real Proof-of-Work mining on the existing Blockchain engine
    const minedBlock = blockchain.minePendingTransactions();
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      minedBlock,
      durationMs,
      pendingTransactions: blockchain.pendingTransactions,
      totalBlocks: blockchain.chain.length,
      difficulty: blockchain.difficulty,
      latestBlock: blockchain.getLatestBlock(),
      chain: blockchain.chain,
      isValid: blockchain.isChainValid(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to mine block.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
