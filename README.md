# Soldaduras Zamora

Tienda online de productos de soldadura construida con Node.js, Express, MongoDB y Tailwind CSS. Incluye autenticación de usuarios, administración de productos y categorías, carrito de compras, y una integración con PayPal Sandbox.

## Características

- Registro y login de usuarios
- Autenticación con JWT almacenado en cookie HTTP-only
- Roles de usuario: `cliente` y `admin`
- Gestión de productos: listar, buscar, crear, editar y eliminar
- Gestión de categorías: listar, crear, editar y eliminar
- Checkout con PayPal Sandbox
- Guardado de pedidos y actualización de stock en MongoDB
- Frontend estático servido desde la carpeta `views`

## Tecnologías

- Node.js
- Express
- MongoDB / Mongoose
- Tailwind CSS
- JWT
- bcrypt
- PayPal Checkout
- axios

## Estructura principal

- `app.js` - Configuración del servidor Express, middlewares y rutas
- `index.js` - Punto de entrada que inicia el servidor
- `config.js` - Variables de configuración según el entorno
- `controllers/` - Controladores de rutas y lógica de negocio
- `middleware/` - Middlewares de autenticación y autorización
- `models/` - Modelos de datos de Mongoose
- `views/` - Páginas estáticas del frontend
- `src/` - Archivos CSS de Tailwind (entrada y salida)

## Requisitos

- Node.js 18+ (recomendado)
- npm
- MongoDB funcionando localmente o remoto

## Instalación

1. Clona el repositorio o copia los archivos al directorio de trabajo.
2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con las variables necesarias.

## Variables de entorno

Configura las siguientes variables en tu archivo `.env`:

```env
ACCESS_TOKEN_SECRET=tu_secreto_para_jwt
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_SECRET=tu_paypal_secret
ABSTRACT_API_KEY=tu_api_key_abstract
MONGO_URI_TEST=tu_uri_mongodb_para_desarrollo
MONGO_URI_PROD=tu_uri_mongodb_para_produccion
```

> En `config.js`, `PAGE_URL` está configurado para usar `http://localhost:3003` en desarrollo. Ajusta según tus necesidades.

## Scripts disponibles

- `npm run dev` - Inicia la aplicación en modo desarrollo con `nodemon` y `NODE_ENV=dev`
- `npm run start` - Inicia la aplicación en producción con `NODE_ENV=production`
- `npm run build:css` - Compila el CSS de Tailwind en `src/output.css` con minificación
- `npm run watch:css` - Observa cambios en `src/input.css` y recompila automáticamente
- `npm run talwind-build` - Ejecuta Tailwind con watch según la configuración actual

## Uso

1. Arranca el servidor:

```bash
npm run dev
```

2. Abre el navegador en:

```bash
http://localhost:3000/
```

3. Navega a las páginas disponibles:

- `/` - Página principal
- `/signup` - Registro de usuario
- `/login` - Inicio de sesión
- `/catalogo` - Catálogo de productos
- `/cart` - Carrito de compras
- `/nuevoProd` - Gestión de nuevos productos
- `/terms` - Términos y condiciones
- `/privacy` - Política de privacidad

## API REST

### Autenticación

- `POST /api/signup` - Registra un nuevo usuario
- `POST /api/login` - Inicia sesión y crea cookie `access_token`
- `GET /api/logout` o `POST /api/logout` - Cierra sesión y elimina la cookie
- `GET /api/me` - Obtiene datos del usuario autenticado (requiere cookie)

### Productos

- `GET /api/products` - Lista todos los productos
- `GET /api/products/:id` - Obtiene un producto por ID
- `POST /api/products` - Crea un producto nuevo (requiere rol `admin`)
- `PUT /api/products/:id` - Actualiza un producto (requiere rol `admin`)
- `DELETE /api/products/:id` - Elimina un producto (requiere rol `admin`)

### Categorías

- `GET /api/categories` - Lista todas las categorías
- `GET /api/categories/:id` - Obtiene una categoría por ID
- `POST /api/categories` - Crea una categoría nueva
- `PUT /api/categories/:id` - Actualiza una categoría
- `DELETE /api/categories/:id` - Elimina una categoría

### PayPal

- `POST /create-order` - Crea una orden en PayPal Sandbox
- `POST /capture-order` - Captura el pago en PayPal, guarda el pedido y actualiza stock

## Notas importantes

- La integración de PayPal actualmente usa `https://api-m.sandbox.paypal.com` para pruebas.
- El validador de email usa la API de Abstract: si no tienes la clave, el registro seguirá funcionando pero la validación de correo puede no ser completa.
- Las rutas de administración de productos requieren que el usuario autenticado tenga el rol `admin`.

## Mejoras sugeridas

- Agregar pruebas automatizadas
- Manejo de errores del frontend
- Internacionalización de mensajes
- Implementación de un panel administrativo real

## Pruebas PayPal

- sb-67pc252409287@personal.example.com
- 4rS0O#(U
  
---
