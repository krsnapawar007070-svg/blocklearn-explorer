/**
 * Transaction.ts
 *
 * A transaction is a record of value moving from one person to another.
 *
 * In a real cryptocurrency this would also be digitally signed. Here we keep
 * it simple so the idea is easy to follow: who sent, who received, and how much.
 */

import { sha256 } from "./crypto";

export class Transaction {
  /** Unique fingerprint of this transaction (SHA-256). */
  public readonly id: string;

  /** Who is sending coins (a simple name or address string). */
  public readonly sender: string;

  /** Who is receiving coins. */
  public readonly receiver: string;

  /** How many coins are being sent. Must be greater than 0. */
  public amount: number;

  /** When this transaction was created (milliseconds since Jan 1, 1970). */
  public readonly timestamp: number;

  constructor(sender: string, receiver: string, amount: number) {
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
    this.timestamp = Date.now();

    // The ID is a hash of the transaction contents.
    // If any field changed, the ID would be different.
    this.id = Transaction.createId(sender, receiver, amount, this.timestamp);
  }

  /**
   * Build a transaction ID by hashing the important fields together.
   * Using "|" as a separator keeps the pieces from blending into each other.
   */
  private static createId(
    sender: string,
    receiver: string,
    amount: number,
    timestamp: number
  ): string {
    const contents = `${sender}|${receiver}|${amount}|${timestamp}`;
    return sha256(contents);
  }
}
