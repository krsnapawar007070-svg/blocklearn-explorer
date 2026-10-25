/**
 * Blockchain.ts
 *
 * The blockchain is a list of blocks, each pointing to the one before it.
 *
 * How new data gets in:
 * 1. addTransaction() puts a transfer into a waiting list (the pending pool).
 * 2. minePendingTransactions() packs those transfers into a new block
 *    and solves Proof of Work so the block can join the chain.
 *
 * isChainValid() walks the chain and checks that nobody tampered with history.
 */

import { Block } from "./Block";
import { Transaction } from "./Transaction";

export class Blockchain {
  /** The blocks in order, starting with the genesis block. */
  public chain: Block[];

  /**
   * Transactions waiting to be included in the next mined block.
   * They are not part of history until a miner seals them into a block.
   */
  public pendingTransactions: Transaction[];

  /**
   * How many leading zeros a block hash must have.
   * 4 means a valid hash starts with "0000".
   */
  public difficulty: number;

  constructor(difficulty: number = 4) {
    this.difficulty = difficulty;
    this.pendingTransactions = [];
    this.chain = [this.createGenesisBlock()];
  }

  /**
   * The first block in the chain.
   * It has no real previous block, so previousHash is the string "0".
   */
  private createGenesisBlock(): Block {
    const genesisBlock = new Block(
      0,
      Date.now(),
      [],
      "0"
    );

    genesisBlock.mineBlock(this.difficulty);
    return genesisBlock;
  }

  /** The newest block — the one a new block must link to. */
  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a transaction to the pending pool.
   * It will wait here until someone mines a block.
   */
  public addTransaction(transaction: Transaction): void {
    if (!transaction.sender || !transaction.receiver) {
      throw new Error("Transaction must include a sender and a receiver.");
    }

    if (transaction.amount <= 0) {
      throw new Error("Transaction amount must be greater than 0.");
    }

    this.pendingTransactions.push(transaction);
  }

  /**
   * Take every pending transaction, put them in a new block, mine it,
   * then attach that block to the chain.
   *
   * After mining, the pending pool is cleared.
   */
  public minePendingTransactions(): Block {
    const previousBlock = this.getLatestBlock();

    const newBlock = new Block(
      previousBlock.index + 1,
      Date.now(),
      // Copy the list so later pool changes cannot edit a block already on the chain.
      [...this.pendingTransactions],
      previousBlock.hash
    );

    newBlock.mineBlock(this.difficulty);

    this.chain.push(newBlock);

    // These transactions are now in the chain, so the pool starts empty again.
    this.pendingTransactions = [];

    return newBlock;
  }

  /**
   * Return true if the chain looks honest.
   *
   * Checks:
   * 1. The first block is a valid genesis block (index 0, previousHash "0").
   * 2. Each block's stored hash still matches calculateHash().
   * 3. Each block's previousHash matches the real hash of the block before it.
   */
  public isChainValid(): boolean {
    const genesisBlock = this.chain[0];

    if (!this.isGenesisBlockValid(genesisBlock)) {
      return false;
    }

    // Start at 1 because block 0 (genesis) has no previous block to compare.
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // If the data changed, calculateHash() would no longer match the stored hash.
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // If someone swapped in a different previous block, this link would break.
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  /**
   * Genesis must be the starting page of the notebook:
   * index 0, previousHash "0", and a hash that still matches its contents.
   */
  private isGenesisBlockValid(block: Block): boolean {
    if (block.index !== 0) {
      return false;
    }

    if (block.previousHash !== "0") {
      return false;
    }

    if (block.hash !== block.calculateHash()) {
      return false;
    }

    return true;
  }
}
