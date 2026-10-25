import { NextResponse } from "next/server";
import { countConfirmedTransactions, getBlockchain } from "@/lib/blockchainStore";

export async function GET() {
  try {
    const blockchain = getBlockchain();

    return NextResponse.json({
      chain: blockchain.chain,
      pendingTransactions: blockchain.pendingTransactions,
      totalBlocks: blockchain.chain.length,
      totalTransactions: countConfirmedTransactions(blockchain),
      pendingCount: blockchain.pendingTransactions.length,
      difficulty: blockchain.difficulty,
      isValid: blockchain.isChainValid(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch explorer state.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
