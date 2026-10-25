# BlockLearn Explorer

> **Educational Blockchain Explorer & Transaction Simulator**

**BlockLearn Explorer** is an interactive web application designed to teach cryptocurrency and distributed ledger fundamentals through hands-on simulation. Built with Next.js, React, TypeScript, and Tailwind CSS, it connects a sleek frontend interface directly to a real TypeScript blockchain engine powered by SHA-256 cryptographic hashing and Proof-of-Work mining.

---

## 📌 Features

- 📊 **Main Dashboard**: Live chain metrics (total blocks, confirmed transactions, pending mempool pool, chain validity status), latest block details, and recent block feed.
- 💸 **Interactive Transaction Creator**: Submit transfers (`sender`, `receiver`, `amount`) into the live pending mempool with input validation and real-time state sync.
- ⛏️ **Proof-of-Work Mining Simulator**: Mine pending transfers into cryptographically sealed blocks using real `Block.mineBlock()` nonce iteration and network difficulty rules.
- 🔍 **Blockchain Explorer**: Search blocks and transactions by index, SHA-256 hash, ID, or participant names. Features vertical block linkage diagrams and deep-dive detail inspector modals.
- 🚨 **Tampering & Security Simulator**: Safe sandbox to tamper with confirmed transactions, observe immediate `isChainValid()` failure, analyze broken hash links, test hash recalculation, and restore original state with 1 click.
- 👛 **Wallet & Address Inspector**: Explores educational wallet addresses (`EDU-[HASH]-[NAME]`) with balances computed directly from confirmed ledger history (`Received - Sent = Balance`) and sent/received history filters.
- 🎓 **Interactive Learning Center**: 10 step-by-step educational modules, live server-side SHA-256 hashing calculator, `localStorage`-backed progress tracking, 13-term searchable glossary, and direct app feature shortcuts.

---

## 💡 Core Blockchain Concepts Implemented

1. **Blocks**: Containers storing index, timestamp, transaction list, `previousHash`, `hash`, and `nonce`.
2. **Transactions**: Records of value transfer between participants identified by a unique SHA-256 transaction ID.
3. **SHA-256 Hashing**: 256-bit cryptographic fingerprinting where any minor input change produces a completely different 64-character hexadecimal output.
4. **Hash Linking**: Every block stores the exact SHA-256 hash of the preceding block in its `previousHash` field, forming an unbreakable chain.
5. **Nonce**: A numerical value incremented by miners during Proof of Work to alter the block hash without changing the transactions.
6. **Proof of Work (PoW)**: Computational puzzle solving where miners iterate nonces until the block hash begins with a required number of leading zeroes (e.g. `0000`).
7. **Mempool**: The temporary staging area where unconfirmed transactions wait before being packed into a mined block.
8. **Immutability**: Property ensuring that altering confirmed data breaks hash linkage, causing `isChainValid()` verification to fail immediately.
9. **Wallet Balance Derivation**: Balances are derived dynamically from confirmed blockchain history (`Money Received - Money Sent = Current Balance`).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (Vanilla CSS Custom Properties & Dark Mode Palette)
- **Core Crypto**: Node.js `crypto` module (isolated server-side in API routes)

---

## 📂 Project Structure

```
blockchain-explorer/
├── blockchain/                      # Standalone Pure TypeScript Engine
│   ├── Block.ts                     # Block structure & Proof-of-Work algorithm
│   ├── Blockchain.ts                # Chain state, mempool & validation logic
│   ├── Transaction.ts               # Transaction model & SHA-256 ID computation
│   ├── crypto.ts                    # Node crypto SHA-256 helper
│   └── demo.ts                      # Terminal test script verifying core engine
├── src/
│   ├── app/                         # Next.js App Router Pages & API Endpoints
│   │   ├── api/                     # Server-Side API Routes
│   │   │   ├── explorer/            # GET /api/explorer
│   │   │   ├── learn/hash/          # POST /api/learn/hash
│   │   │   ├── mining/              # GET & POST /api/mining
│   │   │   ├── simulator/           # GET & POST /api/simulator/*
│   │   │   ├── transactions/        # GET & POST /api/transactions
│   │   │   └── wallet/              # GET /api/wallet
│   │   ├── explorer/                # /explorer route
│   │   ├── learn/                   # /learn route
│   │   ├── mining/                  # /mining route
│   │   ├── simulator/               # /simulator route
│   │   ├── transactions/            # /transactions route
│   │   ├── wallet/                  # /wallet route
│   │   ├── globals.css              # Global styles & theme tokens
│   │   ├── layout.tsx               # Root layout (Sidebar + Header)
│   │   └── page.tsx                 # Main Dashboard
│   ├── components/                  # UI Component Library
│   │   ├── BlockCard.tsx            # Block card renderer
│   │   ├── ChainStatusBanner.tsx    # Integrity banner
│   │   ├── EmptyState.tsx           # Fallback empty state tile
│   │   ├── Header.tsx               # Top navigation header
│   │   ├── Sidebar.tsx              # Sidebar navigation
│   │   ├── StatCard.tsx             # Dashboard metric card
│   │   ├── TransactionCard.tsx      # Transaction card with copy button
│   │   └── icons.tsx                # SVG Icon library
│   └── lib/
│       └── blockchainStore.ts       # Server-side singleton store & snapshot manager
├── next.config.ts                   # Next.js config
├── package.json                     # Project dependencies & scripts
└── tsconfig.json                    # TypeScript configuration & path aliases
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

Clone the repository and install dependencies:

```bash
cd blockchain-explorer
npm install
```

### Running Locally (Development)

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the app.

---

## 🚀 Production Build

To test or deploy the production build:

```bash
npm run build
npm start
```

---

## 🎬 Recommended Demo Flow

1. **Dashboard (`/`)**: Review initial blockchain height, confirmed transactions, and `✓ Blockchain Valid` status.
2. **Create Transaction (`/transactions`)**: Submit a transfer from `Alice` to `Bob` for `50` coins. Notice it enters the **Pending Mempool Queue**.
3. **Wallet Inspection (`/wallet`)**: Inspect Alice's wallet. Verify her balance remains `950` because the transaction is still pending.
4. **Mine Block (`/mining`)**: Click **Mine Pending Transactions**. Observe the Proof-of-Work execution, nonce searching, and creation of Block #2.
5. **Explorer Inspection (`/explorer`)**: Search for "Alice" or Block #2 to inspect the freshly mined block and confirmed transaction.
6. **Wallet Balance Update (`/wallet`)**: Return to Wallet Inspector. Notice Alice's balance has updated to `850` and Bob's balance has updated to `1130`.
7. **Security Simulation (`/simulator`)**: Select Block #1, alter transaction amount to `5000`, and click **Tamper With Transaction**. Observe `isChainValid()` fail (`❌ TAMPERED` & `❌ BROKEN LINK`).
8. **Recalculate & Restore (`/simulator`)**: Click **Recalculate Block Hash** to see why updating one block's hash still breaks the next block link. Then click **Restore Original Blockchain** to return to a 100% valid chain.
9. **Learning Center (`/learn`)**: Test the live SHA-256 calculator, search the glossary, and track module completion.

---

## ⚠️ Educational Disclaimer

**BlockLearn Explorer** is an educational simulation created strictly for learning and demonstration purposes.
- It does **NOT** connect to any real cryptocurrency networks (such as Bitcoin or Ethereum).
- It does **NOT** handle real money, tokens, or financial assets.
- It does **NOT** generate or store real private keys.

---

## 🚀 Future Improvements

Possible future educational enhancements:
- 🔑 **Digital Signatures & Asymmetric Cryptography**: Elliptic curve keypairs (ECDSA) for transaction signing.
- 🌳 **Merkle Trees**: Merkle root computation for block transaction headers.
- 🌐 **Peer-to-Peer Network Simulation**: Visualizing multi-node propagation and chain fork resolution (Longest Chain Rule).
- 📜 **Smart Contract Sandbox**: Simplified state-machine execution engine for basic smart contracts.
