import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ServerEncryptedERC20ABI, MockERC20ABI } from './abi';
import { CONTRACT_ADDRESSES } from './config';
import { useState, useEffect } from 'react';

// Hook to read encrypted balance
export function useEncryptedBalance(userIndex: `0x${string}` | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.ServerEncryptedERC20,
    abi: ServerEncryptedERC20ABI,
    functionName: 'getEncryptedBalance',
    args: userIndex ? [userIndex] : undefined,
    query: {
      enabled: !!userIndex,
    }
  });

  return {
    encryptedBalance: data,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get user's encrypted index by their address
export function useUserEncryptedIndex(userAddress: `0x${string}` | undefined) {
  const { data, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESSES.ServerEncryptedERC20,
    abi: ServerEncryptedERC20ABI,
    functionName: 'userAddressToEncryptedIndex',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });

  return {
    encryptedIndex: data as `0x${string}` | undefined,
    isLoading,
    isError,
  };
}

// Hook to authenticate user (store encrypted index)
export function useAuthenticateUser() {
  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const authenticate = async (encryptedIndex: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ServerEncryptedERC20,
      abi: ServerEncryptedERC20ABI,
      functionName: 'authenticateUser',
      args: [encryptedIndex],
    });
  };

  return {
    authenticate,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    hash,
  };
}

// Hook to request deposit
export function useRequestDeposit() {
  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const requestDeposit = async (amount: bigint, encryptedIndex: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.ServerEncryptedERC20,
      abi: ServerEncryptedERC20ABI,
      functionName: 'requestDeposit',
      args: [amount, encryptedIndex],
    });
  };

  return {
    requestDeposit,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    hash,
  };
}

// Hook to approve ERC20 tokens
export function useApproveERC20() {
  const { writeContract, data: hash, isPending, isError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (spender: `0x${string}`, amount: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESSES.MockERC20,
      abi: MockERC20ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    hash,
  };
}

// Hook to get ERC20 balance
export function useERC20Balance(userAddress: `0x${string}` | undefined) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.MockERC20,
    abi: MockERC20ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    }
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    isError,
    refetch,
  };
}

// Hook to get ERC20 allowance
export function useERC20Allowance(
  ownerAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}`
) {
  const { data, isError, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.MockERC20,
    abi: MockERC20ABI,
    functionName: 'allowance',
    args: ownerAddress ? [ownerAddress, spenderAddress] : undefined,
    query: {
      enabled: !!ownerAddress,
    }
  });

  return {
    allowance: data as bigint | undefined,
    isLoading,
    isError,
    refetch,
  };
}

// Combined hook for deposit flow (approve + deposit)
export function useDepositFlow() {
  const { approve, isPending: isApproving, isConfirming: isApprovingConfirming, isSuccess: isApproved } = useApproveERC20();
  const { requestDeposit, isPending: isDepositing, isConfirming: isDepositConfirming, isSuccess: isDeposited } = useRequestDeposit();
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing' | 'complete'>('idle');

  const deposit = async (amount: bigint, encryptedIndex: `0x${string}`) => {
    try {
      // Step 1: Approve tokens
      setStep('approving');
      await approve(CONTRACT_ADDRESSES.ServerEncryptedERC20, amount);
    } catch (error) {
      setStep('idle');
      throw error;
    }
  };

  // Auto-progress to deposit after approval
  useEffect(() => {
    if (isApproved && step === 'approving') {
      setStep('depositing');
    }
  }, [isApproved, step]);

  useEffect(() => {
    if (isDeposited && step === 'depositing') {
      setStep('complete');
    }
  }, [isDeposited, step]);

  return {
    deposit,
    step,
    isApproving,
    isApprovingConfirming,
    isDepositing,
    isDepositConfirming,
    isComplete: step === 'complete',
  };
}
