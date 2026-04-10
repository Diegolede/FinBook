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

ipcMain.handle('db-add-transaction', async (_event, transaction) => {
  return await dbService.addTransaction(transaction);
});

ipcMain.handle('db-update-transaction', async (_event, transaction) => {
  return await dbService.updateTransaction(transaction);
});

ipcMain.handle('db-delete-transaction', async (_event, id) => {
  return await dbService.deleteTransaction(id);
});

ipcMain.handle('db-get-categories', async () => {
  return await dbService.getCategories();
});

ipcMain.handle('db-add-category', async (_event, category) => {
  return await dbService.addCategory(category);
});

ipcMain.handle('db-update-category', async (_event, category) => {
  return await dbService.updateCategory(category);
});

ipcMain.handle('db-delete-category', async (event, id) => {
  return await dbService.deleteCategory(id);
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
  topCards: Array<{ name: string; bank: string; amount: number }>;
  transactions: Array<{
    description: string;
    amount: number;
    type: string;
    category: string;
    date: string;
    creditCardName?: string | null;
    isSavings?: boolean;
  }>;
  comparisons: {
    incomeChange: number;
    expenseChange: number;
    savingsChange: number;
    balanceChange: number;
  };
}) => {
  const formatMoney = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);

  const formatPercent = (n: number) => {
    const abs = Math.abs(n).toFixed(1);
    const color = '#6b7280';
    if (n > 0) return `<span style="color:${color}; font-size:9px; font-weight:600;">(+${abs}%)</span>`;
    if (n < 0) return `<span style="color:${color}; font-size:9px; font-weight:600;">(-${abs}%)</span>`;
    return '';
  };

  const topCatsHtml = data.topCategories.map((c, i) => `
    <div style="margin-bottom:10px; display:flex; align-items:center; justify-content:space-between;">
      <div style="flex:1; font-size:11px; font-weight:600; color:#4b5563;">${i + 1}. ${c.category}</div>
      <div style="width:120px; height:4px; background:#f3f4f6; border-radius:2px; margin:0 15px; overflow:hidden;">
        <div style="width:${c.percentage}%; height:100%; background:#111; border-radius:2px;"></div>
      </div>
      <div style="width:100px; text-align:right; font-weight:700; font-size:11px;">${formatMoney(c.amount)}</div>
    </div>
  `).join('');

  const topIncomeCatsHtml = data.topIncomeCategories.map((c, i) => `
    <div style="margin-bottom:10px; display:flex; align-items:center; justify-content:space-between;">
      <div style="flex:1; font-size:11px; font-weight:600; color:#4b5563;">${i + 1}. ${c.category}</div>
      <div style="width:120px; height:4px; background:#f3f4f6; border-radius:2px; margin:0 15px; overflow:hidden;">
        <div style="width:${c.percentage}%; height:100%; background:#6b7280; border-radius:2px;"></div>
      </div>
      <div style="width:100px; text-align:right; font-weight:700; font-size:11px;">${formatMoney(c.amount)}</div>
    </div>
  `).join('');

  const cardRowsHtml = data.topCards.map((card) => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #f3f4f6;">
        <div style="font-weight:700; font-size:11px; color:#111;">${card.name.toUpperCase()}</div>
        <div style="font-size:9px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.5px;">${card.bank}</div>
      </td>
      <td style="padding:10px 0; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:700; font-size:11px;">
        ${formatMoney(card.amount)}
      </td>
    </tr>
  `).join('');

  const txsHtml = (data.transactions || []).map((tx) => {
    const [y, mo, d] = tx.date.split('-');
    const dateFormatted = `${d}/${mo}/${y}`;
    const typeLabel = tx.isSavings ? 'AHORRO' : tx.type === 'income' ? 'INGRESO' : 'GASTO';
    return `<tr>
      <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; font-size:10px; color:#6b7280; font-weight:600;">${dateFormatted}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; font-size:10px;">
        <div style="font-weight:700; color:#111; letter-spacing:-0.2px;">${tx.description.toUpperCase()}</div>
        <div style="font-size:9px; color:#9ca3af; margin-top:2px; text-transform:uppercase; font-weight:600;">${tx.category} ${tx.creditCardName ? '• ' + tx.creditCardName : ''}</div>
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; font-size:9px; font-weight:800; color:#939393; text-align:center; letter-spacing:1px;">${typeLabel}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #f3f4f6; font-size:10px; text-align:right; font-weight:800; color:#111;">
        ${tx.type === 'income' ? '+' : '-'}${formatMoney(tx.amount)}
      </td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust: exact; }
  body { font-family: 'Inter', sans-serif; color:#111; padding:60px 50px; background:#fff; line-height:1.6; }
  
  .document-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:50px; padding-bottom:20px; border-bottom:1px solid #e5e7eb; }
  .logo-area h1 { font-size:24px; font-weight:800; letter-spacing:-1px; margin-bottom:2px; }
  .logo-area p { font-size:10px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:2px; }
  .period-area { text-align:right; }
  .period-area div { font-size:9px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
  .period-area p { font-size:16px; font-weight:700; color:#111; }

  .summary-title { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:15px; color:#111; padding-left:2px; border-left:4px solid #111; line-height:1; }
  
  .activity-summary-table { width:100%; margin-bottom:40px; border:1px solid #f3f4f6; border-radius:8px; overflow:hidden; }
  .activity-summary-table th { background:#f9fafb; padding:12px 15px; font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#6b7280; font-weight:800; border-bottom:1px solid #f3f4f6; }
  .activity-summary-table td { padding:15px; font-size:14px; font-weight:700; border-bottom:1px solid #f3f4f6; }
  .activity-summary-table tr:last-child td { border-bottom:none; background:#f9fafb; font-size:16px; }

  .columns-grid { display:grid; grid-template-columns: 1.5fr 1fr; gap:40px; margin-bottom:45px; }
  
  .sub-section-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:15px; color:#6b7280; border-bottom:1px solid #f3f4f6; padding-bottom:8px; }

  .transaction-table { width:100%; border-collapse:collapse; }
  .transaction-table th { text-align:left; padding:12px; font-size:9px; text-transform:uppercase; color:#9ca3af; letter-spacing:1.5px; border-bottom:2px solid #111; font-weight:800; }
  
  .footer { margin-top:60px; padding-top:20px; border-top:1px solid #f3f4f6; display:flex; justify-content:space-between; color:#d1d5db; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
</style></head><body>
  <div class="document-header">
    <div class="logo-area">
      <h1>FINBOOK.</h1>
      <p>Reporte de Actividad Mensual</p>
    </div>
    <div class="period-area">
      <div>Estado al cierre de</div>
      <p>${data.monthLabel.toUpperCase()}</p>
    </div>
  </div>

  <div class="summary-title">Resumen de Actividad Económica</div>
  <table class="activity-summary-table">
    <thead>
      <tr>
        <th style="text-align:left;">Concepto</th>
        <th style="text-align:right;">Monto Acumulado</th>
        <th style="text-align:right; width:120px;">Variación</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ingresos Totales en el Periodo</td>
        <td style="text-align:right;">${formatMoney(data.totalIncome)}</td>
        <td style="text-align:right; color:#6b7280;">${formatPercent(data.comparisons.incomeChange) || '—'}</td>
      </tr>
      <tr>
        <td>Gastos y Egresos Registrados</td>
        <td style="text-align:right;">${formatMoney(data.totalExpenses)}</td>
        <td style="text-align:right; color:#6b7280;">${formatPercent(data.comparisons.expenseChange) || '—'}</td>
      </tr>
      <tr>
        <td>Capital de Ahorro Neto</td>
        <td style="text-align:right;">${formatMoney(data.totalSavings)}</td>
        <td style="text-align:right; color:#6b7280;">${formatPercent(data.comparisons.savingsChange) || '—'}</td>
      </tr>
      <tr>
        <td style="font-weight:800;">Balance de Estado (Cash-Flow)</td>
        <td style="text-align:right; font-weight:800;">${formatMoney(data.balance)}</td>
        <td style="text-align:right;">${formatPercent(data.comparisons.balanceChange) || '—'}</td>
      </tr>
    </tbody>
  </table>

  <div class="columns-grid">
    <div>
      <div class="sub-section-title">Distribución por Categorías</div>
      <div style="padding:0 5px;">
        ${topCatsHtml || '<p style="font-size:11px; color:#9ca3af;">No se registraron egresos.</p>'}
        <div style="margin-top:25px;"></div>
        ${topIncomeCatsHtml || '<p style="font-size:11px; color:#9ca3af;">No se registraron ingresos.</p>'}
      </div>
    </div>

    <div>
      <div class="sub-section-title">Análisis de Medios de Pago</div>
      <table style="width:100%;">
        <tbody>
          ${cardRowsHtml || '<tr><td colspan="2" style="font-size:11px; color:#9ca3af; padding:10px 0;">Sin actividad de tarjetas.</td></tr>'}
        </tbody>
      </table>
      <div style="margin-top:20px; padding:15px; border:1px solid #f3f4f6; border-radius:10px; background:#f9fafb;">
        <div style="font-size:9px; color:#9ca3af; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Gasto Promedio Unitario</div>
        <div style="font-size:18px; font-weight:800; color:#111;">${formatMoney(data.avgExpense)}</div>
      </div>
    </div>
  </div>

  <div style="page-break-after: always;"></div>

  <div class="summary-title" style="margin-top:10px;">Detalle de Movimientos del Periodo</div>
  <table class="transaction-table">
    <thead>
      <tr>
        <th style="width:90px;">Fecha</th>
        <th>Descripción del Movimiento</th>
        <th style="text-align:center; width:90px;">Clase</th>
        <th style="text-align:right; width:130px;">Importe</th>
      </tr>
    </thead>
    <tbody>
      ${txsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>Sello de Validez: Finbook Financial System v1.0.5</div>
    <div>Página 1 de 1</div>
  </div>
</body></html>`;

  // Crear ventana oculta para renderizar el HTML
  const pdfWindow = new BrowserWindow({ show: false, width: 800, height: 1100 });
  pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  // Esperar a que cargue
  await new Promise<void>((resolve) => {
    pdfWindow.webContents.on('did-finish-load', () => resolve());
  });

  const pdfBuffer = await pdfWindow.webContents.printToPDF({
    printBackground: true,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    pageSize: 'A4'
  } as any);

  pdfWindow.close();

  // Mostrar diálogo para guardar
    const sanitizedMonth = data.monthLabel.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/\s+/g, '_');
    const result = await dialog.showSaveDialog({
      title: 'Guardar resumen mensual',
      defaultPath: `Finbook_Statement_${sanitizedMonth}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, pdfBuffer);
      return { success: true, path: result.filePath };
    }

    return { success: false };
  });

  ipcMain.handle('backupDatabase', async () => {
    try {
      const dbPath = dbService.getDatabasePath();
      const result = await dialog.showSaveDialog({
        title: 'Guardar copia de seguridad',
        defaultPath: `finbook_backup_${new Date().toISOString().split('T')[0]}.db`,
        filters: [{ name: 'SQLite Database', extensions: ['db'] }]
      });

      if (!result.canceled && result.filePath) {
        fs.copyFileSync(dbPath, result.filePath);
        return { success: true };
      }
      return { success: false, message: 'Cancelado' };
    } catch (error: any) {
      console.error('Error backing up database:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('restoreDatabase', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Seleccionar copia de seguridad para restaurar',
        filters: [{ name: 'SQLite Database', extensions: ['db'] }],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        const backupPath = result.filePaths[0];
        const dbPath = dbService.getDatabasePath();

        // Cerrar conexión actual
        await dbService.close();

        // Sobrescribir archivo
        fs.copyFileSync(backupPath, dbPath);

        // Re-inicialización ocurrirá al recargar la ventana o podemos reiniciarlo aquí
        dbService = new DatabaseService();
        
        if (mainWindow) {
          mainWindow.reload();
        }

        return { success: true };
      }
      return { success: false, message: 'Cancelado' };
    } catch (error: any) {
      console.error('Error restoring database:', error);
      return { success: false, error: error.message };
    }
  });