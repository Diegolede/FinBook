const fs = require('fs');
const path = require('path');

const formatMoney = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);

const data = {
  monthLabel: 'Abril 2026',
  totalIncome: 0,
  totalExpenses: 267848,
  balance: -267848,
  transactionCount: 2,
  expenseCount: 2,
  avgExpense: 133924,
  topCategories: [
    { category: 'Compras', amount: 267848, percentage: 100 }
  ],
  topIncomeCategories: [],
  topCard: { name: 'Uala', bank: 'Uala', amount: 267848 }
};

const topCatsHtml = data.topCategories.map((c, i) =>
  `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${i + 1}. ${c.category}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatMoney(c.amount)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${c.percentage.toFixed(1)}%</td></tr>`
).join('');

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
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#111; padding:40px; background:#fff; }
  .header { text-align:center; margin-bottom:36px; padding-bottom:20px; border-bottom:2px solid #111; }
  .header h1 { font-size:28px; font-weight:800; letter-spacing:-0.5px; }
  .header p { font-size:18px; color:#6b7280; margin-top:6px; }
  .stats-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:28px; }
  .stat-card { background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px; text-align:center; }
  .stat-card .label { font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
  .stat-card .value { font-size:22px; font-weight:700; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding:8px 12px; font-size:12px; text-transform:uppercase; color:#6b7280; letter-spacing:0.5px; border-bottom:2px solid #111; }
  .footer { margin-top:40px; padding-top:16px; border-top:1px solid #e5e7eb; text-align:center; color:#9ca3af; font-size:12px; }
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
      <div class="label">Balance</div>
      <div class="value">${formatMoney(data.balance)}</div>
    </div>
  </div>

  <div class="stats-grid" style="grid-template-columns:1fr 1fr;">
    <div class="stat-card">
      <div class="label">Transacciones</div>
      <div class="value">${data.transactionCount}</div>
    </div>
    <div class="stat-card">
      <div class="label">Gasto promedio</div>
      <div class="value">${formatMoney(data.avgExpense)}</div>
    </div>
  </div>

  <div style="margin-top:28px;">
    <h2 style="font-size:16px;font-weight:700;color:#111;margin-bottom:12px;">📊 Top categorías de gasto</h2>
    <table>
      <thead><tr><th>Categoría</th><th style="text-align:right;">Monto</th><th style="text-align:right;">%</th></tr></thead>
      <tbody>${topCatsHtml}</tbody>
    </table>
  </div>

  ${cardHtml}

  <div class="footer">Generado por FinBook v1.0.5 — ${new Date().toLocaleDateString('es-AR')}</div>
</body></html>`;

// Guardar como HTML para poder generar PDF
const outputDir = process.cwd();
const htmlPath = path.join(outputDir, 'Finbook_Resumen_Reporte.html');
fs.writeFileSync(htmlPath, html);
console.log('HTML generado en:', htmlPath);
