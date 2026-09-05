# PetCare

Sistema académico de gestión veterinaria. Separa el cliente React de la API Node/Express y de MySQL; React nunca consulta la base directamente.

## Tecnologías

React 19, Vite, TypeScript, React Router, React Hook Form, Axios, Context API, Bootstrap Grid; Node.js, Express, MySQL, JWT, bcryptjs, CORS y express-validator.

## Puesta en marcha

1. Iniciá Apache/MySQL en XAMPP y ejecutá `database/schema.sql`, seguido de `database/datos.sql`, desde phpMyAdmin.
2. Copiá `backend/.env.example` como `backend/.env`; completá `JWT_SECRET` y las credenciales MySQL.
3. API: `cd backend && npm install && npm run dev`.
4. Frontend principal: `npm install && npm run dev`.
5. Variante useState: `cd frontend-usestate && npm install && npm run dev`.

Cuentas demo: `admin@petcare.local`, `veterinaria@petcare.local` y `cliente@petcare.local`; contraseña temporal `password` (cambiarla al desplegar).

Las credenciales actualmente configuradas son: administrador `admin1234`, veterinaria `veterinaria1234` y cliente `password`.

## Estructura

- `src/`: frontend principal, rutas, Context y servicios Axios.
- `frontend-usestate/`: navegación con `const [pantalla, setPantalla] = useState(...)`, sin React Router y usando la misma API.
- `backend/src/`: configuración, middleware, controladores y rutas REST.
- `database/`: esquema relacional y datos de prueba.

## API

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de cliente |
| POST | `/api/auth/login` | Inicio de sesión/JWT |
| GET | `/api/auth/me` | Usuario autenticado |
| GET/POST/DELETE | `/api/mascotas` | Mascotas del cliente |
| GET/POST | `/api/turnos` | Consultar/solicitar turnos |
| GET | `/api/especies`, `/api/veterinarios` | Catálogos del formulario |
| GET | `/api/admin/resumen` | Métricas administrativas |

## Roles, seguridad y modelo

Roles: Administrador, Veterinario y Cliente. JWT se envía en `Authorization: Bearer` y el backend comprueba token, rol y propiedad del recurso. Las contraseñas se almacenan con bcrypt; las consultas son parametrizadas y `.env` queda excluido de Git.

Relaciones: `roles → usuarios`; usuarios pueden vincularse a clientes o veterinarios; clientes poseen mascotas; especies poseen razas; mascotas y veterinarios se relacionan con turnos; un turno puede tener una consulta. Los catálogos eliminan valores repetidos (1FN), cada atributo depende de su clave (2FN) y roles/especialidades/razas/estados se separan para eliminar dependencias transitivas (3FN).

## React aplicado

`useState` maneja modales, errores y la segunda navegación; `useEffect` recupera sesión y consulta API; `useForm` valida login, registro, mascotas y turnos. `AuthContext` expone usuario, login y logout. Token y tema se persisten en `localStorage`. La interfaz es responsive y cuenta con tema claro/oscuro.
