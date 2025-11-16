# Token Faucet Guide

## ¿Qué es el Faucet?

El faucet es una página donde los usuarios pueden obtener tokens ERC20 de prueba (USDT) gratis para testing.

## Características

- ✅ Mintea tokens ERC20 directamente desde el contrato
- ✅ Muestra balance actual de tokens
- ✅ Botones de cantidad rápida (100, 500, 1000, 5000)
- ✅ Confirmación de transacciones
- ✅ Interfaz visual consistente con el resto de la app

## Ubicación

La página del faucet está en:
- URL: `http://localhost:3000/dashboard/faucet`
- Archivo: `frontend/app/dashboard/faucet/page.tsx`

## Acceso

Desde el dashboard principal, hay un botón "Faucet" en la sección de acciones:

```
[Send] [Receive] [Faucet] [Encrypt]
```

## Funcionalidad

### 1. Ver Balance Actual
- Muestra el balance actual de tokens ERC20 del usuario
- Botón de refresh para actualizar el balance

### 2. Mintear Tokens
1. Conectar wallet
2. Ingresar cantidad de tokens a mintear
3. O usar botones rápidos (100, 500, 1000, 5000)
4. Click en "Mint X USDT"
5. Confirmar transacción en wallet
6. Esperar confirmación
7. Balance se actualiza automáticamente

### 3. Confirmación
- Mensaje de éxito con hash de transacción
- Balance actualizado automáticamente
- Manejo de errores si falla la transacción

## Contrato

El faucet llama a la función `mint()` del contrato MockERC20:

```solidity
function mint(address to, uint256 amount) external
```

Dirección del contrato: `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`

## Uso del Hook

```typescript
import { useWriteContract } from 'wagmi';
import { MockERC20ABI } from '@/lib/contracts/abi';
import { CONTRACT_ADDRESSES } from '@/lib/contracts/config';

const { writeContract } = useWriteContract();

// Mintear tokens
writeContract({
  address: CONTRACT_ADDRESSES.MockERC20,
  abi: MockERC20ABI,
  functionName: 'mint',
  args: [userAddress, amountInWei],
});
```

## Flujo Completo

1. **Usuario entra al faucet** → `/dashboard/faucet`
2. **Conecta wallet** → Si no está conectado
3. **Ve su balance actual** → `useERC20Balance()`
4. **Elige cantidad** → Input o botones rápidos
5. **Click "Mint"** → Llama a `writeContract()`
6. **Confirma en wallet** → MetaMask/WalletConnect
7. **Espera confirmación** → `useWaitForTransactionReceipt()`
8. **Balance actualizado** → `refetch()`
9. **Mensaje de éxito** → Con hash de TX

## Próximos Pasos

Después de obtener tokens del faucet, el usuario puede:
1. Depositarlos en el sistema encriptado
2. Hacer transfers privados
3. Ver su balance encriptado
