/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { app as electronApp } from 'electron';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
  creditCardId?: string;
  totalInstallments?: number;
  paidInstallments?: number;
  isFixedExpense?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  notes?: string;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  type: 'checking' | 'savings' | 'investment';
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  creditLimit: number;
  // Algunas BD antiguas pueden tener esta columna NOT NULL
  // Mantener como opcional para compatibilidad
  lastFourDigits?: string;
}

export interface MonthlyGoal {
  id: string;
  targetAmount: number;
  currentAmount: number;
  month: string;
  year: number;
  type: 'expense' | 'income';
  notes?: string;
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

export interface BudgetAllocation {
  needs: number;   // Necesidades
  wants: number;   // Deseos
  savings: number; // Ahorros
  methodTitle?: string; // Título del método seleccionado
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  created_at?: string;
}

export class DatabaseService {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor() {
    const fs = require('fs') as typeof import('fs');

    // Resolver directorio de datos preferido usando Electron cuando esté disponible
    const isElectronAppAvailable = Boolean(electronApp && typeof electronApp.getPath === 'function');
    const canUseElectronUserData = isElectronAppAvailable && typeof electronApp.isReady === 'function' && electronApp.isReady();

    // Ruta nueva recomendada
    const newBaseDir = canUseElectronUserData
      ? electronApp.getPath('userData')
      : (process.env.APPDATA || process.env.HOME || '');

    // Mantener subcarpeta histórica solo en fallback (HOME/APPDATA)
    const preferredDir = canUseElectronUserData
      ? newBaseDir
      : path.join(newBaseDir, '.finanzas-app');

    const preferredPath = path.join(preferredDir, 'finanzas.db');

    // Ruta antigua para migración (HOME/APPDATA + .finanzas-app)
    const legacyDir = path.join((process.env.APPDATA || process.env.HOME || ''), '.finanzas-app');
    const legacyPath = path.join(legacyDir, 'finanzas.db');

    // Asegurar directorio preferido
    const preferredParent = path.dirname(preferredPath);
    if (!fs.existsSync(preferredParent)) {
      fs.mkdirSync(preferredParent, { recursive: true });
    }

    // Migrar DB antigua si existe y no existe aún en la ruta preferida
    if (!fs.existsSync(preferredPath) && fs.existsSync(legacyPath) && legacyPath !== preferredPath) {
      try {
        // Intentar mover primero
        fs.renameSync(legacyPath, preferredPath);
      } catch {
        // Si falló (e.g., cross-device), copiar
        fs.copyFileSync(legacyPath, preferredPath);
      }
    }

    this.dbPath = preferredPath;
    this.db = new sqlite3.Database(this.dbPath);
    this.initDatabase();
  }

  public getDatabasePath(): string {
    return this.dbPath;
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private initDatabase() {
    this.db.serialize(() => {
      // Crear tabla de transacciones
      this.db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          notes TEXT,
          creditCardId TEXT,
          totalInstallments INTEGER,
          paidInstallments INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Agregar las nuevas columnas si no existen (para compatibilidad con bases de datos existentes)
      this.db.run(`ALTER TABLE transactions ADD COLUMN creditCardId TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding creditCardId column:', err);
        }
      });
      this.db.run(`ALTER TABLE transactions ADD COLUMN totalInstallments INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding totalInstallments column:', err);
        }
      });
      this.db.run(`ALTER TABLE transactions ADD COLUMN paidInstallments INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding paidInstallments column:', err);
        }
      });
      this.db.run(`ALTER TABLE transactions ADD COLUMN isFixedExpense INTEGER DEFAULT 0`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding isFixedExpense column:', err);
        }
      });

      // Crear tabla de categorías
      this.db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Evitar duplicados por nombre+tipo
      this.db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name_type ON categories(name, type)`);

      // Crear tabla de metas de ahorro
      this.db.run(`
        CREATE TABLE IF NOT EXISTS savings_goals (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          targetAmount REAL NOT NULL,
          currentAmount REAL NOT NULL,
          targetDate TEXT NOT NULL,
          category TEXT NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de cuentas de ahorro
      this.db.run(`
        CREATE TABLE IF NOT EXISTS savings_accounts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          balance REAL NOT NULL,
          interestRate REAL NOT NULL,
          type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de tarjetas de crédito
      this.db.run(`
        CREATE TABLE IF NOT EXISTS credit_cards (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          bank TEXT NOT NULL,
          "limit" REAL NOT NULL,
          dueDate TEXT NOT NULL,
          color TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de metas mensuales
      this.db.run(`
        CREATE TABLE IF NOT EXISTS monthly_goals (
          id TEXT PRIMARY KEY,
          targetAmount REAL NOT NULL,
          currentAmount REAL NOT NULL,
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          type TEXT NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Agregar columna 'type' si no existe (migración para bases de datos existentes)
      this.db.run(`ALTER TABLE monthly_goals ADD COLUMN type TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding type column to monthly_goals:', err);
        }
      });

      // Establecer valores por defecto para metas existentes sin tipo
      // Esto se ejecuta siempre para asegurar que todas las metas tengan un tipo
      this.db.run(`UPDATE monthly_goals SET type = 'expense' WHERE type IS NULL OR type = ''`, (updateErr) => {
        if (updateErr && !updateErr.message.includes('no such column')) {
          console.error('Error setting default type for existing monthly_goals:', updateErr);
        }
      });

      // Tabla de configuraciones simples clave/valor (JSON en value)
      this.db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crear tabla de checklist_items para notas
      this.db.run(`
        CREATE TABLE IF NOT EXISTS checklist_items (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insertar categorías por defecto (no bloqueante)
      this.insertDefaultCategoriesIfNeeded().catch((err) => {
        console.error('Error seeding default categories:', err);
      });

      // Migración: Eliminar columna color de savings_goals y savings_accounts
      this.migrateRemoveColorColumns().catch((err) => {
        console.error('Error migrating color columns:', err);
      });
    });
  }

  /**
   * Migración: Elimina la columna color de savings_goals y savings_accounts
   * SQLite no soporta DROP COLUMN, así que recreamos las tablas sin la columna
   */
  private async migrateRemoveColorColumns(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Verificar si savings_goals tiene la columna color
      this.db.all("PRAGMA table_info(savings_goals)", (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const hasColorColumn = rows.some((row: any) => row.name === 'color');

        if (hasColorColumn) {
          // Recrear tabla savings_goals sin color
          this.db.serialize(() => {
            this.db.run(`
              CREATE TABLE IF NOT EXISTS savings_goals_new (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                targetAmount REAL NOT NULL,
                currentAmount REAL NOT NULL,
                targetDate TEXT NOT NULL,
                category TEXT NOT NULL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `);

            this.db.run(`
              INSERT INTO savings_goals_new (id, name, targetAmount, currentAmount, targetDate, category, notes, created_at)
              SELECT id, name, targetAmount, currentAmount, targetDate, category, notes, created_at FROM savings_goals
            `);

            this.db.run(`DROP TABLE savings_goals`);
            this.db.run(`ALTER TABLE savings_goals_new RENAME TO savings_goals`);
          });
        }

        // Verificar si savings_accounts tiene la columna color
        this.db.all("PRAGMA table_info(savings_accounts)", (err2, rows2: any[]) => {
          if (err2) {
            reject(err2);
            return;
          }

          const hasColorColumn2 = rows2.some((row: any) => row.name === 'color');

          if (hasColorColumn2) {
            // Recrear tabla savings_accounts sin color
            this.db.serialize(() => {
              this.db.run(`
                CREATE TABLE IF NOT EXISTS savings_accounts_new (
                  id TEXT PRIMARY KEY,
                  name TEXT NOT NULL,
                  balance REAL NOT NULL,
                  interestRate REAL NOT NULL,
                  type TEXT NOT NULL,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
              `);

              this.db.run(`
                INSERT INTO savings_accounts_new (id, name, balance, interestRate, type, created_at)
                SELECT id, name, balance, interestRate, type, created_at FROM savings_accounts
              `);

              this.db.run(`DROP TABLE savings_accounts`);
              this.db.run(`ALTER TABLE savings_accounts_new RENAME TO savings_accounts`);

              resolve();
            });
          } else {
            resolve();
          }
        });
      });
    });
  }

  /**
   * Inserta categorías por defecto de forma idempotente usando INSERT OR IGNORE.
   * Gracias al índice único (name, type), no habrá duplicados.
   */
  private async insertDefaultCategoriesIfNeeded(): Promise<void> {
    const defaultCategories: Omit<Category, 'id'>[] = [
      { name: 'Salario', type: 'income', color: '#10B981' },
      { name: 'Negocios', type: 'income', color: '#3B82F6' },
      { name: 'Inversiones', type: 'income', color: '#8B5CF6' },
      { name: 'Otros Ingresos', type: 'income', color: '#06B6D4' },
      // Gastos
      { name: 'Alimentación', type: 'expense', color: '#F97316' },
      { name: 'Vivienda', type: 'expense', color: '#8B5CF6' },
      { name: 'Transporte', type: 'expense', color: '#F59E0B' },
      { name: 'Salud', type: 'expense', color: '#10B981' },
      { name: 'Entretenimiento', type: 'expense', color: '#EC4899' },
      { name: 'Compras', type: 'expense', color: '#8B5CF6' },
      { name: 'Educación', type: 'expense', color: '#3B82F6' },
      { name: 'Finanzas', type: 'expense', color: '#DC2626' },
      { name: 'Otros Gastos', type: 'expense', color: '#6B7280' },
    ];

    // Normalizar posibles valores antiguos de tipo
    // 1) Pasar a minúsculas valores en inglés
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        "UPDATE categories SET type = LOWER(type) WHERE type IN ('Income','Expense','INCOME','EXPENSE')",
        (err) => (err ? reject(err) : resolve())
      );
    });
    // 2) Mapear variantes en español a los valores estándar
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        "UPDATE categories SET type = 'income' WHERE LOWER(type) IN ('ingreso','ingresos')",
        (err) => (err ? reject(err) : resolve())
      );
    });
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        "UPDATE categories SET type = 'expense' WHERE LOWER(type) IN ('gasto','gastos','egreso','egresos')",
        (err) => (err ? reject(err) : resolve())
      );
    });

    // Limpiar categorías antiguas para evitar listas largas y confusas
    const obsoleteCategories = [
      'Freelance', 'Comida', 'Alimentación', 'Vivienda', 'Entretenimiento', 'Salud', 'Servicios',
      'Supermercado', 'Restaurantes', 'Hogar', 'Mascotas', 'Impuestos', 'Seguro', 'Deudas', 'Regalos', 'Viajes', 'Compras',
      // Borrar las temporales generadas previamente
      'Negocios y Freelance', 'Comida y Supermercado', 'Vivienda y Servicios', 'Salud y Cuidado', 'Entretenimiento y Ocio', 'Compras y Ropa', 'Impuestos y Deudas'
    ];
    await new Promise<void>((resolve) => {
      const placeholders = obsoleteCategories.map(() => '?').join(',');
      this.db.run(`DELETE FROM categories WHERE name IN (${placeholders})`, obsoleteCategories, (err) => {
        if (err) console.error('Error cleaning up obsolete categories:', err);
        resolve();
      });
    });

    // Intentar insertar por defecto siempre; OR IGNORE evita duplicados
    await Promise.all(
      defaultCategories.map((category) =>
        new Promise<void>((resolve, reject) => {
          this.db.run(
            'INSERT OR IGNORE INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)',
            [uuidv4(), category.name, category.type, category.color],
            (err) => (err ? reject(err) : resolve())
          );
        })
      )
    );
  }

  async getTransactions(): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM transactions ORDER BY date DESC, created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else {
            // Convertir isFixedExpense de número a boolean (SQLite almacena como INTEGER: 0 o 1)
            const transactions = (rows as any[]).map(row => ({
              ...row,
              isFixedExpense: row.isFixedExpense === 1 || row.isFixedExpense === true || row.isFixedExpense === '1'
            }));
            resolve(transactions as Transaction[]);
          }
        }
      );
    });
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4()
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO transactions (id, description, amount, type, category, date, notes, creditCardId, totalInstallments, paidInstallments, isFixedExpense) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newTransaction.id, newTransaction.description, newTransaction.amount, newTransaction.type, newTransaction.category, newTransaction.date, newTransaction.notes, newTransaction.creditCardId || null, newTransaction.totalInstallments || null, newTransaction.paidInstallments || null, newTransaction.isFixedExpense ? 1 : 0],
        function (err) {
          if (err) reject(err);
          else resolve(newTransaction);
        }
      );
    });
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE transactions SET description = ?, amount = ?, type = ?, category = ?, date = ?, notes = ?, creditCardId = ?, totalInstallments = ?, paidInstallments = ?, isFixedExpense = ? WHERE id = ?',
        [transaction.description, transaction.amount, transaction.type, transaction.category, transaction.date, transaction.notes, transaction.creditCardId || null, transaction.totalInstallments || null, transaction.paidInstallments || null, transaction.isFixedExpense ? 1 : 0, transaction.id],
        function (err) {
          if (err) reject(err);
          else resolve(transaction);
        }
      );
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM transactions WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getCategories(): Promise<Category[]> {
    // Asegurar defaults antes de leer
    await this.insertDefaultCategoriesIfNeeded();

    // Leer categorías ordenadas por nombre
    let rows: Category[] = await new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows as Category[]);
      });
    });

    // Si no hay categorías de gasto por alguna razón, insertarlas y reintentar
    if (!rows.some((c) => (c.type || '').toLowerCase() === 'expense')) {
      const expenseDefaults: Omit<Category, 'id'>[] = [
        { name: 'Alimentación', type: 'expense', color: '#F97316' },
        { name: 'Vivienda', type: 'expense', color: '#8B5CF6' },
        { name: 'Transporte', type: 'expense', color: '#F59E0B' },
        { name: 'Salud', type: 'expense', color: '#10B981' },
        { name: 'Entretenimiento', type: 'expense', color: '#EC4899' },
        { name: 'Compras', type: 'expense', color: '#8B5CF6' },
        { name: 'Educación', type: 'expense', color: '#3B82F6' },
        { name: 'Finanzas', type: 'expense', color: '#DC2626' },
        { name: 'Otros Gastos', type: 'expense', color: '#6B7280' },
      ];

      await Promise.all(
        expenseDefaults.map((category) =>
          new Promise<void>((resolve, reject) => {
            this.db.run(
              'INSERT OR IGNORE INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)',
              [uuidv4(), category.name, category.type, category.color],
              (err) => (err ? reject(err) : resolve())
            );
          })
        )
      );

      rows = await new Promise((resolve, reject) => {
        this.db.all('SELECT * FROM categories ORDER BY name', (err, rows2) => {
          if (err) reject(err);
          else resolve(rows2 as Category[]);
        });
      });
    }

    return rows;
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: uuidv4()
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO categories (id, name, type, color) VALUES (?, ?, ?, ?)',
        [newCategory.id, newCategory.name, newCategory.type, newCategory.color],
        function (err) {
          if (err) reject(err);
          else resolve(newCategory);
        }
      );
    });
  }

  async updateCategory(category: Category): Promise<Category> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE categories SET name = ?, type = ?, color = ? WHERE id = ?',
        [category.name, category.type, category.color, category.id],
        function (err) {
          if (err) reject(err);
          else resolve(category);
        }
      );
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getSummary(): Promise<Summary> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM transactions', (err, transactions: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        // Obtener los últimos 12 meses
        const monthlyData: { month: string; income: number; expenses: number }[] = [];
        const now = new Date();
        
        for (let i = 0; i < 12; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          // Usar formato YYYY-MM compatible con strftime('%Y-%m', date)
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const monthStr = `${year}-${month}`;
          
          let monthIncome = 0;
          let monthExpenses = 0;

          transactions.forEach(t => {
            const tMonthStr = t.date.substring(0, 7);
            
            // Caso 1: Transacción simple en este mes exacto
            const isSimple = (!t.isFixedExpense && (!t.totalInstallments || t.totalInstallments <= 1));
            if (isSimple && tMonthStr === monthStr) {
              if (t.type === 'income') monthIncome += t.amount;
              else monthExpenses += t.amount;
            }

            // Caso 2: Gasto fijo (desde su fecha de creación en adelante)
            if (t.isFixedExpense) {
              if (monthStr >= tMonthStr) {
                if (t.type === 'income') monthIncome += t.amount;
                else monthExpenses += t.amount;
              }
            }

            // Caso 3: Cuotas (Manuales: solo afectan al mes de registro según el deseo del usuario)
            if (!t.isFixedExpense && t.totalInstallments && t.totalInstallments > 1) {
              if (tMonthStr === monthStr) {
                const installmentAmount = t.amount / t.totalInstallments;
                if (t.type === 'income') monthIncome += installmentAmount;
                else monthExpenses += installmentAmount;
              }
            }
          });

          monthlyData.push({ month: monthStr, income: monthIncome, expenses: monthExpenses });
        }

        const currentMonthData = monthlyData[0];

        resolve({
          totalIncome: currentMonthData.income, // Usar solo el mes actual para totales principales si se desea "borrón y cuenta nueva"
          totalExpenses: currentMonthData.expenses,
          balance: currentMonthData.income - currentMonthData.expenses,
          monthlyData: monthlyData.reverse() // De más antiguo a más reciente para el gráfico
        });
      });
    });
  }

  // --- Settings: Budget Allocation (50/30/20 configurable) ---
  async getBudgetAllocation(): Promise<BudgetAllocation> {
    const defaultAllocation: BudgetAllocation = { needs: 50, wants: 30, savings: 20, methodTitle: 'Método clásico' };
    return new Promise((resolve) => {
      this.db.get(
        'SELECT value FROM settings WHERE key = ? LIMIT 1',
        ['budget_allocation'],
        (err, row: any) => {
          if (err || !row) {
            resolve(defaultAllocation);
            return;
          }
          try {
            const parsed = JSON.parse(row.value || '{}');
            const needs = Number(parsed.needs);
            const wants = Number(parsed.wants);
            const savings = Number(parsed.savings);
            const methodTitle = parsed.methodTitle || undefined;
            if ([needs, wants, savings].every((n) => Number.isFinite(n)) && needs >= 0 && wants >= 0 && savings >= 0) {
              resolve({ needs, wants, savings, methodTitle });
            } else {
              resolve(defaultAllocation);
            }
          } catch {
            resolve(defaultAllocation);
          }
        }
      );
    });
  }

  async saveBudgetAllocation(allocation: BudgetAllocation): Promise<void> {
    const total = allocation.needs + allocation.wants + allocation.savings;
    // Normalizar si hay desvíos mínimos por redondeo
    if (total !== 100) {
      throw new Error('La suma de los porcentajes debe ser 100');
    }

    const value = JSON.stringify({
      needs: allocation.needs,
      wants: allocation.wants,
      savings: allocation.savings,
      methodTitle: allocation.methodTitle || undefined,
    });

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
        ['budget_allocation', value],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  // Métodos para metas de ahorro
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM savings_goals ORDER BY targetDate', (err, rows) => {
        if (err) reject(err);
        else resolve(rows as SavingsGoal[]);
      });
    });
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> {
    const newGoal: SavingsGoal = {
      ...goal,
      id: uuidv4()
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO savings_goals (id, name, targetAmount, currentAmount, targetDate, category, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newGoal.id, newGoal.name, newGoal.targetAmount, newGoal.currentAmount, newGoal.targetDate, newGoal.category, newGoal.notes || null],
        function (err) {
          if (err) reject(err);
          else resolve(newGoal);
        }
      );
    });
  }

  async updateSavingsGoal(goal: SavingsGoal): Promise<SavingsGoal> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE savings_goals SET name = ?, targetAmount = ?, currentAmount = ?, targetDate = ?, category = ?, notes = ? WHERE id = ?',
        [goal.name, goal.targetAmount, goal.currentAmount, goal.targetDate, goal.category, goal.notes || null, goal.id],
        function (err) {
          if (err) reject(err);
          else resolve(goal);
        }
      );
    });
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM savings_goals WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Métodos para cuentas de ahorro
  async getSavingsAccounts(): Promise<SavingsAccount[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM savings_accounts ORDER BY name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows as SavingsAccount[]);
      });
    });
  }

  async addSavingsAccount(account: Omit<SavingsAccount, 'id'>): Promise<SavingsAccount> {
    const newAccount: SavingsAccount = {
      ...account,
      id: uuidv4()
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO savings_accounts (id, name, balance, interestRate, type) VALUES (?, ?, ?, ?, ?)',
        [newAccount.id, newAccount.name, newAccount.balance, newAccount.interestRate, newAccount.type],
        function (err) {
          if (err) reject(err);
          else resolve(newAccount);
        }
      );
    });
  }

  async updateSavingsAccount(account: SavingsAccount): Promise<SavingsAccount> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE savings_accounts SET name = ?, balance = ?, interestRate = ?, type = ? WHERE id = ?',
        [account.name, account.balance, account.interestRate, account.type, account.id],
        function (err) {
          if (err) reject(err);
          else resolve(account);
        }
      );
    });
  }

  async deleteSavingsAccount(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM savings_accounts WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Métodos para tarjetas de crédito
  async getCreditCards(): Promise<CreditCard[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, name, bank, "limit" as creditLimit FROM credit_cards ORDER BY name',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows as CreditCard[]);
        }
      );
    });
  }

  // Métodos para Checklist Items (Notas)
  async getChecklistItems(): Promise<ChecklistItem[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM checklist_items ORDER BY created_at ASC',
        (err, rows) => {
          if (err) reject(err);
          else {
            const items = (rows as any[]).map(row => ({
              ...row,
              completed: row.completed === 1
            }));
            resolve(items as ChecklistItem[]);
          }
        }
      );
    });
  }

  async addChecklistItem(text: string): Promise<ChecklistItem> {
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text,
      completed: false
    };

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO checklist_items (id, text, completed) VALUES (?, ?, ?)',
        [newItem.id, newItem.text, 0], // 0 for false
        function (err) {
          if (err) reject(err);
          else resolve(newItem);
        }
      );
    });
  }

  async updateChecklistItem(id: string, text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE checklist_items SET text = ? WHERE id = ?',
        [text, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async toggleChecklistItem(id: string, completed: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE checklist_items SET completed = ? WHERE id = ?',
        [completed ? 1 : 0, id],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async deleteChecklistItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM checklist_items WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async addCreditCard(card: Omit<CreditCard, 'id'>): Promise<CreditCard> {
    const newCard: CreditCard = {
      ...card,
      id: uuidv4()
    };

    // Detectar si existe la columna lastFourDigits en la tabla (compatibilidad con BD antiguas)
    const hasLastFourDigitsColumn = await new Promise<boolean>((resolve) => {
      this.db.all('PRAGMA table_info(credit_cards)', (err, rows: any[]) => {
        if (err || !Array.isArray(rows)) {
          resolve(false);
          return;
        }
        resolve(rows.some((r: any) => (r && (r.name === 'lastFourDigits' || r.name === 'last_four_digits'))));
      });
    });

    // Si la columna existe y podría ser NOT NULL, aseguramos un valor por defecto
    const lastFourFallback = (card as any).lastFourDigits || '0000';

    // Usar valores por defecto para dueDate y color para compatibilidad con BD existentes
    const defaultDueDate = new Date().toISOString().split('T')[0];
    const defaultColor = '#0f0f0f';

    return new Promise((resolve, reject) => {
      const sql = hasLastFourDigitsColumn
        ? 'INSERT INTO credit_cards (id, name, bank, "limit", dueDate, color, lastFourDigits) VALUES (?, ?, ?, ?, ?, ?, ?)'
        : 'INSERT INTO credit_cards (id, name, bank, "limit", dueDate, color) VALUES (?, ?, ?, ?, ?, ?)';
      const params = hasLastFourDigitsColumn
        ? [newCard.id, newCard.name, newCard.bank, newCard.creditLimit, defaultDueDate, defaultColor, lastFourFallback]
        : [newCard.id, newCard.name, newCard.bank, newCard.creditLimit, defaultDueDate, defaultColor];

      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(newCard);
      });
    });
  }

  async updateCreditCard(card: CreditCard): Promise<CreditCard> {
    // Usar valores por defecto para dueDate y color para compatibilidad con BD existentes
    const defaultDueDate = new Date().toISOString().split('T')[0];
    const defaultColor = '#0f0f0f';

    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE credit_cards SET name = ?, bank = ?, "limit" = ?, dueDate = ?, color = ? WHERE id = ?',
        [card.name, card.bank, card.creditLimit, defaultDueDate, defaultColor, card.id],
        function (err) {
          if (err) reject(err);
          else resolve(card);
        }
      );
    });
  }

  async deleteCreditCard(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM credit_cards WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // Métodos para metas mensuales
  async getMonthlyGoal(month: string, year: number, type: 'expense' | 'income'): Promise<MonthlyGoal | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM monthly_goals WHERE month = ? AND year = ? AND type = ?', [month, year, type], (err, row) => {
        if (err) reject(err);
        else {
          const goal = row as MonthlyGoal | null;
          // Asegurar que el tipo esté presente (para compatibilidad con datos antiguos)
          if (goal && !goal.type) {
            goal.type = type;
          }
          resolve(goal);
        }
      });
    });
  }

  async saveMonthlyGoal(goal: Omit<MonthlyGoal, 'id'>): Promise<MonthlyGoal> {
    const newGoal: MonthlyGoal = {
      ...goal,
      id: uuidv4()
    };

    return new Promise((resolve, reject) => {
      // Primero intentar obtener la meta existente para preservar el ID si existe
      this.db.get(
        'SELECT id FROM monthly_goals WHERE month = ? AND year = ? AND type = ?',
        [newGoal.month, newGoal.year, newGoal.type],
        (err, existingRow: any) => {
          if (err) {
            reject(err);
            return;
          }

          // Si existe una meta con el mismo mes, año y tipo, usar su ID
          if (existingRow) {
            newGoal.id = existingRow.id;
          }

          this.db.run(
            'INSERT OR REPLACE INTO monthly_goals (id, targetAmount, currentAmount, month, year, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newGoal.id, newGoal.targetAmount, newGoal.currentAmount, newGoal.month, newGoal.year, newGoal.type, newGoal.notes || null],
            function (insertErr) {
              if (insertErr) reject(insertErr);
              else resolve(newGoal);
            }
          );
        }
      );
    });
  }

  /**
   * Obtiene un historial de resúmenes por mes, calculado dinámicamente
   * desde las transacciones existentes.
   */
  async getMonthlyHistory(): Promise<any[]> {
    const transactions: Transaction[] = await this.getTransactions();
    const creditCards: CreditCard[] = await this.getCreditCards();

    // Agrupar por YYYY-MM usando split del string (sin timezone bugs)
    const months: { [key: string]: Transaction[] } = {};
    for (const t of transactions) {
      const monthKey = t.date.substring(0, 7); // 'YYYY-MM'
      if (!months[monthKey]) months[monthKey] = [];
      months[monthKey].push(t);
    }

    const result = Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a)) // más reciente primero
      .map(([monthKey, txs]) => {
        const incomeTransactions = txs.filter(t => t.type === 'income');
        const expenseTransactions = txs.filter(t => t.type === 'expense');

        const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((s, t) => s + t.amount, 0);
        const balance = totalIncome - totalExpenses;
        const transactionCount = txs.length;
        const expenseCount = expenseTransactions.length;
        const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

        // Top categorías de gasto
        const catTotals: { [cat: string]: number } = {};
        for (const t of expenseTransactions) {
          catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }
        const topCategories = Object.entries(catTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
          }));

        // Tarjetas utilizadas
        const cardTotalsData: { [cardId: string]: number } = {};
        for (const t of expenseTransactions) {
          if (t.creditCardId) {
            cardTotalsData[t.creditCardId] = (cardTotalsData[t.creditCardId] || 0) + t.amount;
          }
        }
        const topCards = Object.entries(cardTotalsData)
          .sort(([, a], [, b]) => b - a)
          .map(([cardId, cardAmount]) => {
            const card = creditCards.find(c => c.id === cardId);
            return {
              name: card?.name || 'Desconocida',
              bank: card?.bank || '',
              amount: cardAmount
            };
          });

        // Top categorías de ingreso
        const incomeCatTotals: { [cat: string]: number } = {};
        for (const t of incomeTransactions) {
          incomeCatTotals[t.category] = (incomeCatTotals[t.category] || 0) + t.amount;
        }
        const topIncomeCategories = Object.entries(incomeCatTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0
          }));

        const savingsTransactions = txs.filter(t => t.category.toLowerCase().includes('ahorro') || t.category.toLowerCase().includes('savings'));
        const totalSavings = savingsTransactions.reduce((s, t) => s + t.amount, 0);

        return {
          monthKey,
          totalIncome,
          totalExpenses,
          totalSavings,
          balance,
          transactionCount,
          expenseCount,
          avgExpense,
          topCategories,
          topIncomeCategories,
          topCards,
          // Transacciones individuales ordenadas de más nueva a más vieja
          transactions: txs
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(t => ({
              id: t.id,
              description: t.description,
              amount: t.amount,
              type: t.type,
              category: t.category,
              date: t.date,
              notes: t.notes || '',
              creditCardId: t.creditCardId || null,
              creditCardName: t.creditCardId ? (creditCards.find(c => c.id === t.creditCardId)?.name || null) : null,
              isSavings: t.category.toLowerCase().includes('ahorro') || t.category.toLowerCase().includes('savings')
            }))
        };
      });

    return result;
  }
} 