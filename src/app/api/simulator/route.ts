import { NextResponse } from "next/server";
import {
  analyzeChainIntegrity,
  getBlockchain,
  saveSnapshotIfNeeded,
} from "@/lib/blockchainStore";

export async function GET() {
  try {
    const blockchain = getBlockchain();
    saveSnapshotIfNeeded();

    return NextResponse.json({
      chain: blockchain.chain,
      isValid: blockchain.isChainValid(),
      analysis: analyzeChainIntegrity(blockchain),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch simulator state.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
