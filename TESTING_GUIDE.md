# Guía de Testing - Integración de Stripe

## 🚀 Pasos para probar la integración

### 1. Iniciar el servidor de desarrollo
```bash
npm run dev
```

### 2. Navegar a la página de Premium
Accede a: `http://localhost:3000/home/premium`

### 3. Seleccionar un plan
Haz clic en el botón "💳 Pagar" de cualquier plan (Semanal, Mensual o Semestral)

### 4. Completar el formulario de pago

Usa estas tarjetas de prueba de Stripe:

#### ✅ Pago exitoso
- **Número**: 4242 4242 4242 4242
- **Fecha**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquier 5 dígitos (ej: 12345)

#### 🔐 Requiere autenticación 3D Secure
- **Número**: 4000 0025 0000 3155
- **Fecha**: Cualquier fecha futura
- **CVC**: Cualquier 3 dígitos
- **Código postal**: Cualquier 5 dígitos

#### ❌ Pago rechazado
- **Número**: 4000 0000 0000 9995
- **Fecha**: Cualquier fecha futura
- **CVC**: Cualquier 3 dígitos
- **Código postal**: Cualquier 5 dígitos

### 5. Verificar el pago en Stripe Dashboard

1. Ve a: https://dashboard.stripe.com/test/payments
2. Busca el pago más reciente
3. Verifica que el estado sea "Succeeded"
4. Revisa los metadatos:
   - `userId`: ID del usuario en Supabase
   - `plan`: Plan seleccionado (Semanal/Mensual/Semestral)
   - `days`: Duración en días (7/30/180)

### 6. Verificar la base de datos

Conecta a Supabase y verifica que el usuario tenga:
```sql
SELECT id_user, is_premium, premium_until 
FROM users 
WHERE id_user = 'TU_USER_ID';
```

Debería mostrar:
- `is_premium`: true
- `premium_until`: fecha actual + días del plan

---

## 🧪 Testing con Webhooks (Opcional)

### 1. Instalar Stripe CLI
```bash
brew install stripe/stripe-cli/stripe
```

### 2. Login en Stripe CLI
```bash
stripe login
```

### 3. Iniciar el listener de webhooks
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Este comando te dará un webhook secret que empieza con `whsec_...`

### 4. Agregar el webhook secret al .env.local
```env
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

### 5. Reiniciar el servidor
```bash
npm run dev
```

### 6. Hacer un pago de prueba
Al completar un pago, verás los eventos en la terminal donde corre `stripe listen`

---

## 📊 Escenarios de prueba

### Escenario 1: Pago exitoso básico
1. Seleccionar plan Mensual
2. Usar tarjeta 4242 4242 4242 4242
3. Completar pago
4. ✅ Verificar redirección a /home/start
5. ✅ Verificar toast "¡Pago exitoso!"
6. ✅ Verificar is_premium=true en DB
7. ✅ Verificar premium_until = hoy + 30 días

### Escenario 2: Pago con autenticación 3D Secure
1. Seleccionar plan Semanal
2. Usar tarjeta 4000 0025 0000 3155
3. Completar autenticación modal
4. ✅ Verificar pago exitoso
5. ✅ Verificar premium_until = hoy + 7 días

### Escenario 3: Pago rechazado
1. Seleccionar plan Semestral
2. Usar tarjeta 4000 0000 0000 9995
3. ✅ Verificar mensaje de error
4. ✅ Verificar que NO se actualizó la DB

### Escenario 4: Usuario cierra ventana durante pago
1. Iniciar pago
2. Cerrar pestaña antes de completar
3. Volver a /home/premium
4. ✅ Usuario puede intentar de nuevo
5. ✅ No hay cargos duplicados

---

## 🐛 Debugging

### Error: "No autenticado"
- Verifica que el usuario esté logueado
- Revisa las cookies de Supabase

### Error: "Plan inválido"
- Verifica que el parámetro `plan` sea exactamente: "Semanal", "Mensual" o "Semestral"

### Error: "Error al crear el pago"
- Verifica NEXT_STRIPE_SECRET_KEY en .env.local
- Revisa logs del servidor

### Error: "Error al verificar el pago"
- Verifica que el paymentIntentId sea correcto
- Revisa logs del servidor
- Verifica conexión a Supabase

### Pago exitoso pero no actualiza DB
- Verifica permisos de la tabla `users` en Supabase
- Verifica que las columnas `is_premium` y `premium_until` existan
- Revisa logs del servidor

---

## 📝 Checklist de verificación

Antes de pasar a producción:

- [ ] Todos los pagos de prueba funcionan correctamente
- [ ] Los metadatos se guardan correctamente en Stripe
- [ ] La base de datos se actualiza correctamente
- [ ] Los usuarios son redirigidos correctamente después del pago
- [ ] Los webhooks funcionan (si están configurados)
- [ ] Los mensajes de error son claros y útiles
- [ ] Las claves de Stripe son las de TEST (pk_test y sk_test)
- [ ] El flujo completo se ha probado al menos 3 veces
