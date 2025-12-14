# Checkpoint v1.1.1 - Dashboard Improvements

**Fecha**: 2025-12-14
**Commit**: 22d47e2

## Cambios Implementados

### 1. Transacciones Recientes Interactivas
- ✅ Agregado click handler para navegar a secciones específicas
- ✅ Ingresos → `/income`
- ✅ Gastos → `/expenses`
- ✅ Tarjetas de crédito → `/credit-cards`
- ✅ Cursor pointer para indicar clickeabilidad
- ✅ Subtítulo "Tus últimos 5 movimientos" agregado

### 2. Mejoras en Etiquetas del Dashboard
- ✅ "Balance" → "Saldo" (terminología más apropiada en español)
- ✅ "Mes actual" → "De este mes" (subtítulos más descriptivos)
- ✅ Ahora se muestra: "Ingresos De este mes", "Gastos De este mes", "Saldo De este mes"

### 3. Actualización de Versión
- ✅ Versión actualizada de 1.1.0 a 1.1.1
- ✅ Actualizado en `package.json`
- ✅ Actualizado en traducciones (`i18n.ts`)

## Archivos Modificados
- `package.json` - Versión actualizada
- `package-lock.json` - Lockfile actualizado
- `src/renderer/pages/Dashboard.tsx` - Transacciones interactivas y subtítulo
- `src/renderer/utils/i18n.ts` - Mejoras en traducciones y versión

## Notas Técnicas
- Todos los cambios mantienen compatibilidad con el código existente
- Hot-reload funcional durante el desarrollo
- Sin breaking changes
