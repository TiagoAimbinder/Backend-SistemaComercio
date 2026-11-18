# Backend Kiosco

API del sistema de kiosco: **NestJS 11 + Sequelize + PostgreSQL**. Mantiene la arquitectura de los backends del ecommerce (CatalogService, CartService, UserService, NotificationService) pero usando la inyección de dependencias, pipes y filtros de Nest.

## Puesta en marcha

1. Crear el esquema y cargar los datos en la base PostgreSQL (Render u otra). Se puede hacer con `psql`, o pegando cada archivo en el editor de consultas de pgAdmin o DBeaver, en este orden:

```bash
psql "$DATABASE_URL" -f database/schema.sql            # tablas, constraints e índices (base vacía)
psql "$DATABASE_URL" -f database/seed.sql              # roles y medios de pago
psql "$DATABASE_URL" -f database/data/01_providers.sql # proveedores migrados
psql "$DATABASE_URL" -f database/data/02_products.sql  # productos migrados
```

   `database/data/00_reset.sql` vacía todas las tablas (salvo los catálogos) para volver a cargar.
   Las versiones anteriores para SQL Server quedaron en `database/mssql/`.
2. Copiar `.env.example` a `.env` y completar `DATABASE_URL` (en Render es la *External Database URL*) con `DB_SSL=true`.
3. Instalar y levantar:

```bash
npm install
npm run start:dev
```

La API queda en `http://localhost:3000`, que es el `ApiUrl` del front.

## Usuarios y login

1. Instalar las dependencias nuevas: `npm install` (agrega `@nestjs/jwt` y `@nestjs/throttler`).
2. Completar `JWT_SECRET` en `.env`: mínimo 32 caracteres y distinto en cada entorno.
3. Crear el primer usuario (pide la contraseña por consola):

```bash
npm run build
npm run user:create -- --username admin --name "Pintó Express Admin" --role Gerente
```

Si el usuario ya existe, el mismo comando le cambia la contraseña y lo reactiva.

- **Todas las rutas requieren sesión** (`Authorization: Bearer <token>`), salvo las marcadas con `@Public()`.
- La sesión dura `JWT_EXPIRES_IN` (12 h por defecto, un turno).
- Las contraseñas se guardan con **scrypt**, que viene incluido en Node y no necesita compilar dependencias nativas.
- El login permite 5 intentos por minuto por IP, y devuelve el mismo error tanto si el usuario no existe como si la contraseña es incorrecta.

## Estructura

```
src/
├── main.ts                  Boot: helmet, CORS, ValidationPipe y filtro global
├── app.module.ts            Config + conexión a la base + módulos
├── config/                  Validación de .env (Joi) y conexión Sequelize
├── common/
│   ├── exceptions/          AppException (message + errCode + status)
│   ├── filters/             AllExceptionsFilter -> { message, errCode }
│   ├── types/               ApiResponse / ApiError (los mismos que usa el front)
│   └── utils/               Transforms de DTOs (trim, '' -> null, DECIMAL -> number)
└── modules/
    └── <feature>/
        ├── <Feature>.module.ts      Reemplaza al Container / *.index.js
        ├── controllers/             Reciben, delegan y responden { message, data }
        ├── dto/                     Validación de entrada (class-validator)
        ├── domain/
        │   ├── entities/            Normalización, reglas y respuesta hacia el front
        │   └── services/            Un caso de uso por clase: XxxSrv.execute()
        ├── repositories/            Único acceso a las tablas
        └── models/                  Mapeo Sequelize (sequelize-typescript)
```

### Equivalencias con los backends Express

| Express (ecommerce) | Nest (kiosco) |
|---|---|
| `Container.infra.js` + `*.index.js` | `@Module` de cada feature |
| `routes/route.X.js` + `controllers/X.controller.js` | `controllers/X.controller.ts` con decoradores |
| Schemas Joi + `ValidationMiddleware` | DTOs con class-validator + `ValidationPipe` global |
| `throw { statusCode, message, errCode }` | `throw AppException.notFound(message, errCode)` |
| `try/catch` + `res.status().json()` en cada controller | `AllExceptionsFilter` global |
| `this.transaction()` + commit/rollback | `sequelize.transaction(async (t) => ...)` (rollback automático) |
| `sequelize.sync()` | Desactivado: el esquema está en `database/schema.sql` |
| `node-cron` | `@nestjs/schedule` (para el cierre automático de caja) |

## Convenciones

- **Respuestas:** `{ message, data?, pagination? }`. **Errores:** `{ message, errCode }`.
- **Validación estricta:** el `ValidationPipe` rechaza campos que no estén en el DTO.
- **Strings vacíos** (email, teléfono, código de barras) se guardan como `NULL`.
- **NUMERIC:** Postgres lo devuelve como string; las entidades lo convierten a number.
- **Tablas entre comillas** en SQL a mano (`"Product"`, `"User"`): Postgres pasa a minúscula los nombres sin comillas.
- **Nombres únicos sin distinguir mayúsculas** (proveedores): índice sobre `lower(prov_name)` y búsqueda con `lower()`.
- **Baja lógica:** nada se borra físicamente (`*_active = 0`).
- **Transacciones:** toda escritura que toca más de una fila o valida antes de escribir va en `sequelize.transaction`.
- **Errores de la base:** UNIQUE pasa a 409 `DUPLICATE`, FK a 400 `INVALID_REFERENCE` y CHECK a 400 `CHECK_VIOLATION`.

## Endpoints

### Providers
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/providers` | Proveedores activos |
| POST | `/providers` | Crear (reactiva si existía dado de baja con el mismo nombre) |
| PUT | `/providers/:id` | Editar |
| DELETE | `/providers/:id` | Baja lógica (no si tiene productos activos) |

### Auth / Users
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Pública. `{ usu_username, password }` -> `{ access_token, expires_at, user }` |
| GET | `/auth/me` | Usuario de la sesión |
| GET | `/users` | Usuarios activos con `hasOpenCash` |

### Products
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/products` | Productos activos con `prov_name` |
| POST | `/products` | Crear |
| PUT | `/products/:id` | Editar |
| POST | `/products/delete` | Baja lógica `{ prod_ids }` |
| PUT | `/products/bulk-price` | Cambio masivo `{ prod_ids, mode: 'amount' \| 'percent', value }` |
| POST | `/products/stock-order` | Ingreso de pedido `{ prov_id, items: [{ prod_id, quantity }] }` |

## Pendiente

- Módulos: CashRegister + CashMovement, Sale (venta transaccional, anulación).
- Permisos por rol (hoy cualquier usuario logueado puede todo) y pantalla de Usuarios.
- Cierre automático de caja con `@nestjs/schedule`.
- Ajustar los modelos del front a los nombres de la base (ver DER_Kiosco.xlsx, hoja "Cambios en el front").
