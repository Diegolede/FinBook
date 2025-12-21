# Checkpoint v1.1.2 - Sección de Notas y Animaciones

**Fecha**: 2025-12-21
**Versión**: 1.1.2

## Cambios Implementados

### 1. Sección de Notas (Checklist)
- ✅ Implementación de base de datos (`checklist_items` en SQLite).
- ✅ Widget de Checklist con estilo Bento Grid.
- ✅ Funcionalidad completa: Agregar, Completar, Eliminar.
- ✅ Persistencia de datos.
- ✅ Ordenamiento en móvil (aparece primero) y desktop (aparece a la derecha).

### 2. Mejoras Visuales
- ✅ Animación de rotación en el icono de configuración (engranaje girando).
- ✅ Animación de zoom (`hover:scale-[1.02]`) en el widget de notas.
- ✅ Estética monocromática (negro/gris/blanco) en notas para consistencia.

## Archivos Modificados
- `package.json` - Versión actualizada a 1.1.2.
- `src/main/services/DatabaseService.ts` - Tabla y métodos para notas.
- `src/main/main.ts` - IPC handlers para notas.
- `src/main/preload.ts` - Exposición de API para notas.
- `src/renderer/components/ChecklistWidget.tsx` - Nuevo componente de notas.
- `src/renderer/components/StaticMenu.tsx` - Animación de engranaje.
- `src/renderer/pages/Dashboard.tsx` - Integración de notas y ajustes de layout.
