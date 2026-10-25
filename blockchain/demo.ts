/**
 * demo.ts
 *
 * A tiny terminal program that walks through the blockchain engine:
 * create a chain, send coins, mine a block, then try (and catch) tampering.
 *
 * Mining with difficulty 4 can take a few seconds. That is Proof of Work.
 */

import { Blockchain } from "./Blockchain";
import { Transaction } from "./Transaction";
import { Block } from "./Block";

function printBlock(block: Block): void {
  console.log(`  Index:          ${block.index}`);
  console.log(`  Timestamp:      ${block.timestamp}`);
  console.log(`  Previous hash:  ${block.previousHash}`);
  console.log(`  Hash:           ${block.hash}`);
  console.log(`  Nonce:          ${block.nonce}`);
  console.log(`  Transactions:   ${block.transactions.length}`);

  for (const tx of block.transactions) {
    console.log(`    - ${tx.sender} → ${tx.receiver} : ${tx.amount}  (id: ${tx.id})`);
  }
}

console.log("=== BlockLearn Blockchain Demo ===");
console.log("");
console.log("Creating a new blockchain (mining the genesis block)...");

const blockchain = new Blockchain();

console.log("");
console.log("--- Genesis block ---");
printBlock(blockchain.chain[0]);

const aliceToBob = new Transaction("Alice", "Bob", 50);
blockchain.addTransaction(aliceToBob);

console.log("");
console.log("Created transaction: Alice → Bob");
console.log("Amount: 50");
console.log(`Pending transactions: ${blockchain.pendingTransactions.length}`);

console.log("");
console.log("Mining pending transactions (this may take a few seconds)...");
blockchain.minePendingTransactions();

const latestBlock = blockchain.getLatestBlock();

console.log("Mining completed");
console.log(`Latest block index: ${latestBlock.index}`);
console.log(`Latest block hash: ${latestBlock.hash}`);
console.log(`Previous hash: ${latestBlock.previousHash}`);
console.log(`Nonce: ${latestBlock.nonce}`);
console.log(`Number of transactions: ${latestBlock.transactions.length}`);

console.log("");
console.log("--- Complete blockchain ---");
for (const block of blockchain.chain) {
  console.log("");
  console.log(`Block ${block.index}`);
  printBlock(block);
}

console.log("");
console.log(`Blockchain valid: ${blockchain.isChainValid()}`);

console.log("");
console.log("Demonstrating tampering...");
console.log("Changing the mined transaction amount from 50 to 5000.");

const minedTransaction = blockchain.chain[1].transactions[0];
minedTransaction.amount = 5000;

console.log(`Blockchain valid after tampering: ${blockchain.isChainValid()}`);

console.log("");
console.log("Restoring the original amount (50)...");
minedTransaction.amount = 50;

console.log(`Blockchain valid: ${blockchain.isChainValid()}`);
