# Brevicritic

App de críticas breves de cine. Los usuarios pueden reseñar películas, reaccionar a reseñas de otros, seguir perfiles y recibir notificaciones — todo bajo un modelo de privacidad granular aplicado a nivel de base de datos.

> Proyecto de portfolio — backend REST API. Frontend en desarrollo.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express 5 |
| Base de datos | PostgreSQL |
| Caché / Sesiones | Redis |
| Autenticación | JWT (access) + tokens opacos (refresh) |
| Testing | Jest + Supertest |
| Integración externa | TMDB API |

---

## Arquitectura

### Estructura de módulos

```
server/src/
├── config/
│   └── env.ts                  # Variables de entorno con validación estricta
├── db/
│   ├── pool.ts                 # Pool de conexiones PG (app_service + admin)
│   ├── redis.ts                # Cliente Redis con lazyConnect
│   └── withUser.ts             # Helper de transacción con contexto de usuario
├── modules/
│   ├── auth/                   # Registro, login, logout, refresh
│   ├── profiles/               # CRUD de perfiles, búsqueda, soft delete
│   ├── reviews/                # CRUD de reseñas
│   ├── follows/                # Seguir / dejar de seguir
│   ├── reactions/              # Like / dislike en reseñas
│   ├── notifications/          # Sistema de notificaciones
│   └── movies/                 # Integración con TMDB + caché en DB
├── shared/
│   ├── errors/AppError.ts      # Error tipado con statusCode
│   ├── middleware/
│   │   └── authenticate.ts     # Verificación JWT sin query a DB
│   └── utils/
│       ├── cookies.ts          # Helpers de cookies httpOnly
│       └── tokens.ts           # Generación y rotación de tokens
└── tests/                      # Tests de integración por módulo
```

Cada módulo sigue la misma convención de capas:

```
router → validator → controller → service → queries
```

---

## Decisiones de arquitectura

### Row Level Security (RLS) en PostgreSQL

Cada tabla sensible tiene políticas RLS que determinan qué filas puede ver o modificar cada usuario.

```sql
-- Un usuario solo puede ver reviews de perfiles públicos
-- o de usuarios a quienes sigue
CREATE POLICY reviews_select_allowed ON app.reviews
FOR SELECT USING (
  user_id = auth.current_user_id()
  OR EXISTS (
    SELECT 1 FROM app.profiles p
    WHERE p.id = reviews.user_id
      AND (p.is_public = true
        OR EXISTS (
          SELECT 1 FROM app.follows f
          WHERE f.follower_id = auth.current_user_id()
            AND f.followed_id = p.id
        ))
  )
);
```

El contexto del usuario se establece por transacción via `set_config`:

```typescript
// db/withUser.ts
await client.query(`SELECT set_config('app.current_user_id', $1, true)`, [userId]);
```

Esto significa que aunque el código de aplicación tuviera un bug de autorización, la DB rechazaría la operación de todas formas.

---

### Separación de roles en DB

La aplicación usa dos roles de PostgreSQL con permisos distintos:

| Rol | Uso | Permisos |
|---|---|---|
| `app_service` | Queries de la app | DML sobre tablas de app, funciones SECURITY DEFINER |
| `admin` | Tests y migraciones | Acceso completo, bypass de RLS |

Esto permite que los tests usen `adminPool` para setup/teardown sin interferir con RLS, mientras que las queries reales corren con `app_service`.

---

### Autenticación con doble token

```
Login
  ├── Access token  (JWT, 15min)  → cookie httpOnly
  └── Refresh token (opaco, 7d)  → cookie httpOnly + Redis

Request autenticado
  └── Middleware verifica JWT localmente (sin query a DB)

POST /auth/refresh
  ├── Verifica refresh token en Redis
  ├── Revoca el token usado
  └── Emite nuevos access + refresh tokens (rotación)

Logout / Delete account
  └── Revoca refresh token en Redis + limpia cookies
```
---

### Soft delete de usuarios

La eliminación de cuenta no borra datos — marca `is_active = false` en `auth.users`. La función corre con `SECURITY DEFINER` porque `app_service` no tiene acceso directo a `auth.users`:

```sql
CREATE FUNCTION auth.soft_delete_user(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users SET is_active = false WHERE id = p_user_id;
  -- Raises exception si el usuario no existe
END;
$$;
```

Requiere confirmación de contraseña antes de ejecutarse.

---

### Caché de películas con TMDB

Las películas se cachean en `app.movies` con un TTL de 7 días. Si los datos están frescos se sirven desde la DB; si están desactualizados se re-fetchean de TMDB y se actualizan con `ON CONFLICT DO UPDATE`.

```typescript
const existing = await findMovieById(tmdbId);
if (existing && !isStale(existing.fetchedAt)) return existing;
const tmdbMovie = await getMovieById(tmdbId);
return upsertMovie(tmdbMovie);
```

---

## API — endpoints principales

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/register` | Registro con tokens |
| `POST` | `/auth/login` | Login con tokens |
| `POST` | `/auth/refresh` | Rotación de refresh token |
| `POST` | `/auth/logout` | Revocación de refresh token |

### Perfiles
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/profiles/me` | Perfil propio |
| `PATCH` | `/profiles/me` | Actualizar perfil |
| `DELETE` | `/profiles/me` | Soft delete con contraseña |
| `GET` | `/profiles/:username` | Perfil público (con RLS) |
| `GET` | `/profiles` | Búsqueda de perfiles |
| `POST` | `/profiles/:username/follow` | Seguir usuario |
| `DELETE` | `/profiles/:username/follow` | Dejar de seguir |

### Reseñas
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/reviews` | Crear reseña |
| `GET` | `/reviews/:id` | Ver reseña (con RLS) |
| `PATCH` | `/reviews/:id` | Editar reseña propia |
| `DELETE` | `/reviews/:id` | Eliminar reseña propia |
| `GET` | `/profiles/:username/reviews` | Reseñas de un usuario |
| `POST` | `/reviews/:id/reactions` | Like / dislike |
| `DELETE` | `/reviews/:id/reactions` | Quitar reacción |

### Otros
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/movies/:tmdbId` | Detalle de película (caché) |
| `GET` | `/movies/search` | Búsqueda en TMDB |
| `GET` | `/notifications` | Notificaciones del usuario |
| `PATCH` | `/notifications/:id/read` | Marcar como leída |
| `PATCH` | `/notifications/read-all` | Marcar todas como leídas |
| `DELETE` | `/notifications/:id` | Eliminar notificación |

---

## Testing

Tests de integración con DB y Redis reales.

Los tests cubren:

- Autenticación — rotación de refresh tokens, logout, tokens inválidos
- Perfiles — visibilidad pública/privada, RLS en acción, soft delete
- Reseñas — creación, edición, eliminación, acceso según privacidad
- Notificaciones — generación automática, filtros, lectura

---

## Roadmap

- [ ] Docker Compose — PostgreSQL + Redis + app
- [ ] Frontend en React + TypeScript
- [ ] Rate limiting
- [ ] Deploy

---

## Autor

Desarrollado como proyecto de portfolio.