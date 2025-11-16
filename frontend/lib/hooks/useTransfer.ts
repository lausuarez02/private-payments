import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { requestTransfer } from '../api/backend';

export function useTransfer() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const transfer = async (toAddress: string, amount: string) => {
    if (!address) {
      setError('Wallet not connected');
      return { success: false };
    }

    setIsTransferring(true);
    setError(null);
    setTxHash(null);

    try {
      // Create a message to sign for authorization
      const message = `Transfer ${amount} to ${toAddress} from ${address}`;

      // Request user signature
      const signature = await signMessageAsync({ message });

      // Send transfer request to backend
      const result = await requestTransfer(address, toAddress, amount, signature);

      if (result.success) {
        setTxHash(result.txHash);
        return { success: true, txHash: result.txHash };
      } else {
        setError('Transfer failed');
        return { success: false };
      }
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Transfer failed');
      return { success: false };
    } finally {
      setIsTransferring(false);
    }
  };

  return {
    transfer,
    isTransferring,
    error,
    txHash,
  };
}
