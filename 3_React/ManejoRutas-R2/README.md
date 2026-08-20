# TaskFlow

Aplicación SPA de gestión de tareas creada con React y Vite. Permite organizar tareas, cambiar su estado y conservar los datos en el navegador.

## Tecnologías

- React 19, Vite y React Router DOM
- Context API y hooks de React
- CSS moderno responsive y LocalStorage

## Instalación

```bash
npm install
npm run dev
```

Luego abrí la dirección que indique Vite. Para generar una compilación de producción: `npm run build`.

## Rutas

- `/`: panel, estadísticas, buscador y filtros.
- `/crear`: formulario validado para una tarea nueva.
- `/tarea/:id`: detalle, cambio de estado y eliminación.
- `*`: página 404.

## Funcionalidades

Incluye datos de ejemplo, creación con ID y fecha de creación automáticos, fecha programada obligatoria, búsqueda por título y descripción, filtros combinables, seis opciones de ordenamiento, agrupación visual por día, conteos, estado vacío, confirmación de eliminación y un modo claro/oscuro persistente. Las tareas se comparten entre páginas mediante `TaskContext`; se guardan en `localStorage` bajo `taskflow-tareas`. El tema se guarda bajo `taskflow-tema`.

El diseño se adapta a móvil, tablet y escritorio sin scroll horizontal.

## Posible evolución a SQL

Ver [docs/database.md](docs/database.md) para una propuesta de esquema relacional, normalización y consideraciones de seguridad.
