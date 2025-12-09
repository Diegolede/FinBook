# Finanzas Personales - Aplicación de Control Financiero

Una aplicación de escritorio moderna para el control de finanzas personales, construida con Electron, React, TypeScript y SQLite.

## 🚀 Características

- **Dashboard Interactivo**: Vista general de tus finanzas con gráficos y estadísticas
- **Gestión de Transacciones**: Agregar, editar y eliminar ingresos y gastos
- **Categorización**: Organiza tus transacciones por categorías personalizables
- **Reportes Detallados**: Análisis financiero con gráficos y tendencias
- **Almacenamiento Local**: Base de datos SQLite para mantener tus datos seguros
- **Interfaz Moderna**: Diseño limpio y responsive con Tailwind CSS

## 🛠️ Tecnologías Utilizadas

- **Electron**: Framework para aplicaciones de escritorio
- **React**: Biblioteca para la interfaz de usuario
- **TypeScript**: Tipado estático para mejor desarrollo
- **Tailwind CSS**: Framework de estilos utilitarios
- **SQLite**: Base de datos local
- **Chart.js**: Gráficos interactivos
- **Vite**: Herramienta de construcción rápida

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o pnpm

## 🚀 Instalación

1. **Clona el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd finanzas-personales
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   # o
   pnpm install
   ```

3. **Ejecuta la aplicación en modo desarrollo**:
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

## 📦 Scripts Disponibles

- `npm run dev`: Ejecuta la aplicación en modo desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run start`: Ejecuta la aplicación construida
- `npm run dist`: Crea distributables para diferentes plataformas
- `npm run dist:win`: Crea distributivo para Windows
- `npm run dist:linux`: Crea distributivo para Linux

## 🏗️ Estructura del Proyecto

```
finanzas-personales/
├── src/
│   ├── main/                 # Proceso principal de Electron
│   │   ├── main.ts          # Punto de entrada principal
│   │   ├── preload.ts       # Script de precarga
│   │   └── services/        # Servicios del backend
│   │       └── DatabaseService.ts
│   └── renderer/            # Proceso de renderizado (React)
│       ├── components/      # Componentes reutilizables
│       ├── pages/          # Páginas de la aplicación
│       ├── App.tsx         # Componente principal
│       └── main.tsx        # Punto de entrada de React
├── dist/                   # Archivos construidos
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Funcionalidades Principales

### Dashboard
- Resumen financiero con balance, ingresos y gastos
- Gráfico de evolución mensual
- Lista de transacciones recientes

### Transacciones
- Agregar nuevas transacciones (ingresos/gastos)
- Editar transacciones existentes
- Filtrar por tipo, categoría y búsqueda de texto
- Eliminar transacciones

### Categorías
- Gestionar categorías de ingresos y gastos
- Personalizar colores para cada categoría
- Categorías predefinidas incluidas

### Reportes
- Análisis por períodos (semana, mes, año)
- Gráficos de distribución por categorías
- Tendencia mensual de ingresos vs gastos
- Top 5 categorías con mayor gasto

## 💾 Almacenamiento de Datos

La aplicación utiliza SQLite como base de datos local. Los datos se almacenan en:
- **Windows**: `%APPDATA%/.finanzas-app/finanzas.db`
- **Linux**: `~/.finanzas-app/finanzas.db`

## 🎨 Personalización

### Colores
La aplicación utiliza un sistema de colores personalizable definido en `tailwind.config.js`:
- **Primary**: Azul (#3B82F6)
- **Success**: Verde (#10B981)
- **Danger**: Rojo (#EF4444)

### Categorías Predefinidas
- **Ingresos**: Salario, Freelance, Inversiones, Otros Ingresos
- **Gastos**: Alimentación, Transporte, Vivienda, Entretenimiento, Salud, Educación, Otros Gastos

## 🔧 Desarrollo

### Agregar Nuevas Funcionalidades

1. **Backend (Electron)**:
   - Agregar métodos en `DatabaseService.ts`
   - Registrar handlers IPC en `main.ts`

2. **Frontend (React)**:
   - Crear componentes en `src/renderer/components/`
   - Agregar páginas en `src/renderer/pages/`
   - Actualizar rutas en `App.tsx`

### Estructura de Datos

```typescript
// Transacción
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
}

// Categoría
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}
```

## 🚀 Distribución

Para crear distributivos de la aplicación:

```bash
# Para Windows
npm run dist:win

# Para Linux
npm run dist:linux
```

Los archivos se generarán en la carpeta `release/`.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes alguna pregunta:

1. Revisa los issues existentes
2. Crea un nuevo issue con detalles del problema
3. Incluye información sobre tu sistema operativo y versión de Node.js

## 🔄 Actualizaciones

Para mantener la aplicación actualizada:

1. Clona los últimos cambios: `git pull origin main`
2. Instala nuevas dependencias: `npm install`
3. Ejecuta la aplicación: `npm run dev`

---

¡Disfruta gestionando tus finanzas personales de manera eficiente y moderna! 💰 