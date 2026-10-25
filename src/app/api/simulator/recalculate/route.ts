import { NextResponse } from "next/server";
import {
  analyzeChainIntegrity,
  getBlockchain,
} from "@/lib/blockchainStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blockIndex } = body;

    if (blockIndex === undefined || blockIndex === 0) {
      return NextResponse.json(
        { error: "Cannot recalculate genesis block hash." },
        { status: 400 }
      );
    }

    const blockchain = getBlockchain();
    const targetBlock = blockchain.chain.find((b) => b.index === blockIndex);
    if (!targetBlock) {
      return NextResponse.json(
        { error: `Block #${blockIndex} not found.` },
        { status: 404 }
      );
    }

    // Educational action: Recalculate stored block hash
    targetBlock.hash = targetBlock.calculateHash();

    const isValid = blockchain.isChainValid();
    const analysis = analyzeChainIntegrity(blockchain);

    return NextResponse.json({
      success: true,
      chain: blockchain.chain,
      isValid,
      analysis,
      message: `Block #${blockIndex} hash recalculated to ${targetBlock.hash.slice(0, 10)}... However, subsequent blocks still reference the old hash!`,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Recalculate action failed.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
