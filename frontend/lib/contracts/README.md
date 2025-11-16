# Contract Integration Guide

Esta carpeta contiene la integración de los contratos inteligentes con el frontend.

## Archivos

- **abi.ts**: Contiene los ABIs de los contratos (ServerEncryptedERC20 y MockERC20)
- **config.ts**: Configuración de direcciones de contratos y red
- **hooks.ts**: Hooks de React para interactuar con los contratos usando wagmi
- **index.ts**: Archivo de exportación principal

## Uso

### 1. Leer Balance Encriptado

```typescript
import { useUserBalance } from '@/lib/hooks/useBalance';

function MyComponent() {
  const { encryptedBalance, decryptedBalance, isLoading, refetch } = useUserBalance();

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Encrypted: {encryptedBalance?.encryptedAmount}</p>
          <p>Decrypted: {decryptedBalance}</p>
        </>
      )}
    </div>
  );
}
```

### 2. Hacer un Transfer

```typescript
import { useTransfer } from '@/lib/hooks/useTransfer';

function SendComponent() {
  const { transfer, isTransferring, error } = useTransfer();

  const handleSend = async () => {
    const result = await transfer(recipientAddress, amount);
    if (result.success) {
      console.log('Transfer successful!', result.txHash);
    }
  };

  return (
    <button onClick={handleSend} disabled={isTransferring}>
      {isTransferring ? 'Sending...' : 'Send'}
    </button>
  );
}
```

### 3. Aprobar y Depositar Tokens

```typescript
import { useDepositFlow } from '@/lib/contracts/hooks';

function DepositComponent() {
  const { deposit, step, isComplete } = useDepositFlow();

  const handleDeposit = async () => {
    await deposit(amount, encryptedIndex);
  };

  return (
    <div>
      <button onClick={handleDeposit}>Deposit</button>
      <p>Step: {step}</p>
    </div>
  );
}
```

## Flujo de Trabajo

1. **Usuario se autentica**: Se genera un índice encriptado para el usuario
2. **Lectura de balance**:
   - Se lee el balance encriptado del contrato usando el índice del usuario
   - Se muestra el balance encriptado en la UI
   - Opcionalmente, se puede desencriptar llamando al backend
3. **Transfer**:
   - Usuario firma un mensaje autorizando el transfer
   - Frontend envía la solicitud al backend
   - Backend maneja la encriptación y envía la transacción al contrato

## Configuración

Las direcciones de los contratos están en `config.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  ServerEncryptedERC20: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  MockERC20: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
};
```

Para cambiar la URL del backend, configura la variable de entorno:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```
