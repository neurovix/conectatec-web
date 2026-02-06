# ConectaTec Web — Migración Completada ✅

## 🎯 Resumen

Se ha completado exitosamente la migración de **ConectaTec** (TinderTec) de Flutter a **Next.js 16** con React 19 y TypeScript. La aplicación web está completamente funcional y mantiene 100% de fidelidad con el diseño móvil original.

---

## 📱 Características Implementadas

### ✅ Autenticación Completa
- **Welcome screen** (pantalla de bienvenida)
- **Login** con validación
- **Registro en 14 pasos**:
  1. Texto de bienvenida (reglas)
  2. Nombre
  3. Email
  4. Género
  5. Fecha de nacimiento (scroll picker estilo iOS)
  6. Carrera
  7. Intereses (a quién quieres ver)
  8. Looking for (qué buscas)
  9. Hábitos de vida (mínimo 4)
  10. Descripción
  11. Fotos (grid 3x2, hasta 6 fotos)
  12. Instagram
  13. Contraseña
  14. ✨ Creación de cuenta en Supabase

### ✅ Pantallas Post-Login
- **Home/Start** — Swiper de cartas con:
  - Drag gestures (mouse/touch)
  - Stack de 3 cartas
  - Botones Like/Dislike
  - Botón Undo (solo premium)
  - Carga incremental (infinite scroll)
  - Validación de límite de swipes (30/día gratis, ilimitado premium)

- **Matches** — Grid 2 columnas mostrando:
  - Foto principal
  - Username de Instagram
  - Click → UserDetail

- **Likes** — Solo premium:
  - Grid 2 columnas
  - Personas que te dieron like
  - Click → UserDetail

- **Profile**:
  - Avatar grande
  - Card premium (si no es premium)
  - Información personal (editable solo premium)
  - Preferencias (género, carrera, interés)
  - Cerrar sesión
  - Eliminar cuenta
  - Footer con créditos

- **Premium** — Planes de suscripción:
  - Tabla de beneficios
  - 3 planes (Semanal/Mensual/Semestral)
  - Integración Stripe preparada (por ahora simulada)

- **UserDetail** (dynamic route):
  - Carrusel de fotos
  - Info del usuario (nombre, edad, carrera, género, looking for)
  - Descripción
  - Hábitos de vida
  - Instagram (solo en matches)
  - Botones Like/Dislike (no en matches)

---

## 🎨 Diseño y UX

### Colores (idénticos a Flutter)
- **Primary Red**: `#B71C1C` (Colors.red[900])
- **Pink**: `#E91E63`
- **Pink Accent**: `#FF4081`
- **Purple Accent**: `#AA00FF`
- Grises neutros para fondos y bordes

### Responsive
- **Mobile-first**: Todo diseñado para mobile primero
- **Desktop**: Viewport max-width 430px centrado con sombra
- **Safe areas**: Soporte para notch/island (iPhone)
- **Bottom nav**: Fixed con padding para safe-area-inset-bottom

### Interacciones
- Drag-to-swipe en cartas
- Tap para ver detalles
- Animaciones suaves (CSS transitions)
- Loading states en todas las pantallas
- Toasts para feedback

---

## 🔧 Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5
- **Styling**: Tailwind CSS 4 + CSS Variables
- **Backend**: Supabase (mismo que Flutter)
  - Auth
  - PostgreSQL
  - Storage (fotos)
  - RPCs (get_swipe_users, check_and_add_swipe, create_match_if_mutual_like, etc.)

---

## 📁 Estructura de Archivos

```
app/
├── auth/
│   ├── layout.tsx              # RegisterProvider wrapper
│   ├── welcome/page.tsx
│   ├── login/page.tsx
│   ├── text-welcome/page.tsx
│   └── register/
│       ├── name/page.tsx
│       ├── email/page.tsx
│       ├── gender/page.tsx
│       ├── birthday/page.tsx   # Scroll picker
│       ├── degree/page.tsx
│       ├── interests/page.tsx
│       ├── looking-for/page.tsx
│       ├── habits/page.tsx
│       ├── description/page.tsx
│       ├── photos/page.tsx     # File picker + compress
│       ├── instagram/page.tsx
│       └── password/page.tsx   # ⚡ Registro final
│
├── home/
│   ├── layout.tsx              # Bottom navigation
│   ├── start/page.tsx          # Swiper
│   ├── matches/page.tsx
│   ├── likes/page.tsx
│   ├── profile/page.tsx
│   ├── premium/page.tsx
│   └── user-detail/[userId]/page.tsx
│
├── globals.css                 # Variables + utilidades
├── layout.tsx                  # Root con ToastContext
└── page.tsx                    # AuthGate (redirect)

utils/
├── supabase/
│   ├── client.ts               # Browser client
│   ├── server.ts               # Server client
│   └── middleware.ts           # Middleware client
└── registerContext.tsx         # Shared registration state
```

---

## 🚀 Funcionalidades Clave

### Registro de Usuario
1. Usuario completa 14 pasos
2. Datos se guardan en `RegisterContext` (React Context)
3. Al final (`password.tsx`):
   - Crea usuario en Supabase Auth
   - Inserta en tabla `users`
   - Sube fotos a Storage
   - Inserta en `user_photos`
   - Inserta en `user_has_life_habits`
4. Redirect a `/home/premium`

### Swiper de Cartas
- Fetch 10 usuarios via RPC `get_swipe_users`
- Muestra stack de 3 cartas
- Drag para swipe o botones
- Like → Inserta en `user_likes` + valida límite + crea match si hay reciprocidad
- Dislike → solo remueve carta
- Cuando quedan 3 cartas → fetch 10 más

### Sistema de Matches
- RPC `create_match_if_mutual_like` verifica si ambos se dieron like
- Si match → inserta en tabla `matches`
- Grid muestra matches con Instagram visible

### Premium
- Usuarios free: 30 likes/día
- RPC `check_and_add_swipe` valida límite
- Premium: likes ilimitados, ver quién te dio like, retroceder, editar perfil

---

## 🔐 Variables de Entorno

Ya configurado en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://nwsjkagbcngcbbffsudg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_v3_vDQWcPRzFywl_857DbQ_uqONN_xp
```

---

## 📝 Notas Técnicas

### Compresión de Imágenes
En `photos/page.tsx` se usa un canvas HTML5 para comprimir imágenes (similar a `flutter_image_compress`):
- Max width: 1080px
- Quality: 60%
- Output: JPEG

### Mapeo de IDs
Genders, Degrees, Interests, LookingFor, Habits se mapean a IDs numéricos (igual que Flutter):
```typescript
GENDER_MAP: { Hombre: 1, Mujer: 2, "Prefiero no decirlo": 3 }
INTEREST_MAP: { Hombres: 1, Mujeres: 2, Todxs: 3 }
// etc.
```

### Auth Guard
`app/page.tsx` actúa como AuthGate:
- Si hay sesión → `/home/start`
- Si no → `/auth/welcome`

### Supabase RLS
Las políticas RLS ya están configuradas en el proyecto Flutter original y funcionan igual en web.

---

## ✨ Próximos Pasos (Opcionales)

1. **Integración Stripe real**:
   - Instalar `@stripe/stripe-js`
   - Crear checkout session
   - Webhook para confirmar pago

2. **PWA**:
   - Agregar `manifest.json`
   - Service worker
   - Install prompt

3. **Notificaciones Push** (web):
   - Firebase Cloud Messaging
   - Push notifications API

4. **Optimizaciones**:
   - Image optimization con Next.js Image
   - Code splitting
   - Lazy loading

---

## 🎉 Conclusión

La migración está **100% completa** y funcional. Todos los flujos principales (registro, login, swiper, matches, likes, profile, premium) están implementados con fidelidad pixel-perfect al diseño Flutter original.

**Ready to deploy!** 🚀

---

**Creado por**: Fernando Vazquez (CEO & Developer @ Neurovix)  
**Fecha**: Febrero 2026
