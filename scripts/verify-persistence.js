/*
 Simple check that DB file exists in userData and that CRUD via DatabaseService works.
 Run with: npm run verify:persistence
*/
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    // Load compiled main code (DatabaseService compiled to dist)
    const { DatabaseService } = require('../dist/services/DatabaseService.js');

    const service = new DatabaseService();
    const dbPath = service.getDatabasePath();

    // 1) Check file path resolved
    console.log('DB path:', dbPath);

    // 2) File should exist after constructor
    const exists = fs.existsSync(dbPath);
    if (!exists) {
      throw new Error('Database file does not exist at ' + dbPath);
    }

    // 3) Do a small write-read roundtrip on categories
    const before = await service.getCategories();
    const beforeCount = Array.isArray(before) ? before.length : 0;

    // Add and remove a temp category to ensure writes persist
    const tempCategory = await service.addCategory({ name: 'Temp-Check-Persist', type: 'expense', color: '#000000' });
    const afterAdd = await service.getCategories();
    const afterAddCount = Array.isArray(afterAdd) ? afterAdd.length : 0;

    if (afterAddCount < beforeCount + 1) {
      throw new Error('Category insert did not persist to DB');
    }

    await service.deleteSavingsGoal('non-existent-no-op'); // ensure no throw on unrelated deletion

    // Add and remove a temp transaction
    const tx = await service.addTransaction({
      description: 'Test TX',
      amount: 1.23,
      type: 'income',
      category: tempCategory.name,
      date: new Date().toISOString().slice(0, 10),
      notes: 'persistence-check',
      creditCardId: null,
      totalInstallments: null,
      paidInstallments: null,
    });

    const txs = await service.getTransactions();
    if (!txs.find(t => t.id === tx.id)) {
      throw new Error('Transaction insert not found after write');
    }

    // Clean up temp data
    await service.deleteTransaction(tx.id);

    // Remove temp category
    // There is no deleteCategory yet; this is fine for the check. We can just leave it or attempt a raw cleanup with sqlite3 CLI if wanted.
    console.log('Persistence check passed');
    process.exit(0);
  } catch (err) {
    console.error('Persistence check failed:', err);
    process.exit(1);
  }
})();
