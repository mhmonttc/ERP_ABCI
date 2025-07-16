## Estructura del Proyecto

Este proyecto sigue una estructura de directorios organizada para facilitar el desarrollo y mantenimiento. A continuación, se describe cada directorio principal:

-   **`/public`**: Contiene archivos estáticos como imágenes y activos que son servidos directamente por el servidor web.
-   **`/src`**: Contiene el código fuente principal de la aplicación.
    -   **`/src/app`**: Directorio principal de la aplicación Next.js, siguiendo el App Router.
        -   **`/src/app/api`**: Contiene los endpoints de la API RESTful de la aplicación. Cada subdirectorio dentro de `api` representa una ruta de API (ej., `agendamientos`, `clientes`, `productos`).
            -   **`/src/app/api/db.ts`**: Archivo para la configuración de la base de datos (actualmente vacío, la configuración está en `src/app/db/mssql.ts`).
        -   **`/src/app/carrito`**: Contiene los componentes y la lógica relacionada con la funcionalidad del carrito de compras y agendamiento.
        -   **`/src/app/db`**: Contiene la configuración y utilidades para la conexión a la base de datos.
            -   **`/src/app/db/mssql.ts`**: Configuración y función de conexión para la base de datos MSSQL.
    -   **`/src/controllers`**: (Actualmente vacío) Destinado a contener la lógica de negocio y controladores para las rutas de la API.
    -   **`/src/models`**: (Actualmente vacío) Destinado a contener las definiciones de modelos de datos.
    -   **`/src/views`**: Contiene los componentes de la interfaz de usuario (páginas o vistas) que se renderizan en el panel de administración. Cada archivo representa una sección o módulo del panel.
    -   **`/src/services`**: Contiene la lógica de negocio y las operaciones de alto nivel, orquestando las interacciones con los repositorios.
    -   **`/src/repositories`**: Contiene las funciones de acceso a la base de datos, encapsulando las operaciones CRUD y las consultas SQL.

## Configuración de la Base de Datos

La aplicación se conecta a una base de datos MSSQL utilizando el paquete `mssql`. La configuración de la conexión se gestiona a través de variables de entorno para mayor seguridad y flexibilidad.

-   **Archivo de Configuración**: [`src/app/db/mssql.ts`](src/app/db/mssql.ts:7)
-   **Variables de Entorno Requeridas**:
    -   `DB_USER`: Nombre de usuario de la base de datos.
    -   `DB_PASSWORD`: Contraseña del usuario de la base de datos.
    -   `DB_SERVER`: Dirección del servidor de la base de datos.
    -   `DB_NAME`: Nombre de la base de datos.

La función `getConnection()` en [`src/app/db/mssql.ts`](src/app/db/mssql.ts:20) establece y mantiene una única conexión a la base de datos.

## Endpoints de la API

La aplicación expone una serie de endpoints RESTful bajo el directorio `/api`. A continuación, se detalla la estructura de los endpoints identificados:

-   **`/api/agendamientos`**
    -   [`/api/agendamientos/route.ts`](src/app/api/agendamientos/route.ts)
    -   [`/api/agendamientos/by-colaborador/route.ts`](src/app/api/agendamientos/by-colaborador/route.ts)
-   **`/api/campanas`**
    -   [`/api/campanas/route.ts`](src/app/api/campanas/route.ts)
    -   [`/api/campanas/uso/route.ts`](src/app/api/campanas/uso/route.ts)
-   **`/api/clientes`**
    -   [`/api/clientes/route.ts`](src/app/api/clientes/route.ts)
    -   [`/api/clientes/[id]/route.ts`](src/app/api/clientes/[id]/route.ts)
    -   [`/api/clientes/login/route.ts`](src/app/api/clientes/login/route.ts)
    -   [`/api/clientes/register/route.ts`](src/app/api/clientes/register/route.ts)
-   **`/api/colaboradores`**
    -   [`/api/colaboradores/route.ts`](src/app/api/colaboradores/route.ts)
    -   [`/api/colaboradores/[id]/route.ts`](src/app/api/colaboradores/[id]/route.ts)
    -   [`/api/colaboradores/search/route.ts`](src/app/api/colaboradores/search/route.ts)
-   **`/api/cupones`**
    -   [`/api/cupones/route.ts`](src/app/api/cupones/route.ts)
    -   [`/api/cupones/[id]/route.ts`](src/app/api/cupones/[id]/route.ts)
    -   [`/api/cupones/uso/route.ts`](src/app/api/cupones/uso/route.ts)
    -   [`/api/cupones/validar/route.ts`](src/app/api/cupones/validar/route.ts)
-   **`/api/ingresos-egresos`**
    -   [`/api/ingresos-egresos/route.ts`](src/app/api/ingresos-egresos/route.ts)
-   **`/api/permisos`**
    -   [`/api/permisos/route.ts`](src/app/api/permisos/route.ts)
-   **`/api/productos`**
    -   [`/api/productos/route.ts`](src/app/api/productos/route.ts)
    -   [`/api/productos/by-sucursal/[sucursalId]/route.ts`](src/app/api/productos/by-sucursal/[sucursalId]/route.ts)
-   **`/api/skills`**
    -   [`/api/skills/route.ts`](src/app/api/skills/route.ts)
    -   [`/api/skills/[id]/route.ts`](src/app/api/skills/[id]/route.ts)
    -   [`/api/skills/by-sucursal/[sucursalId]/route.ts`](src/app/api/skills/by-sucursal/[sucursalId]/route.ts)
-   **`/api/sucursales`**
    -   [`/api/sucursales/route.ts`](src/app/api/sucursales/route.ts)
    -   [`/api/sucursales/[id]/route.ts`](src/app/api/sucursales/[id]/route.ts)
-   **`/api/ventas`**
    -   [`/api/ventas/route.ts`](src/app/api/ventas/route.ts)

## Componentes de la Interfaz de Usuario (Vistas)

El directorio `src/views` contiene los componentes React que forman las diferentes pantallas y módulos del panel de administración.

-   [`src/views/AdminCupones.tsx`](src/views/AdminCupones.tsx)
-   [`src/views/AdminPanel.tsx`](src/views/AdminPanel.tsx)
-   [`src/views/AnalisisFidelizacion.tsx`](src/views/AnalisisFidelizacion.tsx)
-   [`src/views/Caja.tsx`](src/views/Caja.tsx)
-   [`src/views/CampanasFidelizacion.tsx`](src/views/CampanasFidelizacion.tsx)
-   [`src/views/Colaboradores.tsx`](src/views/Colaboradores.tsx)
-   [`src/views/GestionAgendamientos.tsx`](src/views/GestionAgendamientos.tsx)
-   [`src/views/GestionExistencias.tsx`](src/views/GestionExistencias.tsx)
-   [`src/views/GestionIngresosEgresos.tsx`](src/views/GestionIngresosEgresos.tsx)
-   [`src/views/GestionPermisos.tsx`](src/views/GestionPermisos.tsx)
-   [`src/views/GestionProductos.tsx`](src/views/GestionProductos.tsx)
-   [`src/views/GestionUsuariosWeb.tsx`](src/views/GestionUsuariosWeb.tsx)
-   [`src/views/GestorControlCampanas.tsx`](src/views/GestorControlCampanas.tsx)
-   [`src/views/GestorControlCupones.tsx`](src/views/GestorControlCupones.tsx)
-   [`src/views/InformeParticipacion.tsx`](src/views/InformeParticipacion.tsx)
-   [`src/views/InformePerdidas.tsx`](src/views/InformePerdidas.tsx)
-   [`src/views/InformeServicios.tsx`](src/views/InformeServicios.tsx)
-   [`src/views/InformeVentas.tsx`](src/views/InformeVentas.tsx)
-   [`src/views/Liquidaciones.tsx`](src/views/Liquidaciones.tsx)
-   [`src/views/NuevaAgendamiento.tsx`](src/views/NuevaAgendamiento.tsx)
-   [`src/views/Skills.tsx`](src/views/Skills.tsx)
-   [`src/views/Sucursales.tsx`](src/views/Sucursales.tsx)
-   [`src/views/VentaProductos.tsx`](src/views/VentaProductos.tsx)
-   [`src/views/VentaServicios.tsx`](src/views/VentaServicios.tsx)

## Lógica de Negocio y Modelos

La lógica de negocio y el acceso a datos se han separado en los siguientes directorios:

-   **`/src/services`**: Contiene la lógica de negocio de alto nivel.
-   **`/src/repositories`**: Contiene las funciones de acceso a la base de datos.
