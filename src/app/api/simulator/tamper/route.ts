import { NextResponse } from "next/server";
import {
  analyzeChainIntegrity,
  getBlockchain,
  saveSnapshotIfNeeded,
} from "@/lib/blockchainStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blockIndex, txIndex, newAmount } = body;

    if (blockIndex === undefined || blockIndex === 0) {
      return NextResponse.json(
        { error: "Genesis block (#0) cannot be tampered with." },
        { status: 400 }
      );
    }

    const parsedAmount = Number(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a number greater than 0." },
        { status: 400 }
      );
    }

    const blockchain = getBlockchain();
    saveSnapshotIfNeeded();

    const targetBlock = blockchain.chain.find((b) => b.index === blockIndex);
    if (!targetBlock) {
      return NextResponse.json(
        { error: `Block #${blockIndex} not found.` },
        { status: 404 }
      );
    }

    if (!targetBlock.transactions || !targetBlock.transactions[txIndex]) {
      return NextResponse.json(
        { error: `Transaction index ${txIndex} not found in Block #${blockIndex}.` },
        { status: 404 }
      );
    }

    // Modify transaction amount inside block without updating block hash or mining
    targetBlock.transactions[txIndex].amount = parsedAmount;

    const isValid = blockchain.isChainValid();
    const analysis = analyzeChainIntegrity(blockchain);

    return NextResponse.json({
      success: true,
      chain: blockchain.chain,
      isValid,
      analysis,
      message: `Transaction amount altered to ${parsedAmount}. Chain validity: ${isValid ? "Valid" : "Invalid"}.`,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Tamper action failed.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
