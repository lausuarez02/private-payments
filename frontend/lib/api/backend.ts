import { BACKEND_URL } from '../contracts/config';

export interface EncryptedBalanceData {
  encryptedAmount: string;
  encryptedSymmetricKeyUser: string;
  encryptedSymmetricKeyServer: string;
  exists: boolean;
}

export interface DecryptedBalance {
  balance: string;
  token: string;
}

/**
 * Get user's encrypted index from the backend
 */
export async function getUserIndex(userAddress: string): Promise<string> {
  const response = await fetch(`${BACKEND_URL}/api/user/index/${userAddress}`);
  if (!response.ok) {
    throw new Error('Failed to get user index');
  }
  const data = await response.json();
  return data.encryptedIndex;
}

/**
 * Request the backend to decrypt the user's balance
 * This sends the encrypted data to the backend which has the server's private key
 */
export async function getDecryptedBalance(
  userAddress: string,
  encryptedData: EncryptedBalanceData
): Promise<DecryptedBalance> {
  const response = await fetch(`${BACKEND_URL}/api/balance/decrypt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userAddress,
      encryptedAmount: encryptedData.encryptedAmount,
      encryptedSymmetricKeyUser: encryptedData.encryptedSymmetricKeyUser,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to decrypt balance');
  }

  return await response.json();
}

/**
 * Request a transfer (the backend will handle encryption and submit to contract)
 */
export async function requestTransfer(
  fromAddress: string,
  toAddress: string,
  amount: string,
  userSignature: string
): Promise<{ txHash: string; success: boolean }> {
  const response = await fetch(`${BACKEND_URL}/api/transfer/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: toAddress,
      amount,
      signature: userSignature,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to request transfer');
  }

  return await response.json();
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(userAddress: string) {
  const response = await fetch(`${BACKEND_URL}/api/transactions/${userAddress}`);
  if (!response.ok) {
    throw new Error('Failed to get transaction history');
  }
  return await response.json();
}
