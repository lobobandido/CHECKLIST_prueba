# Sistema de Gestión de Inspecciones de Transporte

Aplicación web completa para la gestión de inspecciones de unidades de transporte y logística con evidencia digital, firmas electrónicas y generación de reportes en PDF.

## Características Principales

### Gestión de Inspecciones
- Inspecciones de salida y retorno al patio de maniobras
- Checklists dinámicos basados en el tipo de unidad
- Captura de evidencia multimedia (fotos y videos)
- Firmas digitales de inspector y chofer
- Generación automática de folios consecutivos
- Exportación de reportes en PDF

### Tipos de Unidades Soportadas
- Tractocamión
- Caja seca
- Camioneta
- Dolly
- Contenedor

### Elementos de Inspección
- Espejos
- Llantas
- Puertas
- Cofre
- Defensa
- Salpicaderas
- Golpes visibles
- Luces
- Parabrisas
- Condiciones generales

### Roles de Usuario
1. **Administrador**: Acceso completo al sistema, gestión de catálogos y usuarios
2. **Supervisor**: Creación de inspecciones y consulta de historial
3. **Chofer**: Visualización de inspecciones y firma digital

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Generación PDF**: jsPDF + jsPDF-AutoTable
- **Firmas digitales**: react-signature-canvas
- **Iconos**: Lucide React

## Configuración Inicial

### 1. Configurar Variables de Entorno

Actualiza el archivo `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Base de Datos

La base de datos ya está configurada con:
- Tablas para perfiles, vehículos, inspecciones y evidencias
- Políticas de seguridad (RLS) configuradas
- Tipos de vehículos y partes de inspección predefinidos
- Bucket de almacenamiento para evidencia multimedia

### 4. Crear Primer Usuario Administrador

Debes crear el primer usuario administrador manualmente:

1. Accede a tu dashboard de Supabase
2. Ve a Authentication > Users > Add User
3. Crea un usuario con email y contraseña
4. En la sección SQL Editor, ejecuta:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'uuid-del-usuario-creado',
  'admin@tuempresa.com',
  'Administrador Principal',
  'admin'
);
```

## Ejecutar la Aplicación

### Modo Desarrollo
```bash
npm run dev
```

### Construir para Producción
```bash
npm run build
```

### Vista Previa de Producción
```bash
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── admin/              # Componentes del panel de administración
│   │   ├── VehiclesManager.tsx
│   │   ├── UsersManager.tsx
│   │   ├── VehicleTypesManager.tsx
│   │   └── InspectionPartsManager.tsx
│   ├── AdminPanel.tsx      # Panel principal de administración
│   ├── InspectionForm.tsx  # Formulario de inspección
│   ├── InspectionHistory.tsx # Historial de inspecciones
│   ├── Layout.tsx          # Layout principal
│   ├── Login.tsx           # Pantalla de inicio de sesión
│   └── SignatureCanvas.tsx # Captura de firmas
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticación
├── lib/
│   ├── database.types.ts   # Tipos de TypeScript para la BD
│   └── supabase.ts         # Cliente de Supabase
├── services/
│   └── pdfGenerator.ts     # Generación de PDFs
├── App.tsx                 # Componente principal
└── main.tsx               # Punto de entrada
```

## Flujo de Trabajo

### Para Supervisores/Administradores

1. **Crear Nueva Inspección**
   - Seleccionar tipo de unidad
   - Elegir la unidad específica
   - Indicar tipo de inspección (salida/retorno)
   - Seleccionar al chofer

2. **Realizar Checklist**
   - Marcar cada elemento como: Sin daño, Con daño, o No aplica
   - Agregar notas específicas según sea necesario

3. **Capturar Evidencia**
   - Tomar fotografías de daños o condiciones relevantes
   - Grabar videos cortos (máximo 2 minutos)

4. **Firmas Digitales**
   - Inspector firma la inspección
   - Chofer firma para validar

5. **Finalizar**
   - Sistema genera folio automático
   - Se crea PDF descargable
   - Registro queda en historial

### Para Choferes(puede omitirse el accesos a choferes y solo se referncia de quien trasnporta)

- Consultar historial de inspecciones de sus unidades
- Descargar reportes en PDF
- Visualizar detalles de inspecciones previas

### Para Administradores

Gestión completa de catálogos:
- Usuarios y roles
- Unidades de transporte
- Tipos de vehículos
- Partes de inspección
- Eliminación de registros del historial

## Funcionalidades Especiales

### Búsqueda y Filtros
- Búsqueda por folio, unidad o placas
- Filtros por tipo de inspección (salida/retorno)
- Ordenamiento cronológico

### Seguridad
- Autenticación obligatoria
- Políticas de seguridad a nivel de base de datos (RLS)
- Almacenamiento seguro de evidencia multimedia
- Control de acceso basado en roles

### Trazabilidad
- Registro de fecha y hora automático
- Folios consecutivos únicos
- Historial completo de todas las inspecciones
- Firmas digitales con marca de tiempo

### Generación de PDF
- Diseño profesional con encabezados
- Información completa de la inspección
- Tabla detallada del checklist
- Firmas digitales incluidas
- Listado de evidencia adjunta

## Diseño Responsive

La aplicación está optimizada para:
- Computadoras de escritorio
- Tablets
- Teléfonos móviles

Funciona perfectamente en navegadores modernos y puede ser instalada como PWA (Progressive Web App).

## Soporte y Mantenimiento

### Respaldos
Se recomienda configurar respaldos automáticos en Supabase para:
- Base de datos (inspecciones, usuarios, catálogos)
- Archivos multimedia (fotos y videos)

### Escalabilidad
El sistema está diseñado para escalar y soportar:
- Miles de inspecciones
- Múltiples usuarios concurrentes
- Grandes volúmenes de evidencia multimedia

## Licencia

Este proyecto es privado y confidencial.
