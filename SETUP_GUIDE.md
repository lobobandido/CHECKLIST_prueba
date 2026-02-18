# Guía de Configuración Rápida

Esta guía te ayudará a configurar y ejecutar tu sistema de inspecciones en minutos.

## Paso 1: Configurar Supabase

### Actualizar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

Puedes encontrar estas credenciales en tu dashboard de Supabase:
- Ve a Settings > API
- Copia la URL del proyecto
- Copia la clave anon/public

## Paso 2: Crear Primer Usuario Administrador

La base de datos ya está configurada, pero necesitas crear tu primer usuario administrador:

### Opción A: Usando el Dashboard de Supabase

1. Ve a tu proyecto en Supabase
2. Navega a Authentication > Users
3. Haz clic en "Add User"
4. Completa:
   - Email: tu-email@empresa.com
   - Password: una contraseña segura
   - Confirma la contraseña

5. Copia el UUID del usuario creado (se muestra en la lista)

6. Ve a SQL Editor y ejecuta:

```sql
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'pega-aqui-el-uuid-del-usuario',
  'tu-email@empresa.com',
  'Tu Nombre Completo',
  'admin'
);
```

### Opción B: Usando SQL Editor Directo

Ejecuta este script en SQL Editor (reemplaza los valores):

```sql
-- 1. Primero verifica los usuarios existentes
SELECT id, email FROM auth.users;

-- 2. Si necesitas crear uno nuevo y agregarle perfil:
-- (Nota: Esto requiere que uses el método de registro normal primero)

-- 3. Para un usuario existente sin perfil:
INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  'Nombre del Administrador',
  'admin'
FROM auth.users
WHERE email = 'admin@empresa.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

## Paso 3: Ejecutar la Aplicación

```bash
npm install
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

## Paso 4: Primer Inicio de Sesión

1. Abre http://localhost:5173 en tu navegador
2. Ingresa con las credenciales del administrador que creaste
3. Deberías ver el panel principal con acceso a todas las funciones

## Paso 5: Configuración Inicial del Sistema

Una vez dentro como administrador, configura los catálogos:

### 5.1 Verificar Tipos de Vehículos

Ve a Administración > Tipos de Vehículo

Los tipos predefinidos son:
- Tractocamión
- Caja seca
- Camioneta
- Dolly
- Contenedor

Puedes agregar más o editar los existentes.

### 5.2 Verificar Partes de Inspección

Ve a Administración > Partes de Inspección

Las partes predefinidas son:
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

Puedes personalizar esta lista según tus necesidades.

### 5.3 Registrar Unidades

Ve a Administración > Unidades

Agrega tus vehículos:
- Selecciona el tipo de unidad
- Ingresa el número de unidad (obligatorio)
- Agrega placas, marca, modelo, año (opcional)

### 5.4 Crear Usuarios

Ve a Administración > Usuarios

Crea usuarios para tu equipo:

**Para un Supervisor:**
- Nombre completo
- Email
- Contraseña
- Rol: Supervisor

**Para un Chofer:**
- Nombre completo
- Email
- Contraseña
- Rol: Chofer

## Paso 6: Realizar Primera Inspección

1. Ve a "Nueva Inspección"
2. Selecciona tipo de unidad
3. Elige una unidad
4. Selecciona tipo de inspección (Salida/Retorno)
5. Elige el chofer
6. Completa el checklist
7. Agrega fotos o videos (opcional)
8. Firma como inspector
9. Obtén la firma del chofer
10. Completa la inspección

El sistema generará automáticamente:
- Un folio consecutivo
- Un PDF descargable
- Un registro en el historial

## Solución de Problemas Comunes

### Error: "Missing Supabase environment variables"

**Problema**: Las variables de entorno no están configuradas correctamente.

**Solución**:
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Asegúrate de que las variables comienzan con `VITE_`
3. Reinicia el servidor de desarrollo después de modificar `.env`

### Error al iniciar sesión: "Credenciales incorrectas"

**Problema**: El usuario no existe o no tiene perfil en la tabla `profiles`.

**Solución**:
1. Verifica que el usuario existe en Authentication > Users
2. Ejecuta la consulta SQL para verificar si tiene perfil:
```sql
SELECT * FROM profiles WHERE email = 'tu-email@empresa.com';
```
3. Si no tiene perfil, créalo con el script del Paso 2

### No puedo subir fotos o videos

**Problema**: El bucket de almacenamiento no está configurado o las políticas no están activas.

**Solución**: Las políticas ya están configuradas en la migración inicial. Si tienes problemas:
1. Ve a Storage en Supabase
2. Verifica que existe el bucket "inspection-evidence"
3. Revisa las políticas en Storage > Policies

### El PDF no se genera correctamente

**Problema**: Falta algún dato o las firmas no están capturadas.

**Solución**:
1. Asegúrate de que ambas firmas estén capturadas
2. Verifica que todos los campos obligatorios estén completos
3. Revisa la consola del navegador para mensajes de error

## Personalización Avanzada

### Cambiar los colores del tema

Edita `src/index.css` y las clases de Tailwind en los componentes.

### Agregar más campos a las inspecciones

1. Modifica el schema de la base de datos
2. Actualiza los tipos en `src/lib/database.types.ts`
3. Modifica el formulario en `src/components/InspectionForm.tsx`
4. Actualiza el generador de PDF en `src/services/pdfGenerator.ts`

### Personalizar el checklist por tipo de vehículo

1. Ve a Administración > Tipos de Vehículo
2. Crea o edita un tipo
3. Ve a Administración > Partes de Inspección
4. Crea las partes específicas
5. La asociación se hace automáticamente, pero puedes personalizarla en la base de datos

## Respaldo y Mantenimiento

### Respaldo de la Base de Datos

Supabase hace respaldos automáticos, pero puedes exportar manualmente:
1. Ve a Database > Backups en Supabase
2. Descarga un respaldo cuando lo necesites

### Respaldo de Archivos Multimedia

Los archivos en Storage también tienen respaldo automático, pero puedes:
1. Ir a Storage > inspection-evidence
2. Descargar carpetas completas si es necesario

### Actualización del Sistema

Para actualizar dependencias:
```bash
npm update
npm run build
```

## Soporte

Para preguntas o problemas:
1. Revisa la documentación en README.md
2. Consulta la consola del navegador para errores
3. Verifica los logs de Supabase en el dashboard

## Próximos Pasos

Una vez configurado:
1. Capacita a tu equipo en el uso del sistema
2. Realiza inspecciones de prueba
3. Ajusta los catálogos según tus necesidades
4. Configura procesos internos para el seguimiento de inspecciones
5. Establece políticas de respaldo y mantenimiento

Tu sistema está listo para producción.
