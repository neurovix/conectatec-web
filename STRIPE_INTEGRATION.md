# Integración de Stripe para Pagos Premium

## Archivos creados/modificados:

### 1. API Routes
- **`/app/api/create-payment-intent/route.ts`**: Crea el PaymentIntent de Stripe
- **`/app/api/verify-payment/route.ts`**: Verifica el pago y actualiza la base de datos

### 2. Páginas de Checkout
- **`/app/home/checkout/page.tsx`**: Página principal de checkout
- **`/app/home/checkout/CheckoutForm.tsx`**: Formulario de pago con Stripe Elements
- **`/app/home/checkout/success/page.tsx`**: Página de confirmación de pago

### 3. Modificaciones
- **`/app/home/premium/page.tsx`**: Ahora redirige al checkout
- **`.env.local`**: Agregado `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **`/utils/supabase/server.ts`**: Actualizado para usar async/await

## Variables de entorno necesarias:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_STRIPE_SECRET_KEY=sk_test_...
```

## Flujo de pago:

1. Usuario selecciona un plan en `/home/premium`
2. Se redirige a `/home/checkout?plan=Mensual&price=59.99 MXN`
3. Se crea un PaymentIntent en `/api/create-payment-intent`
4. Usuario completa el pago con Stripe Elements
5. Se verifica el pago en `/api/verify-payment`
6. Se actualiza la base de datos:
   - `is_premium = true`
   - `premium_until = fecha actual + días del plan`
7. Usuario es redirigido a `/home/start`

## Planes disponibles:

- **Semanal**: 7 días - $19.99 MXN
- **Mensual**: 30 días - $59.99 MXN
- **Semestral**: 180 días - $99.99 MXN

## Próximos pasos:

### 1. Configurar webhook de Stripe (opcional pero recomendado)

Para mayor seguridad, puedes configurar un webhook que escuche el evento `payment_intent.succeeded`:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Crea el archivo `/app/api/webhooks/stripe/route.ts` para manejar eventos de Stripe.

### 2. Modo producción

Cuando estés listo para producción:

1. Cambia las claves de test por las de producción en `.env.local`
2. Actualiza los precios si es necesario
3. Configura el webhook en el dashboard de Stripe

### 3. Testing

Tarjetas de prueba de Stripe:
- **Éxito**: `4242 4242 4242 4242`
- **Requiere autenticación**: `4000 0025 0000 3155`
- **Rechazada**: `4000 0000 0000 9995`

Fecha de expiración: cualquier fecha futura
CVC: cualquier 3 dígitos
Código postal: cualquier 5 dígitos

## Verificación en Stripe Dashboard:

Después de realizar un pago de prueba, verifica en:
1. Dashboard de Stripe > Pagos
2. Deberías ver el PaymentIntent con metadata:
   - `userId`: ID del usuario
   - `plan`: Semanal/Mensual/Semestral
   - `days`: 7/30/180

## Estructura de la base de datos:

Asegúrate de que la tabla `users` tenga las columnas:
- `id_user` (UUID)
- `is_premium` (BOOLEAN)
- `premium_until` (TIMESTAMP)
