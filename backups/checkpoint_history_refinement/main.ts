/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
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

// IPC Handler para historial mensual
ipcMain.handle('getMonthlyHistory', async () => {
  return await dbService.getMonthlyHistory();
});

// IPC Handler para exportar resumen mensual a PDF
ipcMain.handle('exportMonthlyPDF', async (_event, data: {
  monthLabel: string;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  balance: number;
  transactionCount: number;
  expenseCount: number;
  avgExpense: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  topIncomeCategories: Array<{ category: string; amount: number; percentage: number }>;
  topCard: { name: string; bank: string; amount: number } | null;
  transactions: Array<{
    description: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    creditCardName?: string | null;
    isSavings?: boolean;
  }>;
}) => {
  const formatMoney = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);

  const topCatsHtml = data.topCategories.map((c, i) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}. ${c.category}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(c.amount)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${c.percentage.toFixed(1)}%</td></tr>`
  ).join('');

  const topIncomeCatsHtml = data.topIncomeCategories.map((c, i) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}. ${c.category}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(c.amount)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${c.percentage.toFixed(1)}%</td></tr>`
  ).join('');

  const txsHtml = (data.transactions || []).map((tx) => {
    const [y, mo, d] = tx.date.split('-');
    const dateFormatted = `${d}/${mo}/${y}`;
    const typeLabel = tx.isSavings ? '💰 Ahorro' : tx.type === 'income' ? '📈 Ingreso' : '📉 Gasto';
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;">${dateFormatted}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;">
        <strong>${tx.description}</strong><br/>
        <span style="color:#9ca3af;font-size:10px;">${tx.category} ${tx.creditCardName ? '• ' + tx.creditCardName : ''}</span>
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;">${typeLabel}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;text-align:right;font-weight:700;">
        ${tx.type === 'income' ? '+' : '-'}${formatMoney(tx.amount)}
      </td>
    </tr>`;
  }).join('');

  const cardHtml = data.topCard
    ? `<div style="margin-top:28px;">
        <h2 style="font-size:16px;font-weight:700;color:#111;margin-bottom:12px;">💳 Tarjeta más utilizada</h2>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
          <div><strong>${data.topCard.name}</strong><br/><span style="color:#6b7280;font-size:13px;">${data.topCard.bank}</span></div>
          <div style="font-weight:700;font-size:18px;">${formatMoney(data.topCard.amount)}</div>
        </div>
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#111; padding:40px; background:#fff; line-height:1.4; }
  .header { text-align:center; margin-bottom:36px; padding-bottom:20px; border-bottom:2px solid #111; }
  .header h1 { font-size:28px; font-weight:800; letter-spacing:-0.5px; }
  .header p { font-size:18px; color:#6b7280; margin-top:6px; }
  .stats-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:24px; }
  .stat-card { background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:16px; text-align:center; }
  .stat-card .label { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; font-weight:700; }
  .stat-card .value { font-size:18px; font-weight:700; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding:8px 12px; font-size:10px; text-transform:uppercase; color:#6b7280; letter-spacing:0.5px; border-bottom:2px solid #111; font-weight:800; }
  .page-break { page-break-before: always; }
  .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e5e7eb; text-align:center; color:#9ca3af; font-size:10px; }
</style></head><body>
  <div class="header">
    <h1>FINBOOK</h1>
    <p>Resumen Mensual — ${data.monthLabel}</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="label">Ingresos</div>
      <div class="value">${formatMoney(data.totalIncome)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Gastos</div>
      <div class="value">${formatMoney(data.totalExpenses)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Ahorro</div>
      <div class="value">${formatMoney(data.totalSavings)}</div>
    </div>
    <div class="stat-card">
      <div class="label">Balance</div>
      <div class="value">${formatMoney(data.balance)}</div>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
    <div class="stat-card">
      <div class="label">Transacciones</div>
      <div class="value">${data.transactionCount}</div>
    </div>
    <div class="stat-card">
      <div class="label">Gasto promedio</div>
      <div class="value">${formatMoney(data.avgExpense)}</div>
    </div>
  </div>

  <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
    ${data.topCategories.length > 0 ? `
    <div>
      <h2 style="font-size:14px;font-weight:700;color:#111;margin-bottom:10px;">📉 Top Categorías de Gasto</h2>
      <table>
        <thead><tr><th>Categoría</th><th style="text-align:right;">Monto</th></tr></thead>
        <tbody>${topCatsHtml}</tbody>
      </table>
    </div>` : ''}

    ${data.topIncomeCategories.length > 0 ? `
    <div>
      <h2 style="font-size:14px;font-weight:700;color:#111;margin-bottom:10px;">📈 Top Categorías de Ingreso</h2>
      <table>
        <thead><tr><th>Categoría</th><th style="text-align:right;">Monto</th></tr></thead>
        <tbody>${topIncomeCatsHtml}</tbody>
      </table>
    </div>` : ''}
  </div>

  ${cardHtml}

  <div class="page-break"></div>

  <div style="margin-top:20px;">
    <h2 style="font-size:18px;font-weight:800;color:#111;margin-bottom:16px;border-bottom:2px solid #111;padding-bottom:8px;">📝 Historial Detallado de Transacciones</h2>
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Descripción / Categoría</th>
          <th>Tipo</th>
          <th style="text-align:right;">Monto</th>
        </tr>
      </thead>
      <tbody>
        ${txsHtml}
      </tbody>
    </table>
  </div>

  <div class="footer">Generado por FinBook v1.1.2 — ${new Date().toLocaleDateString('es-AR')}</div>
</body></html>`;

  // Crear ventana oculta para renderizar el HTML
  const pdfWindow = new BrowserWindow({ show: false, width: 800, height: 600 });
  pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  // Esperar a que cargue
  await new Promise<void>((resolve) => {
    pdfWindow.webContents.on('did-finish-load', () => resolve());
  });

  const pdfBuffer = await pdfWindow.webContents.printToPDF({
    printBackground: true,
    margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 }
  } as any);

  pdfWindow.close();

  // Mostrar diálogo para guardar
  const sanitizedMonth = data.monthLabel.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '_');
  const result = await dialog.showSaveDialog({
    title: 'Guardar resumen mensual',
    defaultPath: `Finbook_Resumen_${sanitizedMonth}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, pdfBuffer);
    return { success: true, path: result.filePath };
  }

  return { success: false };
}); 