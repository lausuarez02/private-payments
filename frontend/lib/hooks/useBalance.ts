import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useEncryptedBalance, useUserEncryptedIndex } from '../contracts/hooks';
import { getDecryptedBalance, getUserIndex } from '../api/backend';
import { keccak256, toHex } from 'viem';

export function useUserBalance() {
  const { address } = useAccount();
  const [userIndex, setUserIndex] = useState<`0x${string}` | undefined>();
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get encrypted index from contract
  const { encryptedIndex: onChainEncryptedIndex } = useUserEncryptedIndex(address);

  // Get encrypted balance from contract using userIndex
  const { encryptedBalance, isLoading: isLoadingBalance, refetch } = useEncryptedBalance(userIndex);

  // Step 1: Get user index (either from contract or backend)
  useEffect(() => {
    async function fetchUserIndex() {
      if (!address) return;

      setIsLoadingIndex(true);
      setError(null);

      try {
        // First try to get from contract
        if (onChainEncryptedIndex && onChainEncryptedIndex !== '0x') {
          // Hash the encrypted index to get the userIndex (bytes32)
          const index = keccak256(onChainEncryptedIndex as `0x${string}`);
          setUserIndex(index);
        } else {
          // If not on contract, get from backend
          const encryptedIndexFromBackend = await getUserIndex(address);
          if (encryptedIndexFromBackend && encryptedIndexFromBackend !== '0x') {
            const index = keccak256(encryptedIndexFromBackend as `0x${string}`);
            setUserIndex(index);
          }
        }
      } catch (err) {
        console.error('Error fetching user index:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoadingIndex(false);
      }
    }

    fetchUserIndex();
  }, [address, onChainEncryptedIndex]);

  // Step 2: Decrypt balance when encrypted data is available
  useEffect(() => {
    async function decryptBalance() {
      if (!address || !encryptedBalance || !encryptedBalance[3]) {
        // encryptedBalance[3] is the 'exists' boolean
        setDecryptedBalance(null);
        return;
      }

      setIsDecrypting(true);
      setError(null);

      try {
        const result = await getDecryptedBalance(address, {
          encryptedAmount: encryptedBalance[0] as string,
          encryptedSymmetricKeyUser: encryptedBalance[1] as string,
          encryptedSymmetricKeyServer: encryptedBalance[2] as string,
          exists: encryptedBalance[3] as boolean,
        });

        setDecryptedBalance(result.balance);
      } catch (err) {
        console.error('Error decrypting balance:', err);
        // Don't set error here, just keep the encrypted state
        setDecryptedBalance(null);
      } finally {
        setIsDecrypting(false);
      }
    }

    decryptBalance();
  }, [address, encryptedBalance]);

  return {
    // Raw encrypted data from contract
    encryptedBalance: encryptedBalance ? {
      encryptedAmount: encryptedBalance[0] as string,
      encryptedSymmetricKeyUser: encryptedBalance[1] as string,
      exists: encryptedBalance[3] as boolean,
    } : null,

    // Decrypted balance (only available when backend successfully decrypts)
    decryptedBalance,

    // Loading states
    isLoading: isLoadingIndex || isLoadingBalance || isDecrypting,
    isLoadingIndex,
    isLoadingBalance,
    isDecrypting,

    // Error state
    error,

    // Refetch function
    refetch,
  };
}
