# Guía de Desarrollo - Finanzas Personales

## 🚀 Configuración del Entorno de Desarrollo

### Requisitos Previos
- Node.js 16+ 
- npm o pnpm
- Git

### Instalación Inicial
```bash
# Clonar el repositorio
git clone <repository-url>
cd finanzas-personales

# Instalar dependencias
npm install

# Compilar el proceso principal
npm run build:main

# Ejecutar en modo desarrollo
npm run dev
```

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos
```
src/
├── main/                 # Proceso principal de Electron
│   ├── main.ts          # Punto de entrada principal
│   ├── preload.ts       # Script de precarga (API bridge)
│   └── services/        # Servicios del backend
│       └── DatabaseService.ts
└── renderer/            # Proceso de renderizado (React)
    ├── components/      # Componentes reutilizables
    ├── pages/          # Páginas de la aplicación
    ├── App.tsx         # Componente principal
    └── main.tsx        # Punto de entrada de React
```

### Flujo de Datos
1. **Frontend (React)** → Solicita datos a través de `window.electronAPI`
2. **Preload Script** → Expone APIs seguras al renderer process
3. **Main Process** → Maneja las solicitudes IPC y accede a la base de datos
4. **Database Service** → Gestiona SQLite y retorna datos

## 🔧 Scripts de Desarrollo

### Comandos Principales
```bash
# Desarrollo
npm run dev              # Ejecuta la app en modo desarrollo
npm run dev:main         # Solo el proceso principal
npm run dev:renderer     # Solo el frontend (Vite dev server)

# Construcción
npm run build            # Construye para producción
npm run build:main       # Compila solo el proceso principal
npm run build:renderer   # Construye solo el frontend

# Linting
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Corrige errores automáticamente

# Distribución
npm run dist             # Crea distributivos para todas las plataformas
npm run dist:win         # Solo Windows
npm run dist:mac         # Solo macOS
npm run dist:linux       # Solo Linux
```

## 🗄️ Base de Datos

### Estructura de Tablas

#### Transacciones
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Categorías
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Ubicación de la Base de Datos
- **Windows**: `%APPDATA%/.finanzas-app/finanzas.db`
- **macOS**: `~/Library/Application Support/.finanzas-app/finanzas.db`
- **Linux**: `~/.finanzas-app/finanzas.db`

## 🔌 APIs Disponibles

### Desde el Frontend (window.electronAPI)

#### Transacciones
```typescript
// Obtener todas las transacciones
const transactions = await window.electronAPI.getTransactions();

// Agregar nueva transacción
const newTransaction = await window.electronAPI.addTransaction({
  description: 'Salario',
  amount: 1500,
  type: 'income',
  category: 'Salario',
  date: '2024-01-15',
  notes: 'Pago mensual'
});

// Actualizar transacción
await window.electronAPI.updateTransaction(transaction);

// Eliminar transacción
await window.electronAPI.deleteTransaction(id);
```

#### Categorías
```typescript
// Obtener todas las categorías
const categories = await window.electronAPI.getCategories();

// Agregar nueva categoría
const newCategory = await window.electronAPI.addCategory({
  name: 'Entretenimiento',
  type: 'expense',
  color: '#EC4899'
});
```

#### Reportes
```typescript
// Obtener resumen financiero
const summary = await window.electronAPI.getSummary();
```

## 🎨 Estilos y Componentes

### Tailwind CSS
El proyecto utiliza Tailwind CSS con configuración personalizada en `tailwind.config.js`.

### Colores del Sistema
```css
/* Primary */
--color-primary-50: #eff6ff;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;

/* Success */
--color-success-50: #f0fdf4;
--color-success-600: #16a34a;

/* Danger */
--color-danger-50: #fef2f2;
--color-danger-600: #dc2626;
```

### Componentes Reutilizables
- `.btn` - Botones base
- `.card` - Contenedores de tarjetas
- `.input` - Campos de entrada
- `.select` - Selectores

## 🐛 Debugging

### Herramientas de Desarrollo
1. **DevTools**: Automáticamente abiertos en modo desarrollo
2. **Console**: Logs del renderer process
3. **Main Process**: Logs en la terminal donde ejecutas `npm run dev`

### Logs Útiles
```typescript
// En el frontend
console.log('Frontend log:', data);

// En el main process
console.log('Main process log:', data);
```

### Debugging de Base de Datos
```typescript
// En DatabaseService.ts
console.log('SQL Query:', query);
console.log('Query result:', rows);
```

## 📦 Agregar Nuevas Funcionalidades

### 1. Backend (Electron)
```typescript
// 1. Agregar método en DatabaseService.ts
async getNewFeature(): Promise<any> {
  return new Promise((resolve, reject) => {
    this.db.all('SELECT * FROM new_table', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// 2. Registrar handler en main.ts
ipcMain.handle('db-get-new-feature', async () => {
  return await dbService.getNewFeature();
});
```

### 2. Frontend (React)
```typescript
// 1. Agregar API en preload.ts
contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing APIs
  getNewFeature: () => ipcRenderer.invoke('db-get-new-feature'),
});

// 2. Usar en componente React
const [data, setData] = useState([]);

useEffect(() => {
  const loadData = async () => {
    const result = await window.electronAPI.getNewFeature();
    setData(result);
  };
  loadData();
}, []);
```

## 🧪 Testing

### Estructura de Tests (Futuro)
```
tests/
├── unit/
│   ├── services/
│   └── components/
├── integration/
└── e2e/
```

### Comandos de Testing (Futuro)
```bash
npm run test              # Ejecutar todos los tests
npm run test:unit         # Tests unitarios
npm run test:integration  # Tests de integración
npm run test:e2e          # Tests end-to-end
```

## 🔄 Hot Reload

### Frontend (React)
- Cambios en archivos `.tsx` se reflejan automáticamente
- Vite dev server en puerto 5173

### Backend (Electron)
- Cambios en `src/main/` requieren reinicio manual
- Usar `npm run watch:main` para compilación automática

## 📝 Convenciones de Código

### TypeScript
- Usar interfaces para tipos de datos
- Evitar `any` cuando sea posible
- Usar tipos estrictos para APIs

### React
- Componentes funcionales con hooks
- Props tipadas con interfaces
- Estados tipados

### Nomenclatura
- Archivos: `PascalCase.tsx` para componentes
- Variables: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase`

## 🚀 Deployment

### Construcción para Producción
```bash
# Construir aplicación
npm run build

# Crear distributivos
npm run dist
```

### Distributivos Generados
- **Windows**: `.exe` installer
- **macOS**: `.dmg` file
- **Linux**: `.AppImage` file

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Compilación TypeScript
```bash
# Limpiar cache
rm -rf dist/
npm run build:main
```

#### Error de Dependencias
```bash
# Limpiar node_modules
rm -rf node_modules/
npm install
```

#### Error de Base de Datos
```bash
# Verificar ubicación de la DB
# Eliminar archivo de DB corrupto
rm ~/.finanzas-app/finanzas.db
```

#### Error de Electron
```bash
# Reinstalar electron
npm install electron@latest
```

## 📚 Recursos Adicionales

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs)

---

¡Feliz desarrollo! 🚀 