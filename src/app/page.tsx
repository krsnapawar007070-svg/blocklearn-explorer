import { BlockCard } from "@/components/BlockCard";
import { ChainStatusBanner } from "@/components/ChainStatusBanner";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { TransactionCard } from "@/components/TransactionCard";
import {
  IconActivity,
  IconInbox,
  IconLayers,
  IconShieldCheck,
  IconShieldX,
} from "@/components/icons";
import {
  countConfirmedTransactions,
  getBlockchain,
} from "@/lib/blockchainStore";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const blockchain = getBlockchain();
  const isValid = blockchain.isChainValid();
  const latestBlock = blockchain.getLatestBlock();
  const recentBlocks = [...blockchain.chain].reverse();
  const totalTransactions = countConfirmedTransactions(blockchain);
  const pendingCount = blockchain.pendingTransactions.length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Blocks"
          value={String(blockchain.chain.length)}
          hint="Including the genesis block"
          icon={<IconLayers className="h-4 w-4" />}
        />
        <StatCard
          label="Total Transactions"
          value={String(totalTransactions)}
          hint="Confirmed and sealed in blocks"
          icon={<IconActivity className="h-4 w-4" />}
        />
        <StatCard
          label="Pending Transactions"
          value={String(pendingCount)}
          hint="Waiting in the mempool"
          icon={<IconInbox className="h-4 w-4" />}
        />
        <StatCard
          label="Blockchain Status"
          value={isValid ? "Valid" : "Invalid"}
          hint="From Blockchain.isChainValid()"
          tone={isValid ? "success" : "danger"}
          icon={
            isValid ? (
              <IconShieldCheck className="h-4 w-4" />
            ) : (
              <IconShieldX className="h-4 w-4" />
            )
          }
        />
      </section>

      <ChainStatusBanner valid={isValid} />

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Latest Block</h2>
              <p className="text-xs text-slate-500">
                Newest block on the live chain
              </p>
            </div>
          </div>
          <BlockCard block={latestBlock} featured />
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-white">
              Pending Transactions
            </h2>
            <p className="text-xs text-slate-500">
              Not yet included in a mined block
            </p>
          </div>
          {pendingCount === 0 ? (
            <EmptyState
              title="No pending transactions"
              message="The pool is empty. New transfers will wait here until the next block is mined."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {blockchain.pendingTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-white">Recent Blocks</h2>
          <p className="text-xs text-slate-500">
            Newest first, read from blockchain.chain
          </p>
        </div>
        <div className="grid gap-4">
          {recentBlocks.map((block) => (
            <BlockCard key={`${block.index}-${block.hash}`} block={block} />
          ))}
        </div>
      </section>
    </div>
  );
}
