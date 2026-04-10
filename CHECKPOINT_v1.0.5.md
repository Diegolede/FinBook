# Checkpoint v1.0.5 - Sección de Notas y Animaciones

**Fecha**: 2025-12-21
**Versión**: 1.0.5

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
- `package.json` - Versión actualizada a 1.0.5.
- `src/main/services/DatabaseService.ts` - Tabla y métodos para notas.
- `src/main/main.ts` - IPC handlers para notas.
- `src/main/preload.ts` - Exposición de API para notas.
- `src/renderer/components/ChecklistWidget.tsx` - Nuevo componente de notas.
- `src/renderer/components/StaticMenu.tsx` - Animación de engranaje.
- `src/renderer/pages/Dashboard.tsx` - Integración de notas y ajustes de layout.

### 3. Corrección de Cálculo de Vencimientos (Tarjetas de Crédito)
- ✅ Solucionado un problema de zona horaria al parsear fechas (las fechas a inicio de mes a menudo saltaban al mes anterior).
- ✅ Ajuste en la lógica de las **cuotas**: ahora las sumatorias de las cuotas adeudadas en el mes actual se integran de manera robusta y constante al cierre del mes ignorando los pagos contabilizados a futuro para evitar que desaparezcan adelantado.
- ✅ Los gastos "Normales" de 1 cuota únicamente se listan para el mes exacto de su fecha de cargo.
- ✅ Los gastos "Fijos" continúan aplicando en sus meses correspondientes.
- Archivo modificado: `src/renderer/pages/CreditCards.tsx`

### 4. Corrección General de Bug de Zona Horaria en Toda la App
- ✅ `Income.tsx`: Corregido stat "Ingresos del Mes" y filtros de metas mensuales (3 lugares).
- ✅ `Expenses.tsx`: Corregido stat "Gastos del Mes" y filtros de metas mensuales (3 lugares).
- ✅ `Dashboard.tsx`: Corregido ordenamiento de "Últimas Transacciones" y formato de fecha — ya no usa `new Date(dateStr)` que desplaza días en UTC-3.
- Se aplicó el mismo patrón consistente `parseDateParts()` en todos los archivos (extrae año/mes directamente del string `YYYY-MM-DD` sin conversión UTC).
- Archivos modificados: `Income.tsx`, `Expenses.tsx`, `Dashboard.tsx`

