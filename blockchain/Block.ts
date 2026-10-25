/**
 * Block.ts
 *
 * A block is a "page" in the blockchain notebook.
 * It stores:
 * - where it sits in the chain (index)
 * - when it was created
 * - a list of transactions
 * - the hash of the previous block (the chain link)
 * - its own hash (the seal)
 * - a nonce (a number miners change to solve Proof of Work)
 *
 * Proof of Work: miners try many nonce values until the hash starts
 * with a required number of zeros. That work makes old blocks hard to rewrite.
 */

import { sha256 } from "./crypto";
import { Transaction } from "./Transaction";

export class Block {
  /** Position in the chain. The genesis block is 0. */
  public index: number;

  /** When this block was created (milliseconds since Jan 1, 1970). */
  public timestamp: number;

  /** Transactions included in this block. */
  public transactions: Transaction[];

  /** Hash of the previous block. Genesis uses "0". */
  public previousHash: string;

  /** SHA-256 fingerprint of this block's contents. */
  public hash: string;

  /**
   * Number that miners increment until the hash meets the difficulty rule.
   * Changing the nonce changes the hash, without changing the transactions.
   */
  public nonce: number;

  constructor(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash: string = "0"
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /**
   * Hash every important field of this block.
   *
   * We include the nonce so mining can search for a valid hash.
   * We include previousHash so this block is locked to the one before it.
   */
  public calculateHash(): string {
    const transactionData = JSON.stringify(this.transactions);
    const contents =
      this.index.toString() +
      this.timestamp.toString() +
      transactionData +
      this.previousHash +
      this.nonce.toString();

    return sha256(contents);
  }

  /**
   * Mine this block with Proof of Work.
   *
   * Difficulty is how many leading zeros the hash must have.
   * Example: difficulty 4 means a valid hash looks like "0000...".
   *
   * Higher difficulty = more guesses = more work = slower mining.
   */
  public mineBlock(difficulty: number): void {
    const prefix = "0".repeat(difficulty);

    // Keep trying new nonce values until the hash starts with enough zeros.
    while (!this.hash.startsWith(prefix)) {
      this.nonce += 1;
      this.hash = this.calculateHash();
    }
  }
}
