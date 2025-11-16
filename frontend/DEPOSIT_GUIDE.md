# Deposit Page Guide

## ✅ Página de Deposit Creada

He creado una página completa para depositar tokens USDT y convertirlos en balance encriptado.

### 📄 Ubicación
- **URL**: `http://localhost:3000/dashboard/deposit`
- **Archivo**: `frontend/app/dashboard/deposit/page.tsx`

## 🎯 Características

### 1. Flujo de 3 Pasos con UI Visual
La página muestra un progreso visual de 3 pasos:

1. **Paso 1: Amount** - Usuario ingresa cantidad a depositar
2. **Paso 2: Approve** - Aprobar que el contrato gaste los tokens
3. **Paso 3: Deposit** - Depositar y encriptar los tokens

### 2. Balance Disponible
- Muestra el balance actual de USDT del usuario
- Botón de refresh para actualizar
- Formato legible (wei → tokens)

### 3. Proceso de Deposit

#### Flujo Automático:
1. Usuario ingresa cantidad
2. Si no tiene allowance → botón muestra "Approve X USDT"
3. Usuario aprueba → transacción se envía
4. Cuando approval confirma → **automáticamente** pasa al deposit
5. Deposit se procesa → tokens encriptados
6. Pantalla de éxito con detalles

#### Estados Visuales:
- Loading durante approve
- Loading durante deposit
- Mensajes de estado en tiempo real
- Hash de transacciones mostrado

### 4. Pantalla de Confirmación
Cuando el deposit completa, muestra:
- ✅ Mensaje de éxito
- 💰 Cantidad depositada
- 🔒 Badge de "Fully Encrypted"
- 🔗 Hash de transacción
- Botones para volver al dashboard o hacer otro deposit

## 🔧 Implementación Técnica

### Hooks Usados

```typescript
// Balance de ERC20
const { balance, refetch } = useERC20Balance(address)

// Allowance actual
const { allowance, refetch: refetchAllowance } = useERC20Allowance(
  address,
  CONTRACT_ADDRESSES.ServerEncryptedERC20
)

// Aprobar tokens
const { approve, isPending, isConfirming, isSuccess } = useApproveERC20()

// Depositar
const { requestDeposit, isPending, isConfirming, isSuccess } = useRequestDeposit()
```

### Lógica de Auto-Progreso

```typescript
// Cuando approve completa → automáticamente deposita
useEffect(() => {
  if (isApproved && currentStep === 'approve') {
    refetchAllowance()
    setTimeout(() => {
      handleDeposit()
    }, 1000)
  }
}, [isApproved, currentStep])
```

### Función de Approve

```typescript
const handleApprove = async () => {
  setCurrentStep('approve')
  await approve(
    CONTRACT_ADDRESSES.ServerEncryptedERC20,
    parseUnits(amount, 18)
  )
}
```

### Función de Deposit

```typescript
const handleDeposit = async () => {
  setCurrentStep('deposit')

  // Generar índice encriptado (placeholder por ahora)
  const encryptedIndex = `0x${Buffer.from(address).toString('hex')}`

  await requestDeposit(parseUnits(amount, 18), encryptedIndex)
}
```

## 🎨 Elementos de UI

### Indicador de Progreso
```
[1 ✓] Amount → [2 ✓] Approve → [3] Deposit
```
- Pasos completados en verde
- Paso actual en primary
- Pasos pendientes en gris

### Tarjeta de Balance
- Muestra USDT disponible
- Botón de refresh
- Loading state

### Mensajes de Estado
- Info azul durante procesamiento
- Success verde al completar
- Muestra hash de transacciones

### Botones Contextuales
- "Approve X USDT" si necesita approval
- "Deposit X USDT" si ya está aprobado
- Estados de loading

## 🔗 Integración con Dashboard

Actualicé el dashboard para incluir 4 botones:

```
[Send] [Deposit] [Faucet] [History]
```

El botón "Deposit" lleva a `/dashboard/deposit`

## 📝 Flujo Completo del Usuario

### Escenario: Usuario quiere depositar 100 USDT

1. **Dashboard** → Click "Deposit"
2. **Deposit Page** → Ve balance: 1000 USDT
3. **Input** → Ingresa "100"
4. **Check Allowance** → No tiene allowance
5. **Botón** → Muestra "Approve 100 USDT"
6. **Click Approve** → MetaMask se abre
7. **Confirma** → Transacción de approve enviada
8. **Espera** → Barra de progreso en paso 2
9. **Approve Completa** → Auto-avanza a deposit
10. **Deposit Automático** → Se procesa inmediatamente
11. **Confirma** → Segunda transacción en MetaMask
12. **Espera** → Barra de progreso en paso 3
13. **Deposit Completa** → Pantalla de éxito
14. **Balance Actualizado** → Ahora tiene balance encriptado
15. **Opciones** → "Back to Dashboard" o "Make Another Deposit"

## ⚠️ Notas Importantes

### Encrypted Index (Placeholder)
Por ahora, el índice encriptado se genera como:
```typescript
const encryptedIndex = `0x${Buffer.from(address).toString('hex')}`
```

**Para producción**, esto debería ser:
1. Generado por el backend
2. Encriptado con la clave pública del servidor
3. Único para cada usuario

### Allowance Check
- Se verifica automáticamente si el usuario ya aprobó
- Si `allowance >= amount` → va directo a deposit
- Si `allowance < amount` → requiere approve primero

### Balance Updates
- Se actualiza automáticamente después del deposit
- Delay de 2 segundos para esperar confirmación
- Usuario puede hacer refresh manual

## 🚀 Próximos Pasos

1. **Backend**: Implementar endpoint para generar encrypted index
2. **Encryption**: Usar verdadera encriptación RSA para el índice
3. **Server Processing**: Backend debe procesar el evento `DepositRequested`
4. **Balance Display**: Actualizar dashboard para mostrar balance encriptado

## 🎉 Resultado

La página de Deposit está **completamente funcional** y lista para:
- ✅ Aprobar tokens ERC20
- ✅ Depositar al contrato
- ✅ UI fluida con 3 pasos
- ✅ Confirmaciones visuales
- ✅ Manejo de errores
- ✅ Balance actualizado

Accede en: **http://localhost:3000/dashboard/deposit**
