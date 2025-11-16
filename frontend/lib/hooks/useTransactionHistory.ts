import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useBlockNumber } from 'wagmi';
import { ServerEncryptedERC20ABI } from '../contracts/abi';
import { CONTRACT_ADDRESSES } from '../contracts/config';
import { formatUnits } from 'viem';

export interface Transaction {
  id: string;
  type: 'deposit' | 'balance_stored' | 'authenticated';
  blockNumber: bigint;
  transactionHash: string;
  timestamp?: number;
  // DepositRequested event data
  requestId?: string;
  packedData?: string;
  encryptedIndex?: string;
  // BalanceStored event data
  encryptedAmount?: string;
  encryptedSymmetricKeyUser?: string;
  encryptedSymmetricKeyServer?: string;
  user?: string;
  // UserAuthenticated event data
  authenticatedUser?: string;
}

export function useTransactionHistory() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: currentBlock } = useBlockNumber({ watch: true });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      if (!address || !publicClient) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get the current block number
        const toBlock = await publicClient.getBlockNumber();
        // Look back 10000 blocks (adjust as needed)
        const fromBlock = toBlock > 10000n ? toBlock - 10000n : 0n;

        const allTransactions: Transaction[] = [];

        // Fetch DepositRequested events
        const depositLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.ServerEncryptedERC20,
          event: {
            type: 'event',
            name: 'DepositRequested',
            inputs: [
              { type: 'bytes32', name: 'requestId', indexed: true },
              { type: 'bytes', name: 'packedData', indexed: false },
              { type: 'bytes', name: 'encryptedIndex', indexed: false }
            ]
          },
          fromBlock,
          toBlock,
        });

        for (const log of depositLogs) {
          const args = log.args as any;
          allTransactions.push({
            id: log.transactionHash + '-' + log.logIndex.toString(),
            type: 'deposit',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            requestId: args.requestId,
            packedData: args.packedData,
            encryptedIndex: args.encryptedIndex,
          });
        }

        // Fetch BalanceStored events
        const balanceStoredLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.ServerEncryptedERC20,
          event: {
            type: 'event',
            name: 'BalanceStored',
            inputs: [
              { type: 'bytes32', name: 'requestId', indexed: true },
              { type: 'address', name: 'user', indexed: true },
              { type: 'bytes', name: 'encryptedAmount', indexed: false },
              { type: 'bytes', name: 'encryptedSymmetricKeyUser', indexed: false },
              { type: 'bytes', name: 'encryptedSymmetricKeyServer', indexed: false }
            ]
          },
          fromBlock,
          toBlock,
        });

        for (const log of balanceStoredLogs) {
          const args = log.args as any;
          allTransactions.push({
            id: log.transactionHash + '-' + log.logIndex.toString(),
            type: 'balance_stored',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            requestId: args.requestId,
            user: args.user,
            encryptedAmount: args.encryptedAmount,
            encryptedSymmetricKeyUser: args.encryptedSymmetricKeyUser,
            encryptedSymmetricKeyServer: args.encryptedSymmetricKeyServer,
          });
        }

        // Fetch UserAuthenticated events for this address
        const authLogs = await publicClient.getLogs({
          address: CONTRACT_ADDRESSES.ServerEncryptedERC20,
          event: {
            type: 'event',
            name: 'UserAuthenticated',
            inputs: [
              { type: 'address', name: 'user', indexed: true },
              { type: 'bytes', name: 'encryptedIndex', indexed: false }
            ]
          },
          args: {
            user: address
          },
          fromBlock,
          toBlock,
        });

        for (const log of authLogs) {
          const args = log.args as any;
          allTransactions.push({
            id: log.transactionHash + '-' + log.logIndex.toString(),
            type: 'authenticated',
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            authenticatedUser: args.user,
            encryptedIndex: args.encryptedIndex,
          });
        }

        // Sort by block number (most recent first)
        allTransactions.sort((a, b) => {
          if (b.blockNumber > a.blockNumber) return 1;
          if (b.blockNumber < a.blockNumber) return -1;
          return 0;
        });

        // Get timestamps for transactions
        const transactionsWithTimestamps = await Promise.all(
          allTransactions.map(async (tx) => {
            try {
              const block = await publicClient.getBlock({ blockNumber: tx.blockNumber });
              return {
                ...tx,
                timestamp: Number(block.timestamp)
              };
            } catch {
              return tx;
            }
          })
        );

        setTransactions(transactionsWithTimestamps);
      } catch (err: any) {
        console.error('Error fetching transaction history:', err);
        setError(err.message || 'Failed to fetch transaction history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [address, publicClient, currentBlock]);

  return {
    transactions,
    isLoading,
    error,
  };
}
