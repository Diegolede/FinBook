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
      { name: 'Freelance', type: 'income', color: '#3B82F6' },
      { name: 'Inversiones', type: 'income', color: '#8B5CF6' },
      { name: 'Otros Ingresos', type: 'income', color: '#06B6D4' },
      // Gastos
      { name: 'Comida', type: 'expense', color: '#F97316' },
      { name: 'Alimentación', type: 'expense', color: '#EF4444' },
      { name: 'Transporte', type: 'expense', color: '#F59E0B' },
      { name: 'Vivienda', type: 'expense', color: '#8B5CF6' },
      { name: 'Entretenimiento', type: 'expense', color: '#EC4899' },
      { name: 'Salud', type: 'expense', color: '#10B981' },
      { name: 'Educación', type: 'expense', color: '#3B82F6' },
      { name: 'Servicios', type: 'expense', color: '#0EA5E9' },
      { name: 'Supermercado', type: 'expense', color: '#22C55E' },
      { name: 'Restaurantes', type: 'expense', color: '#E11D48' },
      { name: 'Hogar', type: 'expense', color: '#7C3AED' },
      { name: 'Mascotas', type: 'expense', color: '#F59E0B' },
      { name: 'Impuestos', type: 'expense', color: '#6B7280' },
      { name: 'Seguro', type: 'expense', color: '#0284C7' },
      { name: 'Deudas', type: 'expense', color: '#DC2626' },
      { name: 'Regalos', type: 'expense', color: '#F43F5E' },
      { name: 'Viajes', type: 'expense', color: '#0EA5E9' },
      { name: 'Compras', type: 'expense', color: '#8B5CF6' },
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
        function(err) {
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
        function(err) {
          if (err) reject(err);
          else resolve(transaction);
        }
      );
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
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
        { name: 'Comida', type: 'expense', color: '#F97316' },
        { name: 'Alimentación', type: 'expense', color: '#EF4444' },
        { name: 'Transporte', type: 'expense', color: '#F59E0B' },
        { name: 'Vivienda', type: 'expense', color: '#8B5CF6' },
        { name: 'Entretenimiento', type: 'expense', color: '#EC4899' },
        { name: 'Salud', type: 'expense', color: '#10B981' },
        { name: 'Educación', type: 'expense', color: '#3B82F6' },
        { name: 'Servicios', type: 'expense', color: '#0EA5E9' },
        { name: 'Supermercado', type: 'expense', color: '#22C55E' },
        { name: 'Restaurantes', type: 'expense', color: '#E11D48' },
        { name: 'Hogar', type: 'expense', color: '#7C3AED' },
        { name: 'Mascotas', type: 'expense', color: '#F59E0B' },
        { name: 'Impuestos', type: 'expense', color: '#6B7280' },
        { name: 'Seguro', type: 'expense', color: '#0284C7' },
        { name: 'Deudas', type: 'expense', color: '#DC2626' },
        { name: 'Regalos', type: 'expense', color: '#F43F5E' },
        { name: 'Viajes', type: 'expense', color: '#0EA5E9' },
        { name: 'Compras', type: 'expense', color: '#8B5CF6' },
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
        function(err) {
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
        function(err) {
          if (err) reject(err);
          else resolve(category);
        }
      );
    });
  }

  async getSummary(): Promise<Summary> {
    return new Promise((resolve, reject) => {
      // Para gastos en cuotas, solo contar una cuota por mes (amount / totalInstallments)
      // Para gastos simples (1 cuota o sin cuotas), contar el monto completo
      this.db.all(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as totalIncome,
          SUM(CASE 
            WHEN type = 'expense' AND totalInstallments > 1 THEN 
              CAST(amount AS REAL) / CAST(totalInstallments AS REAL)
            WHEN type = 'expense' THEN 
              amount
            ELSE 0 
          END) as totalExpenses,
          strftime('%Y-%m', date) as month
        FROM transactions 
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
        LIMIT 12
      `, (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const totalIncome = rows.reduce((sum, row) => sum + (row.totalIncome || 0), 0);
        const totalExpenses = rows.reduce((sum, row) => sum + (row.totalExpenses || 0), 0);
        const balance = totalIncome - totalExpenses;

        const monthlyData = rows.map(row => ({
          month: row.month,
          income: row.totalIncome || 0,
          expenses: row.totalExpenses || 0
        }));

        resolve({
          totalIncome,
          totalExpenses,
          balance,
          monthlyData
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
        function(err) {
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
        function(err) {
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
        function(err) {
          if (err) reject(err);
          else resolve(goal);
        }
      );
    });
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM savings_goals WHERE id = ?', [id], function(err) {
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
        function(err) {
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
        function(err) {
          if (err) reject(err);
          else resolve(account);
        }
      );
    });
  }

  async deleteSavingsAccount(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM savings_accounts WHERE id = ?', [id], function(err) {
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

      this.db.run(sql, params, function(err) {
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
        function(err) {
          if (err) reject(err);
          else resolve(card);
        }
      );
    });
  }

  async deleteCreditCard(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM credit_cards WHERE id = ?', [id], function(err) {
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
            function(insertErr) {
              if (insertErr) reject(insertErr);
              else resolve(newGoal);
            }
          );
        }
      );
    });
  }
} 