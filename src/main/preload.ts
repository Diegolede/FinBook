/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import { contextBridge, ipcRenderer } from 'electron';

// Exponer APIs seguras para el renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Transacciones
  getTransactions: () => ipcRenderer.invoke('db-get-transactions'),
  addTransaction: (transaction: any) => ipcRenderer.invoke('db-add-transaction', transaction),
  updateTransaction: (transaction: any) => ipcRenderer.invoke('db-update-transaction', transaction),
  deleteTransaction: (id: string) => ipcRenderer.invoke('db-delete-transaction', id),
  
  // Categorías
  getCategories: () => ipcRenderer.invoke('db-get-categories'),
  addCategory: (category: any) => ipcRenderer.invoke('db-add-category', category),
  updateCategory: (category: any) => ipcRenderer.invoke('db-update-category', category),
  
  // Resumen
  getSummary: () => ipcRenderer.invoke('db-get-summary'),

  // Configuración de Presupuesto 50/30/20
  getBudgetAllocation: () => ipcRenderer.invoke('getBudgetAllocation'),
  saveBudgetAllocation: (allocation: any) => ipcRenderer.invoke('saveBudgetAllocation', allocation),

  // Metas de Ahorro
  getSavingsGoals: () => ipcRenderer.invoke('getSavingsGoals'),
  addSavingsGoal: (goal: any) => ipcRenderer.invoke('addSavingsGoal', goal),
  updateSavingsGoal: (goal: any) => ipcRenderer.invoke('updateSavingsGoal', goal),
  deleteSavingsGoal: (id: string) => ipcRenderer.invoke('deleteSavingsGoal', id),

  // Cuentas de Ahorro
  getSavingsAccounts: () => ipcRenderer.invoke('getSavingsAccounts'),
  addSavingsAccount: (account: any) => ipcRenderer.invoke('addSavingsAccount', account),
  updateSavingsAccount: (account: any) => ipcRenderer.invoke('updateSavingsAccount', account),
  deleteSavingsAccount: (id: string) => ipcRenderer.invoke('deleteSavingsAccount', id),

  // Tarjetas de Crédito
  getCreditCards: () => ipcRenderer.invoke('getCreditCards'),
  addCreditCard: (card: any) => ipcRenderer.invoke('addCreditCard', card),
  updateCreditCard: (card: any) => ipcRenderer.invoke('updateCreditCard', card),
  deleteCreditCard: (id: string) => ipcRenderer.invoke('deleteCreditCard', id),

  // Metas Mensuales
  getMonthlyGoal: (month: string, year: number, type: 'expense' | 'income') => ipcRenderer.invoke('getMonthlyGoal', month, year, type),
  saveMonthlyGoal: (goal: any) => ipcRenderer.invoke('saveMonthlyGoal', goal),

  // Utilidades
  getDatabasePath: () => ipcRenderer.invoke('getDatabasePath'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
});

// Tipos para TypeScript
declare global {
  interface Window {
    electronAPI: {
      getTransactions: () => Promise<any[]>;
      addTransaction: (transaction: any) => Promise<any>;
      updateTransaction: (transaction: any) => Promise<any>;
      deleteTransaction: (id: string) => Promise<any>;
      getCategories: () => Promise<any[]>;
      addCategory: (category: any) => Promise<any>;
      updateCategory: (category: any) => Promise<any>;
      getSummary: () => Promise<any>;
      getBudgetAllocation: () => Promise<{ needs: number; wants: number; savings: number; methodTitle?: string }>;
      saveBudgetAllocation: (allocation: { needs: number; wants: number; savings: number; methodTitle?: string }) => Promise<void>;
      getSavingsGoals: () => Promise<any[]>;
      addSavingsGoal: (goal: any) => Promise<any>;
      updateSavingsGoal: (goal: any) => Promise<any>;
      deleteSavingsGoal: (id: string) => Promise<any>;
      getSavingsAccounts: () => Promise<any[]>;
      addSavingsAccount: (account: any) => Promise<any>;
      updateSavingsAccount: (account: any) => Promise<any>;
      deleteSavingsAccount: (id: string) => Promise<any>;
      getCreditCards: () => Promise<any[]>;
      addCreditCard: (card: any) => Promise<any>;
      updateCreditCard: (card: any) => Promise<any>;
      deleteCreditCard: (id: string) => Promise<any>;
      getMonthlyGoal: (month: string, year: number, type: 'expense' | 'income') => Promise<any | null>;
      saveMonthlyGoal: (goal: any) => Promise<any>;
      getDatabasePath: () => Promise<string>;
      quitApp: () => Promise<void>;
    };
  }
} 