import { NextResponse } from "next/server";
import { countConfirmedTransactions, getBlockchain } from "@/lib/blockchainStore";
import { Transaction } from "@blockchain/Transaction";

export async function GET() {
  try {
    const blockchain = getBlockchain();
    const pendingTransactions = blockchain.pendingTransactions;
    const totalConfirmed = countConfirmedTransactions(blockchain);
    const totalBlocks = blockchain.chain.length;

    return NextResponse.json({
      pendingTransactions,
      totalConfirmed,
      totalBlocks,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch transactions state.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender, receiver, amount } = body;

    if (!sender || typeof sender !== "string" || sender.trim().length === 0) {
      return NextResponse.json(
        { error: "Sender address or name cannot be empty." },
        { status: 400 }
      );
    }

    if (!receiver || typeof receiver !== "string" || receiver.trim().length === 0) {
      return NextResponse.json(
        { error: "Receiver address or name cannot be empty." },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a number greater than 0." },
        { status: 400 }
      );
    }

    const blockchain = getBlockchain();
    const newTransaction = new Transaction(
      sender.trim(),
      receiver.trim(),
      parsedAmount
    );

    blockchain.addTransaction(newTransaction);

    const pendingTransactions = blockchain.pendingTransactions;
    const totalConfirmed = countConfirmedTransactions(blockchain);
    const totalBlocks = blockchain.chain.length;

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      pendingTransactions,
      totalConfirmed,
      totalBlocks,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create transaction.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
