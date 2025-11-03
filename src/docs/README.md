# Documentación API - Swagger

Este directorio contiene la documentación de la API en formato YAML para Swagger/OpenAPI 3.0.

## Estructura

-   `pacientes.yaml` - Documentación completa de las rutas de pacientes ✅
-   `doctores.yaml` - Documentación completa de las rutas de doctores ✅
-   `turnos.yaml` - Documentación completa de las rutas de turnos ✅
-   `auth.yaml` - Documentación completa de autenticación ✅
-   `especialidades.yaml` - Documentación completa de especialidades ✅
-   `archivos.yaml` - Documentación completa de gestión de archivos ✅
-   `pagos.yaml` - Documentación completa de pagos ✅
-   `administradores.yaml` - Documentación completa de administradores ✅
-   `mercadopago.yaml` - Documentación completa de MercadoPago ✅
-   `estadisticas.yaml` - Documentación completa de estadísticas ✅

## Documentación Completada

### 📋 Pacientes (`pacientes.yaml`)

-   **POST** `/api/pacientes/registro` - Registrar nuevo paciente
-   **GET** `/api/pacientes` - Obtener todos los pacientes (admin)
-   **GET** `/api/pacientes/dni/{dni}` - Obtener paciente por DNI
-   **GET** `/api/pacientes/{idPaciente}` - Obtener paciente por ID
-   **PUT** `/api/pacientes/{idPaciente}` - Actualizar email y teléfono
-   **PUT** `/api/pacientes/desvincular/{idPaciente}` - Desvincular Google

### 👨‍⚕️ Doctores (`doctores.yaml`)

-   **POST** `/api/doctores` - Registrar nuevo doctor (admin)
-   **GET** `/api/doctores` - Obtener todos los doctores
-   **GET** `/api/doctores/{id}` - Obtener doctor por ID
-   **PUT** `/api/doctores/{id}` - Actualizar doctor (admin/propio)
-   **DELETE** `/api/doctores/{id}` - Eliminar doctor (admin)
-   **GET** `/api/doctores/name` - Buscar doctores por nombre
-   **GET** `/api/doctores/especialidad/{idEspecialidad}` - Doctores por especialidad

### 📅 Turnos (`turnos.yaml`)

-   **POST** `/api/turnos/paciente/{idPaciente}/doctor/{idDoctor}` - Crear turno
-   **GET** `/api/turnos` - Obtener todos los turnos
-   **GET** `/api/turnos/{idTurno}` - Obtener turno por ID
-   **PUT** `/api/turnos/{idTurno}` - Actualizar observaciones
-   **GET** `/api/turnos/paciente/{idPaciente}` - Turnos por paciente
-   **GET** `/api/turnos/doctor/{idDoctor}` - Turnos por doctor
-   **GET** `/api/turnos/doctor/{idDoctor}/fecha` - Turnos por doctor y fecha
-   **GET** `/api/turnos/fecha` - Turnos por fecha
-   **GET** `/api/turnos/estado/pendiente` - Turnos pendientes
-   **GET** `/api/turnos/estado/{estado}/paciente/{idPaciente}` - Turnos por estado y paciente
-   **PUT** `/api/turnos/{idTurno}/cancelado` - Cancelar turno
-   **PUT** `/api/turnos/{idTurno}/realizado` - Marcar como realizado (doctor)
-   **PUT** `/api/turnos/{idTurno}/confirmado` - Confirmar turno (admin)

### 🔐 Autenticación (`auth.yaml`)

-   **POST** `/api/auth/login` - Login con DNI y contraseña
-   **POST** `/api/auth/login/firebase` - Login con Firebase/Google
-   **POST** `/api/auth/vincular-dni` - Vincular DNI a cuenta Firebase
-   **GET** `/api/auth/me` - Obtener perfil del usuario autenticado
-   **POST** `/api/auth/reset-password` - Restablecer contraseña

### 🏥 Especialidades (`especialidades.yaml`)

-   **POST** `/api/especialidades` - Crear especialidad (admin)
-   **GET** `/api/especialidades` - Obtener todas las especialidades
-   **GET** `/api/especialidades/{id}` - Obtener especialidad por ID
-   **PUT** `/api/especialidades/{id}` - Actualizar especialidad (admin)
-   **DELETE** `/api/especialidades/{id}` - Eliminar especialidad (admin)

### 📁 Archivos (`archivos.yaml`)

-   **POST** `/api/archivos/{idTurno}` - Subir archivo a un turno
-   **DELETE** `/api/archivos/{idArchivo}` - Eliminar archivo

### 💰 Pagos (`pagos.yaml`)

-   **POST** `/api/pagos` - Crear un nuevo pago
-   **GET** `/api/pagos/{idPago}` - Obtener pago por ID
-   **PUT** `/api/pagos/{idPago}` - Actualizar estado del pago (admin)
-   **GET** `/api/pagos/turno/{idTurno}` - Obtener pagos por turno
-   **GET** `/api/pagos/estado/{estado}` - Obtener pagos por estado (admin)

### 👑 Administradores (`administradores.yaml`)

-   **POST** `/api/administradores/register` - Registrar nuevo administrador (admin)
-   **GET** `/api/administradores` - Obtener todos los administradores (admin)

### 💳 MercadoPago (`mercadopago.yaml`)

-   **POST** `/api/mercadoPago/crear-preferencia/{idDoctor}/turno/{idTurno}` - Crear preferencia de pago
-   **POST** `/api/mercadoPago/webhook` - Webhook para notificaciones de MercadoPago

### 📊 Estadísticas (`estadisticas.yaml`)

-   **GET** `/api/estadisticas/resumen` - Resumen general de estadísticas
-   **GET** `/api/estadisticas/turnos-por-especialidad` - Turnos por especialidad
-   **GET** `/api/estadisticas/horarios-mas-solicitados` - Horarios más populares
-   **GET** `/api/estadisticas/turnos-por-doctor` - Turnos por doctor
-   **GET** `/api/estadisticas/turnos-por-mes` - Evolución mensual de turnos
-   **GET** `/api/estadisticas/estados-turnos` - Distribución por estado
-   **GET** `/api/estadisticas/ingresos-por-especialidad` - Ingresos por especialidad
-   **GET** `/api/estadisticas/turnos-por-dia-semana` - Distribución por día de semana
-   **GET** `/api/estadisticas/ingresos-por-mes` - Evolución mensual de ingresos
-   **GET** `/api/estadisticas/top-doctores-solicitados` - Ranking de doctores más solicitados

### 📊 **Total documentado:**

-   **47 endpoints** completamente documentados
-   **10 módulos** principales cubiertos
-   **25+ schemas** reutilizables definidos
-   **Autenticación JWT** configurada

## Documentación API - Swagger

Este directorio contiene la documentación de la API en formato YAML para Swagger/OpenAPI 3.0.

## Estructura

-   `pacientes.yaml` - Documentación completa de las rutas de pacientes
-   (Futuro) `doctores.yaml` - Documentación de las rutas de doctores
-   (Futuro) `turnos.yaml` - Documentación de las rutas de turnos
-   (Futuro) `auth.yaml` - Documentación de autenticación
-   etc.

## Ventajas de esta estructura

1. **Archivos de rutas limpios**: Las rutas quedan sin comentarios de documentación
2. **Documentación organizada**: Cada módulo tiene su propio archivo de documentación
3. **Fácil mantenimiento**: Cambios en la documentación no afectan el código
4. **Reutilización**: Los schemas se pueden reutilizar entre diferentes endpoints
5. **Mejor legibilidad**: La documentación está separada del código de lógica

## Formato YAML

Los archivos YAML siguen el estándar OpenAPI 3.0 y contienen:

-   **paths**: Definición de endpoints y sus métodos HTTP
-   **components/schemas**: Modelos de datos reutilizables
-   **components/securitySchemes**: Configuración de autenticación

## Cómo agregar nueva documentación

1. Crear un nuevo archivo `.yaml` en este directorio
2. Definir los paths y schemas siguiendo el mismo formato
3. La configuración de Swagger automáticamente incluirá el nuevo archivo

## Ejemplo de uso

Para documentar un nuevo endpoint, simplemente agrega la definición en el archivo YAML correspondiente:

```yaml
paths:
    /api/nuevo-endpoint:
        get:
            tags:
                - NuevoModulo
            summary: Descripción breve
            description: Descripción detallada
            responses:
                '200':
                    description: Respuesta exitosa
```

Los archivos se cargan automáticamente cuando se inicia el servidor.
