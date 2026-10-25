import { NextResponse } from "next/server";
import {
  analyzeChainIntegrity,
  getBlockchain,
  restoreSnapshot,
} from "@/lib/blockchainStore";

export async function POST() {
  try {
    const restored = restoreSnapshot();
    const blockchain = getBlockchain();
    const isValid = blockchain.isChainValid();
    const analysis = analyzeChainIntegrity(blockchain);

    if (!restored) {
      return NextResponse.json(
        { error: "No original snapshot available to restore." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      chain: blockchain.chain,
      isValid,
      analysis,
      message: "✓ Blockchain restored successfully to original state.",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Restore action failed.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
