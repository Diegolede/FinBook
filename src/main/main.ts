/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { DatabaseService } from './services/DatabaseService';

let mainWindow: BrowserWindow | null = null;
let dbService: DatabaseService;
const isDev = !app.isPackaged;

function createWindow() {
  const iconPath = isDev
    ? path.join(process.cwd(), 'src', 'renderer', 'Finbook-logo.png')
    : path.join(__dirname, 'renderer', 'Finbook-logo.png');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    // App icon: black circle (dev uses SVG favicon; prod expects PNG)
    icon: iconPath,
    titleBarStyle: 'default',
    show: false
  });

  // Cargar la aplicación
  if (isDev) {
    // En desarrollo: servidor Vite
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.log('Failed to load URL, server might not be ready yet:', err);
      setTimeout(() => {
        mainWindow?.loadURL('http://localhost:5173').catch(err2 => {
          console.log('Failed to load URL after retry:', err2);
        });
      }, 2000);
    });
  } else {
    // En producción: archivos estáticos generados por Vite
    const indexHtmlPath = path.join(__dirname, 'renderer', 'index.html');
    mainWindow.loadFile(indexHtmlPath).catch(err => {
      console.error('Failed to load index.html:', err);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Crear menú personalizado con atajo Ctrl+Q para cerrar
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Inicializar la base de datos
  dbService = new DatabaseService();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

// IPC Handlers para la base de datos
ipcMain.handle('getDatabasePath', async () => {
  return dbService.getDatabasePath();
});
ipcMain.handle('db-get-transactions', async () => {
  return await dbService.getTransactions();
});

ipcMain.handle('db-add-transaction', async (event, transaction) => {
  return await dbService.addTransaction(transaction);
});

ipcMain.handle('db-update-transaction', async (event, transaction) => {
  return await dbService.updateTransaction(transaction);
});

ipcMain.handle('db-delete-transaction', async (event, id) => {
  return await dbService.deleteTransaction(id);
});

ipcMain.handle('db-get-categories', async () => {
  return await dbService.getCategories();
});

ipcMain.handle('db-add-category', async (event, category) => {
  return await dbService.addCategory(category);
});

ipcMain.handle('db-update-category', async (event, category) => {
  return await dbService.updateCategory(category);
});

ipcMain.handle('db-get-summary', async () => {
  return await dbService.getSummary();
});

// Settings: Budget Allocation (50/30/20 configurable)
ipcMain.handle('getBudgetAllocation', async () => {
  return await dbService.getBudgetAllocation();
});

ipcMain.handle('saveBudgetAllocation', async (event, allocation) => {
  return await dbService.saveBudgetAllocation(allocation);
});

// IPC Handlers para metas de ahorro
ipcMain.handle('getSavingsGoals', async () => {
  return await dbService.getSavingsGoals();
});

ipcMain.handle('addSavingsGoal', async (event, goal) => {
  return await dbService.addSavingsGoal(goal);
});

ipcMain.handle('updateSavingsGoal', async (event, goal) => {
  return await dbService.updateSavingsGoal(goal);
});

ipcMain.handle('deleteSavingsGoal', async (event, id) => {
  return await dbService.deleteSavingsGoal(id);
});

// IPC Handlers para cuentas de ahorro
ipcMain.handle('getSavingsAccounts', async () => {
  return await dbService.getSavingsAccounts();
});

ipcMain.handle('addSavingsAccount', async (event, account) => {
  return await dbService.addSavingsAccount(account);
});

ipcMain.handle('updateSavingsAccount', async (event, account) => {
  return await dbService.updateSavingsAccount(account);
});

ipcMain.handle('deleteSavingsAccount', async (event, id) => {
  return await dbService.deleteSavingsAccount(id);
});

// IPC Handlers para tarjetas de crédito
ipcMain.handle('getCreditCards', async () => {
  return await dbService.getCreditCards();
});

ipcMain.handle('addCreditCard', async (event, card) => {
  return await dbService.addCreditCard(card);
});

ipcMain.handle('updateCreditCard', async (event, card) => {
  return await dbService.updateCreditCard(card);
});

ipcMain.handle('deleteCreditCard', async (event, id) => {
  return await dbService.deleteCreditCard(id);
});

// IPC Handlers para Checklist Items (Notas)
ipcMain.handle('db-get-checklist-items', async () => {
  return await dbService.getChecklistItems();
});

ipcMain.handle('db-add-checklist-item', async (event, text) => {
  return await dbService.addChecklistItem(text);
});

ipcMain.handle('db-update-checklist-item', async (event, id, text) => {
  return await dbService.updateChecklistItem(id, text);
});

ipcMain.handle('db-toggle-checklist-item', async (event, id, completed) => {
  return await dbService.toggleChecklistItem(id, completed);
});

ipcMain.handle('db-delete-checklist-item', async (event, id) => {
  return await dbService.deleteChecklistItem(id);
});

// IPC Handlers para metas mensuales
ipcMain.handle('getMonthlyGoal', async (event, month, year, type) => {
  return await dbService.getMonthlyGoal(month, year, type);
});

ipcMain.handle('saveMonthlyGoal', async (event, goal) => {
  return await dbService.saveMonthlyGoal(goal);
});

// IPC Handler para cerrar la aplicación
ipcMain.handle('quit-app', async () => {
  app.quit();
}); 