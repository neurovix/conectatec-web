# conectatec-web

> Aplicación web de conexión social para estudiantes del Tecnológico Nacional de México Campus Saltillo.

**🔗 [tindertec.com](https://tindertec.com)**

---

## 📖 Descripción

**ConectaTec** es una aplicación web estilo Tinder diseñada exclusivamente para los estudiantes del Tecnológico Nacional de México Campus Saltillo. Permite a los estudiantes conectarse entre sí de manera sencilla e intuitiva, fomentando la comunidad y las relaciones dentro del campus.

Desarrollada por **[Neurovix S de RL de CV](https://neurovix.com.mx)**.

---

## 🚀 Tech Stack

### Frontend
| Tecnología | Uso |
|---|---|
| [Next.js](https://nextjs.org/) | Framework de React con SSR/SSG |
| [React](https://react.dev/) | Biblioteca de interfaz de usuario |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos utilitarios |

### Backend & Base de Datos
| Tecnología | Uso |
|---|---|
| [Supabase](https://supabase.com/) (PostgreSQL) | Base de datos relacional |
| Supabase Auth | Autenticación de usuarios |
| Supabase Storage | Almacenamiento de archivos y fotos |
| Supabase Edge Functions | Lógica de negocio serverless |

---

## ☁️ Despliegue

La aplicación está desplegada manualmente en un **VPS de [Hostinger](https://www.hostinger.mx/)**.

---

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js >= 18
- npm o yarn
- Cuenta de Supabase

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Instalación

```bash
# Clona el repositorio
git clone https://github.com/neurovix/conectatec-web.git
cd conectatec-web

# Instala las dependencias
npm install

# Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run start     # Inicia el servidor en producción
npm run lint      # Ejecuta el linter
```

---

## 📁 Estructura del Proyecto

```
conectatec-web/
├── app/                    # App Router de Next.js
│   ├── (admin)/
│   ├── (api)/
│   ├── (auth)/
│   ├── (home)/
│   └── page.tsx
│   └── layout.tsx
├── utils/                  # Utilidades y configuración de Supabase
├── public/                 # Archivos estáticos
|  .env.local               # Archivo .env
```

---

## 🤝 Contribución

Este proyecto es desarrollado y mantenido por **Neurovix S de RL de CV**. Para reportar bugs o sugerir mejoras, por favor abre un [issue](https://github.com/neurovix/conectatec-web/issues).

---

## 📄 Licencia

Todos los derechos reservados © 2025 **Neurovix S de RL de CV**.

---

<p align="center">
  Hecho con ❤️ para los estudiantes del <strong>TecNM Campus Saltillo</strong>
</p>
