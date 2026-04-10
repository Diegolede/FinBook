/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

export type Language = 'es' | 'en';

export interface Translations {
  // App
  app: {
    welcome: string;
    welcomeSubtitle: string;
    loading: string;
    version: string;
  };

  // Menu
  menu: {
    home: string;
    income: string;
    expenses: string;
    cards: string;
    savings: string;
    history: string;
    quit: string;
    settings: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    income: string;
    expenses: string;
    balance: string;
    currentMonth: string;
    quickActions: string;
    registerIncome: string;
    addMoneyReceived: string;
    registerExpense: string;
    addMoneySpent: string;
    manageSavings: string;
    viewGoalsAndAccounts: string;
    needs: string;
    wants: string;
    savings: string;
    needsDescription: string;
    wantsDescription: string;
    savingsDescription: string;
    budget: string;
    recentTransactions: string;
    noTransactions: string;
    useQuickActions: string;
    configureMonthlyBudget: string;
    chooseMethod: string;
    close: string;
    classicMethod: string;
    adjustedIncomeNeeds: string;
    comfortableIncomeSavings: string;
    debtAttack: string;
    wealthBuilding: string;
    unstablePeriods: string;
    customMethod: string;
    percentage: string;
  };

  // Income
  income: {
    title: string;
    subtitle: string;
    totalAccumulated: string;
    fullHistory: string;
    currentMonth: string;
    periodIncome: string;
    average: string;
    perIncome: string;
    quickActions: string;
    newIncome: string;
    monthlyGoal: string;
    quickIncomeAmount: string;
    add: string;
    monthlyIncomeGoal: string;
    accumulatedMonth: string;
    goalMonthly: string;
    progress: string;
    remaining: string;
    noGoalSet: string;
    setGoal: string;
    defineObjective: string;
    maintainControl: string;
    searchIncome: string;
    viewAll: string;
    startRegistering: string;
    useNewIncome: string;
    incomeGoal: string;
    objectiveToReach: string;
    description: string;
    origin: string;
    amount: string;
    amountReceived: string;
    category: string;
    date: string;
    notes: string;
    optional: string;
    additionalInfo: string;
    cancel: string;
    save: string;
    update: string;
    editIncome: string;
    newIncomeForm: string;
    selectCategory: string;
    confirmDelete: string;
    deletePermanently: string;
    continue: string;
    delete: string;
    loadingData: string;
  };

  // Expenses
  expenses: {
    title: string;
    subtitle: string;
    totalAccumulated: string;
    fullHistory: string;
    currentMonth: string;
    periodExpenses: string;
    average: string;
    perExpense: string;
    quickActions: string;
    newExpense: string;
    monthlyGoal: string;
    quickExpenseAmount: string;
    add: string;
    monthlyExpenseGoal: string;
    accumulatedMonth: string;
    goalMonthly: string;
    progress: string;
    remaining: string;
    noGoalSet: string;
    setGoal: string;
    defineObjective: string;
    maintainControl: string;
    searchExpenses: string;
    viewAll: string;
    startRegistering: string;
    useNewExpense: string;
    expenseGoal: string;
    maximumLimit: string;
    description: string;
    whatSpent: string;
    amount: string;
    amountSpent: string;
    category: string;
    date: string;
    notes: string;
    optional: string;
    additionalInfo: string;
    cancel: string;
    save: string;
    update: string;
    editExpense: string;
    newExpenseForm: string;
    selectCategory: string;
    confirmDelete: string;
    deletePermanently: string;
    continue: string;
    delete: string;
    loadingData: string;
    currentProgress: string;
    completed: string;
  };

  // Credit Cards
  creditCards: {
    title: string;
    subtitle: string;
    accumulatedDebt: string;
    totalPending: string;
    monthlyDue: string;
    periodPayment: string;
    remainingInstallments: string;
    pendingPayment: string;
    quickActions: string;
    newCard: string;
    newExpense: string;
    fixedExpense: string;
    myCards: string;
    cards: string;
    limit: string;
    balance: string;
    available: string;
    utilization: string;
    simpleExpenses: string;
    expenses: string;
    fixedExpenses: string;
    installmentExpenses: string;
    searchInstallments: string;
    viewAll: string;
    noExpenses: string;
    singleInstallment: string;
    useNewExpense: string;
    noFixedExpenses: string;
    recurringExpenses: string;
    noInstallments: string;
    largePurchases: string;
    editCard: string;
    newCardForm: string;
    cardName: string;
    bank: string;
    creditLimit: string;
    maximumAvailable: string;
    cancel: string;
    save: string;
    update: string;
    confirmDelete: string;
    deletePermanently: string;
    continue: string;
    delete: string;
    editFixedExpense: string;
    editExpense: string;
    newFixedExpense: string;
    newExpenseWithCard: string;
    description: string;
    whatBought: string;
    totalExpense: string;
    creditCard: string;
    selectCard: string;
    category: string;
    selectCategory: string;
    amount: string;
    totalInstallments: string;
    monthlyPayments: string;
    amountPerInstallment: string;
    totalInstallmentsLabel: string;
    notes: string;
    optional: string;
    additionalInfo: string;
    saveExpense: string;
    loadingData: string;
    installmentProgress: string;
    total: string;
    perInstallment: string;
    remaining: string;
    payInstallment: string;
    undoPayment: string;
    completed: string;
    pendingInstallments: string;
    paymentCompleted: string;
  };

  // Savings
  savings: {
    title: string;
    subtitle: string;
    totalSavings: string;
    allAccounts: string;
    goalProgress: string;
    currentAccumulated: string;
    generalProgress: string;
    percentageCompleted: string;
    quickActions: string;
    newGoal: string;
    setGoal: string;
    newAccount: string;
    registerAccount: string;
    savingsGoals: string;
    goals: string;
    current: string;
    objective: string;
    progress: string;
    targetDate: string;
    daysRemaining: string;
    days: string;
    deposit: string;
    withdraw: string;
    savingsAccounts: string;
    accounts: string;
    interest: string;
    annualGain: string;
    editGoal: string;
    newSavingsGoal: string;
    goalName: string;
    savingsObjective: string;
    targetAmount: string;
    howMuchSave: string;
    currentAmount: string;
    howMuchSaved: string;
    category: string;
    notes: string;
    optional: string;
    additionalInfo: string;
    cancel: string;
    save: string;
    update: string;
    editAccount: string;
    newSavingsAccount: string;
    accountName: string;
    accountIdentifier: string;
    currentBalance: string;
    moneyAvailable: string;
    interestRate: string;
    annualYield: string;
    accountType: string;
    savings: string;
    checking: string;
    investment: string;
    depositInGoal: string;
    depositInAccount: string;
    withdrawFromGoal: string;
    withdrawFromAccount: string;
    amount: string;
    amountToDeposit: string;
    confirm: string;
    loadingData: string;
  };

  // Categories
  categories: {
    title: string;
    subtitle: string;
    newCategory: string;
    incomeCategories: string;
    expenseCategories: string;
    editCategory: string;
    newCategoryForm: string;
    name: string;
    type: string;
    expense: string;
    income: string;
    color: string;
    cancel: string;
    save: string;
    update: string;
    loadingCategories: string;
  };

  // Reports
  reports: {
    title: string;
    subtitle: string;
    balance: string;
    income: string;
    expenses: string;
    monthlyTrend: string;
    categoryDistribution: string;
    topCategories: string;
    ofTotal: string;
    lastWeek: string;
    lastMonth: string;
    lastYear: string;
    all: string;
    loadingReports: string;
  };

  // History
  history: {
    title: string;
    subtitle: string;
    monthlyHistory: string;
    selectMonth: string;
    noHistory: string;
    noHistoryDescription: string;
    totalIncome: string;
    totalExpenses: string;
    totalSavings: string;
    balance: string;
    transactions: string;
    avgExpense: string;
    topExpenseCategories: string;
    topIncomeCategories: string;
    mostUsedCard: string;
    exportPDF: string;
    exporting: string;
    exportSuccess: string;
    exportError: string;
    backToList: string;
    of: string;
    monthSummary: string;
    loadingHistory: string;
  };

  // Transactions
  transactions: {
    title: string;
    subtitle: string;
    newTransaction: string;
    search: string;
    searchTransactions: string;
    type: string;
    all: string;
    income: string;
    expense: string;
    category: string;
    allCategories: string;
    clearFilters: string;
    noTransactions: string;
    editTransaction: string;
    newTransactionForm: string;
    description: string;
    amount: string;
    typeLabel: string;
    categoryLabel: string;
    selectCategory: string;
    date: string;
    notes: string;
    optional: string;
    additionalInfo: string;
    cancel: string;
    save: string;
    update: string;
    confirmDelete: string;
    deletePermanently: string;
    continue: string;
    delete: string;
    loadingTransactions: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    selectLanguage: string;
    spanish: string;
    english: string;
    backup: string;
    restore: string;
    backupSuccess: string;
    restoreSuccess: string;
    restoreWarning: string;
    dataManagement: string;
  };

  // Common
  common: {
    error: string;
    errorSaving: string;
    errorDeleting: string;
    errorLoading: string;
    pleaseEnter: string;
    validAmount: string;
    greaterThanZero: string;
    pleaseSelect: string;
    category: string;
    cancel: string;
    save: string;
    update: string;
    delete: string;
    edit: string;
    new: string;
    all: string;
    example: string;
    numbersOnly: string;
    quickExpense: string;
    quickIncome: string;
    confirmDelete: string;
    deletePermanently: string;
    // Common categories
    electronics: string;
    clothing: string;
    food: string;
    transportation: string;
    entertainment: string;
    shopping: string;
    other: string;
    vacations: string;
    emergencies: string;
    housing: string;
    education: string;
  };
}

const translations: Record<Language, Translations> = {
  es: {
    app: {
      welcome: 'Bienvenido a FinBook',
      welcomeSubtitle: 'Vista general de tus ingresos, gastos y balance del mes actual',
      loading: 'Cargando información...',
      version: 'FinBook v1.0.5',
    },
    menu: {
      home: 'Inicio',
      income: 'Ingresos',
      expenses: 'Gastos',
      cards: 'Tarjetas',
      savings: 'Ahorros',
      history: 'Historial',
      quit: 'Salir de la aplicación',
      settings: 'Configuración',
    },
    dashboard: {
      title: 'Bienvenido a FinBook',
      subtitle: 'Vista general de tus ingresos, gastos y balance del mes actual',
      income: 'Ingresos',
      expenses: 'Gastos',
      balance: 'Saldo',
      currentMonth: 'De este mes',
      quickActions: 'Acciones rápidas',
      registerIncome: 'Registrar ingreso',
      addMoneyReceived: 'Agregar dinero recibido',
      registerExpense: 'Registrar gasto',
      addMoneySpent: 'Agregar dinero gastado',
      manageSavings: 'Gestionar ahorros',
      viewGoalsAndAccounts: 'Ver metas y cuentas',
      needs: 'Necesidades',
      wants: 'Deseos',
      savings: 'Ahorros',
      needsDescription: 'Alquiler, comida, servicios básicos y transporte',
      wantsDescription: 'Entretenimiento, restaurantes, compras y hobbies',
      savingsDescription: 'Fondo de emergencia, inversiones y metas a largo plazo',
      budget: 'Presupuesto',
      recentTransactions: 'Transacciones recientes',
      noTransactions: 'Aún no tienes transacciones registradas',
      useQuickActions: 'Usa las acciones rápidas para agregar tu primer ingreso o gasto',
      configureMonthlyBudget: 'Configurar presupuesto mensual',
      chooseMethod: 'Elige un método de distribución o personaliza los porcentajes',
      close: 'Cerrar',
      classicMethod: 'Método clásico',
      adjustedIncomeNeeds: 'Ingresos ajustados / Prioridad de necesidades',
      comfortableIncomeSavings: 'Ingresos cómodos / Prioridad de ahorro',
      debtAttack: 'Ataque de deudas / Ahorro rápido',
      wealthBuilding: 'Construcción de patrimonio / Largo plazo',
      unstablePeriods: 'Períodos inestables / Buffer financiero',
      customMethod: 'Método personalizado',
      percentage: '%',
    },
    income: {
      title: 'Ingresos',
      subtitle: 'Agrega tus ingresos, establece metas mensuales y lleva un registro completo de todo el dinero que recibes',
      totalAccumulated: 'Total acumulado',
      fullHistory: 'Historial completo',
      currentMonth: 'Mes actual',
      periodIncome: 'Ingresos del período',
      average: 'Promedio',
      perIncome: 'Por ingreso',
      quickActions: 'Acciones rápidas',
      newIncome: 'Nuevo ingreso',
      monthlyGoal: 'Meta mensual',
      quickIncomeAmount: 'Monto del ingreso rápido',
      add: 'Agregar',
      monthlyIncomeGoal: 'Meta mensual de ingresos',
      accumulatedMonth: 'Acumulado del mes',
      goalMonthly: 'Meta mensual',
      progress: 'Progreso',
      remaining: 'Faltan',
      noGoalSet: 'No hay meta mensual establecida',
      setGoal: 'Establecer meta',
      defineObjective: 'Define tu objetivo mensual',
      maintainControl: 'Establece una meta para mantener un control mejor de tus ingresos',
      searchIncome: 'Buscar ingresos...',
      viewAll: 'Ver todas',
      startRegistering: 'Comienza registrando tu primer ingreso',
      useNewIncome: 'Usa el botón "Nuevo ingreso" o el ingreso rápido para empezar',
      incomeGoal: 'Meta mensual de ingresos',
      objectiveToReach: '(objetivo a alcanzar)',
      description: 'Descripción',
      origin: '(origen del ingreso)',
      amount: 'Monto',
      amountReceived: '(cantidad recibida)',
      category: 'Categoría',
      date: 'Fecha',
      notes: 'Notas',
      optional: '(opcional)',
      additionalInfo: 'Información adicional (opcional)',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Actualizar',
      editIncome: 'Editar ingreso',
      newIncomeForm: 'Nuevo ingreso',
      selectCategory: 'Seleccionar categoría',
      confirmDelete: 'Confirmar eliminación',
      deletePermanently: 'Esta acción eliminará permanentemente el ingreso. ¿Deseas continuar?',
      continue: 'Continuar',
      delete: 'Eliminar',
      loadingData: 'Cargando datos...',
    },
    expenses: {
      title: 'Gastos',
      subtitle: 'Registra cada gasto, establece límites mensuales y mantén un control detallado de tus finanzas',
      totalAccumulated: 'Total acumulado',
      fullHistory: 'Historial completo',
      currentMonth: 'Mes actual',
      periodExpenses: 'Gastos del período',
      average: 'Promedio',
      perExpense: 'Por gasto',
      quickActions: 'Acciones rápidas',
      newExpense: 'Nuevo gasto',
      monthlyGoal: 'Meta mensual',
      quickExpenseAmount: 'Monto del gasto rápido',
      add: 'Agregar',
      monthlyExpenseGoal: 'Meta mensual de gastos',
      accumulatedMonth: 'Acumulado del mes',
      goalMonthly: 'Meta mensual',
      progress: 'Progreso',
      remaining: 'Restante',
      noGoalSet: 'No hay meta mensual establecida',
      setGoal: 'Establecer meta',
      defineObjective: 'Define tu objetivo mensual',
      maintainControl: 'Establece una meta para mantener un control mejor de tus gastos',
      searchExpenses: 'Buscar gastos...',
      viewAll: 'Ver todas',
      startRegistering: 'Comienza registrando tu primer gasto',
      useNewExpense: 'Usa el botón "Nuevo gasto" o el gasto rápido para empezar',
      expenseGoal: 'Meta mensual de gastos',
      maximumLimit: '(límite máximo)',
      description: 'Descripción',
      whatSpent: '(en qué gastaste)',
      amount: 'Monto',
      amountSpent: '(cantidad gastada)',
      category: 'Categoría',
      date: 'Fecha',
      notes: 'Notas',
      optional: '(opcional)',
      additionalInfo: 'Información adicional (opcional)',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Actualizar',
      editExpense: 'Editar gasto',
      newExpenseForm: 'Nuevo gasto',
      selectCategory: 'Seleccionar categoría',
      confirmDelete: 'Confirmar eliminación',
      deletePermanently: 'Esta acción eliminará permanentemente el gasto. ¿Deseas continuar?',
      continue: 'Continuar',
      delete: 'Eliminar',
      loadingData: 'Cargando datos...',
      currentProgress: 'Progreso actual',
      completed: 'completado',
    },
    creditCards: {
      title: 'Tarjetas',
      subtitle: 'Gestiona tus tarjetas, registra gastos en cuotas y mantén un seguimiento de tus deudas pendientes',
      accumulatedDebt: 'Deuda acumulada',
      totalPending: 'Total pendiente',
      monthlyDue: 'Vencimiento mensual',
      periodPayment: 'Pago del período',
      remainingInstallments: 'Cuotas restantes',
      pendingPayment: 'Pendiente de pago',
      quickActions: 'Acciones rápidas',
      newCard: 'Nueva tarjeta',
      newExpense: 'Nuevo gasto',
      fixedExpense: 'Gasto fijo',
      myCards: 'Mis tarjetas',
      cards: 'tarjetas',
      limit: 'Límite',
      balance: 'Saldo',
      available: 'Disponible',
      utilization: 'Utilización',
      simpleExpenses: 'Gastos simples',
      expenses: 'gastos',
      fixedExpenses: 'Gastos fijos',
      installmentExpenses: 'Gastos en cuotas',
      searchInstallments: 'Buscar gastos en cuotas...',
      viewAll: 'Ver todas',
      noExpenses: 'No hay gastos registrados',
      singleInstallment: 'Los gastos de una sola cuota aparecerán aquí. Usa "Nuevo gasto" para agregar uno',
      useNewExpense: 'Usa "Nuevo gasto" para agregar uno',
      noFixedExpenses: 'No hay gastos fijos registrados',
      recurringExpenses: 'Los gastos recurrentes (suscripciones, servicios) aparecerán aquí',
      noInstallments: 'No hay gastos en cuotas',
      largePurchases: 'Los gastos a plazos (compras grandes) aparecerán aquí. Puedes pagar cuotas individualmente',
      editCard: 'Editar tarjeta',
      newCardForm: 'Nueva tarjeta',
      cardName: 'Nombre de la tarjeta',
      bank: 'Banco',
      creditLimit: 'Límite de crédito',
      maximumAvailable: '(monto máximo disponible)',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Actualizar',
      confirmDelete: 'Confirmar eliminación',
      deletePermanently: 'Esta acción eliminará permanentemente la tarjeta y sus datos. ¿Deseas continuar?',
      continue: 'Continuar',
      delete: 'Eliminar',
      editFixedExpense: 'Editar gasto fijo',
      editExpense: 'Editar gasto',
      newFixedExpense: 'Nuevo gasto fijo',
      newExpenseWithCard: 'Nuevo gasto con tarjeta',
      description: 'Descripción',
      whatBought: '(qué compraste o pagaste)',
      totalExpense: '(total del gasto)',
      creditCard: 'Tarjeta de crédito',
      selectCard: 'Seleccionar tarjeta',
      category: 'Categoría',
      selectCategory: 'Seleccionar categoría',
      amount: 'Monto',
      totalInstallments: 'Total de cuotas',
      monthlyPayments: '(número de pagos mensuales)',
      amountPerInstallment: 'Monto por cuota',
      totalInstallmentsLabel: 'Total de cuotas',
      notes: 'Notas',
      optional: '(opcional)',
      additionalInfo: 'Información adicional (opcional)',
      saveExpense: 'Guardar gasto',
      loadingData: 'Cargando datos...',
      installmentProgress: 'Progreso de cuotas',
      total: 'Total',
      perInstallment: 'Por cuota',
      remaining: 'Restante',
      payInstallment: 'Pagar cuota',
      undoPayment: 'Retroceder cuota',
      completed: 'Completado',
      pendingInstallments: 'cuota pendiente',
      paymentCompleted: '¡Pago completado!',
    },
    savings: {
      title: 'Ahorros',
      subtitle: 'Crea metas de ahorro, registra tus cuentas y haz seguimiento del progreso hacia tus objetivos financieros',
      totalSavings: 'Ahorros totales',
      allAccounts: 'En todas las cuentas',
      goalProgress: 'Progreso de metas',
      currentAccumulated: 'Acumulado actual',
      generalProgress: 'Progreso general',
      percentageCompleted: 'Porcentaje completado',
      quickActions: 'Acciones rápidas',
      newGoal: 'Nueva meta',
      setGoal: 'Establecer meta',
      newAccount: 'Nueva cuenta',
      registerAccount: 'Registrar cuenta',
      savingsGoals: 'Metas de ahorro',
      goals: 'metas',
      current: 'Actual',
      objective: 'Objetivo',
      progress: 'Progreso',
      targetDate: 'Fecha objetivo',
      daysRemaining: 'Días restantes',
      days: 'días',
      deposit: 'Depositar',
      withdraw: 'Retirar',
      savingsAccounts: 'Cuentas de ahorro',
      accounts: 'cuentas',
      interest: 'Interés',
      annualGain: 'Ganancia anual',
      editGoal: 'Editar meta',
      newSavingsGoal: 'Nueva meta de ahorro',
      goalName: 'Nombre de la meta',
      savingsObjective: '(objetivo de ahorro)',
      targetAmount: 'Monto objetivo',
      howMuchSave: '(cuánto quieres ahorrar)',
      currentAmount: 'Monto actual',
      howMuchSaved: '(cuánto has ahorrado hasta ahora)',
      category: 'Categoría',
      notes: 'Notas',
      optional: '(opcional)',
      additionalInfo: 'Información adicional (opcional)',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Actualizar',
      editAccount: 'Editar cuenta',
      newSavingsAccount: 'Nueva cuenta de ahorro',
      accountName: 'Nombre de la cuenta',
      accountIdentifier: '(identificador de la cuenta)',
      currentBalance: 'Saldo actual',
      moneyAvailable: '(dinero disponible en la cuenta)',
      interestRate: 'Tasa de interés (%)',
      annualYield: '(rendimiento anual estimado)',
      accountType: 'Tipo de cuenta',
      savings: 'Ahorros',
      checking: 'Corriente',
      investment: 'Inversión',
      depositInGoal: 'Depositar en meta',
      depositInAccount: 'Depositar en cuenta',
      withdrawFromGoal: 'Retirar en meta',
      withdrawFromAccount: 'Retirar en cuenta',
      amount: 'Monto',
      amountToDeposit: '(cantidad a depositar o retirar)',
      confirm: 'Confirmar',
      loadingData: 'Cargando datos...',
    },
    categories: {
      title: 'Categorías',
      subtitle: 'Gestiona las categorías de tus transacciones',
      newCategory: 'Nueva Categoría',
      incomeCategories: 'Categorías de Ingresos',
      expenseCategories: 'Categorías de Gastos',
      editCategory: 'Editar Categoría',
      newCategoryForm: 'Nueva Categoría',
      name: 'Nombre',
      type: 'Tipo',
      expense: 'Gasto',
      income: 'Ingreso',
      color: 'Color',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Actualizar',
      loadingCategories: 'Cargando categorías...',
    },
    reports: {
      title: 'Reportes',
      subtitle: 'Análisis detallado de tus finanzas',
      balance: 'Balance',
      income: 'Ingresos',
      expenses: 'Gastos',
      monthlyTrend: 'Tendencia Mensual',
      categoryDistribution: 'Distribución por Categorías',
      topCategories: 'Categorías Principales',
      ofTotal: 'del total',
      lastWeek: 'Última Semana',
      lastMonth: 'Último Mes',
      lastYear: 'Último Año',
      all: 'Todo',
      loadingReports: 'Cargando reportes...',
    },
    history: {
      title: 'Historial',
      subtitle: 'Resúmenes mensuales de tus finanzas',
      monthlyHistory: 'Historial mensual',
      selectMonth: 'Selecciona un mes para ver el resumen',
      noHistory: 'Sin historial disponible',
      noHistoryDescription: 'Los resúmenes aparecerán aquí cuando registres transacciones',
      totalIncome: 'Ingresos totales',
      totalExpenses: 'Gastos totales',
      totalSavings: 'Ahorro mensual',
      balance: 'Balance',
      transactions: 'Transacciones',
      avgExpense: 'Gasto promedio',
      topExpenseCategories: 'Top categorías de gasto',
      topIncomeCategories: 'Top categorías de ingreso',
      mostUsedCard: 'Tarjeta más utilizada',
      exportPDF: 'Exportar PDF',
      exporting: 'Exportando...',
      exportSuccess: 'PDF guardado exitosamente',
      exportError: 'Error al exportar el PDF',
      backToList: 'Volver al historial',
      of: 'del total',
      monthSummary: 'Resumen del mes',
      loadingHistory: 'Cargando historial...',
    },
    transactions: {
      title: 'Transacciones',
      subtitle: 'Gestiona tus ingresos y gastos',
      newTransaction: 'Nueva Transacción',
      search: 'Buscar',
      searchTransactions: 'Buscar transacciones...',
      type: 'Tipo',
      all: 'Todos',
      income: 'Ingresos',
      expense: 'Gastos',
      category: 'Categoría',
      allCategories: 'Todas',
      clearFilters: 'Limpiar Filtros',
      noTransactions: 'No se encontraron transacciones',
      editTransaction: 'Editar Transacción',
      newTransactionForm: 'Nueva Transacción',
      description: 'Descripción',
      amount: 'Monto',
      typeLabel: 'Tipo',
      categoryLabel: 'Categoría',
      selectCategory: 'Seleccionar categoría',
      date: 'Fecha',
      notes: 'Notas (opcional)',
      optional: '(opcional)',
      additionalInfo: 'Información adicional (opcional)',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Actualizar',
      confirmDelete: '¿Estás seguro de que quieres eliminar esta transacción?',
      deletePermanently: 'Esta acción eliminará permanentemente la transacción',
      continue: 'Continuar',
      delete: 'Eliminar',
      loadingTransactions: 'Cargando transacciones...',
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      selectLanguage: 'Seleccionar idioma',
      spanish: 'Español',
      english: 'Inglés',
      backup: 'Guardar información (Copia de seguridad)',
      restore: 'Cargar información (Restaurar datos)',
      backupSuccess: 'Copia de seguridad creada con éxito',
      restoreSuccess: 'Datos restaurados con éxito',
      restoreWarning: 'Esta acción sobrescribirá todos tus datos actuales. ¿DESEAS CONTINUAR?',
      dataManagement: 'Gestión de Datos',
    },
    common: {
      error: 'Error',
      errorSaving: 'Error al guardar',
      errorDeleting: 'Error al eliminar',
      errorLoading: 'Error al cargar',
      pleaseEnter: 'Por favor, ingresa',
      validAmount: 'un monto válido',
      greaterThanZero: 'mayor a cero',
      pleaseSelect: 'Por favor, selecciona',
      category: 'una categoría',
      cancel: 'Cancelar',
      save: 'Guardar',
      update: 'Actualizar',
      delete: 'Eliminar',
      edit: 'Editar',
      new: 'Nuevo',
      all: 'Todos',
      example: 'Ej:',
      numbersOnly: '0.00 (solo números)',
      quickExpense: 'Gasto rápido',
      quickIncome: 'Ingreso rápido',
      confirmDelete: 'Confirmar eliminación',
      deletePermanently: '¿Estás seguro de que deseas eliminar este elemento permanentemente?',
      electronics: 'Electrónicos',
      clothing: 'Ropa',
      food: 'Alimentación',
      transportation: 'Transporte',
      entertainment: 'Entretenimiento',
      shopping: 'Compras',
      other: 'Otros',
      vacations: 'Vacaciones',
      emergencies: 'Emergencias',
      housing: 'Vivienda',
      education: 'Educación',
    },
  },
  en: {
    app: {
      welcome: 'Welcome to FinBook',
      welcomeSubtitle: 'Overview of your income, expenses and balance for the current month',
      loading: 'Loading information...',
      version: 'FinBook v1.0.5',
    },
    menu: {
      home: 'Home',
      income: 'Income',
      expenses: 'Expenses',
      cards: 'Cards',
      savings: 'Savings',
      history: 'History',
      quit: 'Quit application',
      settings: 'Settings',
    },
    dashboard: {
      title: 'Welcome to FinBook',
      subtitle: 'Overview of your income, expenses and balance for the current month',
      income: 'Income',
      expenses: 'Expenses',
      balance: 'Balance',
      currentMonth: 'Current month',
      quickActions: 'Quick actions',
      registerIncome: 'Register income',
      addMoneyReceived: 'Add money received',
      registerExpense: 'Register expense',
      addMoneySpent: 'Add money spent',
      manageSavings: 'Manage savings',
      viewGoalsAndAccounts: 'View goals and accounts',
      needs: 'Needs',
      wants: 'Wants',
      savings: 'Savings',
      needsDescription: 'Rent, food, basic services and transportation',
      wantsDescription: 'Entertainment, restaurants, shopping and hobbies',
      savingsDescription: 'Emergency fund, investments and long-term goals',
      budget: 'Budget',
      recentTransactions: 'Recent transactions',
      noTransactions: 'You don\'t have any transactions registered yet',
      useQuickActions: 'Use quick actions to add your first income or expense',
      configureMonthlyBudget: 'Configure monthly budget',
      chooseMethod: 'Choose a distribution method or customize the percentages',
      close: 'Close',
      classicMethod: 'Classic method',
      adjustedIncomeNeeds: 'Adjusted income / Needs priority',
      comfortableIncomeSavings: 'Comfortable income / Savings priority',
      debtAttack: 'Debt attack / Quick savings',
      wealthBuilding: 'Wealth building / Long term',
      unstablePeriods: 'Unstable periods / Financial buffer',
      customMethod: 'Custom method',
      percentage: '%',
    },
    income: {
      title: 'Income',
      subtitle: 'Add your income, set monthly goals and keep a complete record of all the money you receive',
      totalAccumulated: 'Total accumulated',
      fullHistory: 'Full history',
      currentMonth: 'Current month',
      periodIncome: 'Period income',
      average: 'Average',
      perIncome: 'Per income',
      quickActions: 'Quick actions',
      newIncome: 'New income',
      monthlyGoal: 'Monthly goal',
      quickIncomeAmount: 'Quick income amount',
      add: 'Add',
      monthlyIncomeGoal: 'Monthly income goal',
      accumulatedMonth: 'Accumulated this month',
      goalMonthly: 'Monthly goal',
      progress: 'Progress',
      remaining: 'Remaining',
      noGoalSet: 'No monthly goal set',
      setGoal: 'Set goal',
      defineObjective: 'Define your monthly objective',
      maintainControl: 'Set a goal to maintain better control of your income',
      searchIncome: 'Search income...',
      viewAll: 'View all',
      startRegistering: 'Start by registering your first income',
      useNewIncome: 'Use the "New income" button or quick income to get started',
      incomeGoal: 'Monthly income goal',
      objectiveToReach: '(objective to reach)',
      description: 'Description',
      origin: '(income origin)',
      amount: 'Amount',
      amountReceived: '(amount received)',
      category: 'Category',
      date: 'Date',
      notes: 'Notes',
      optional: '(optional)',
      additionalInfo: 'Additional information (optional)',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      editIncome: 'Edit income',
      newIncomeForm: 'New income',
      selectCategory: 'Select category',
      confirmDelete: 'Confirm deletion',
      deletePermanently: 'This action will permanently delete the income. Do you want to continue?',
      continue: 'Continue',
      delete: 'Delete',
      loadingData: 'Loading data...',
    },
    expenses: {
      title: 'Expenses',
      subtitle: 'Record each expense, set monthly limits and maintain detailed control of your finances',
      totalAccumulated: 'Total accumulated',
      fullHistory: 'Full history',
      currentMonth: 'Current month',
      periodExpenses: 'Period expenses',
      average: 'Average',
      perExpense: 'Per expense',
      quickActions: 'Quick actions',
      newExpense: 'New expense',
      monthlyGoal: 'Monthly goal',
      quickExpenseAmount: 'Quick expense amount',
      add: 'Add',
      monthlyExpenseGoal: 'Monthly expense goal',
      accumulatedMonth: 'Accumulated this month',
      goalMonthly: 'Monthly goal',
      progress: 'Progress',
      remaining: 'Remaining',
      noGoalSet: 'No monthly goal set',
      setGoal: 'Set goal',
      defineObjective: 'Define your monthly objective',
      maintainControl: 'Set a goal to maintain better control of your expenses',
      searchExpenses: 'Search expenses...',
      viewAll: 'View all',
      startRegistering: 'Start by registering your first expense',
      useNewExpense: 'Use the "New expense" button or quick expense to get started',
      expenseGoal: 'Monthly expense goal',
      maximumLimit: '(maximum limit)',
      description: 'Description',
      whatSpent: '(what you spent on)',
      amount: 'Amount',
      amountSpent: '(amount spent)',
      category: 'Category',
      date: 'Date',
      notes: 'Notes',
      optional: '(optional)',
      additionalInfo: 'Additional information (optional)',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      editExpense: 'Edit expense',
      newExpenseForm: 'New expense',
      selectCategory: 'Select category',
      confirmDelete: 'Confirm deletion',
      deletePermanently: 'This action will permanently delete the expense. Do you want to continue?',
      continue: 'Continue',
      delete: 'Delete',
      loadingData: 'Loading data...',
      currentProgress: 'Current progress',
      completed: 'completed',
    },
    creditCards: {
      title: 'Cards',
      subtitle: 'Manage your cards, record installment expenses and keep track of your pending debts',
      accumulatedDebt: 'Accumulated debt',
      totalPending: 'Total pending',
      monthlyDue: 'Monthly due',
      periodPayment: 'Period payment',
      remainingInstallments: 'Remaining installments',
      pendingPayment: 'Pending payment',
      quickActions: 'Quick actions',
      newCard: 'New card',
      newExpense: 'New expense',
      fixedExpense: 'Fixed expense',
      myCards: 'My cards',
      cards: 'cards',
      limit: 'Limit',
      balance: 'Balance',
      available: 'Available',
      utilization: 'Utilization',
      simpleExpenses: 'Simple expenses',
      expenses: 'expenses',
      fixedExpenses: 'Fixed expenses',
      installmentExpenses: 'Installment expenses',
      searchInstallments: 'Search installment expenses...',
      viewAll: 'View all',
      noExpenses: 'No expenses registered',
      singleInstallment: 'Single installment expenses will appear here. Use "New expense" to add one',
      useNewExpense: 'Use "New expense" to add one',
      noFixedExpenses: 'No fixed expenses registered',
      recurringExpenses: 'Recurring expenses (subscriptions, services) will appear here',
      noInstallments: 'No installment expenses',
      largePurchases: 'Installment expenses (large purchases) will appear here. You can pay installments individually',
      editCard: 'Edit card',
      newCardForm: 'New card',
      cardName: 'Card name',
      bank: 'Bank',
      creditLimit: 'Credit limit',
      maximumAvailable: '(maximum amount available)',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      confirmDelete: 'Confirm deletion',
      deletePermanently: 'This action will permanently delete the card and its data. Do you want to continue?',
      continue: 'Continue',
      delete: 'Delete',
      editFixedExpense: 'Edit fixed expense',
      editExpense: 'Edit expense',
      newFixedExpense: 'New fixed expense',
      newExpenseWithCard: 'New expense with card',
      description: 'Description',
      whatBought: '(what you bought or paid for)',
      totalExpense: '(total expense)',
      creditCard: 'Credit card',
      selectCard: 'Select card',
      category: 'Category',
      selectCategory: 'Select category',
      amount: 'Amount',
      totalInstallments: 'Total installments',
      monthlyPayments: '(number of monthly payments)',
      amountPerInstallment: 'Amount per installment',
      totalInstallmentsLabel: 'Total installments',
      notes: 'Notes',
      optional: '(optional)',
      additionalInfo: 'Additional information (optional)',
      saveExpense: 'Save expense',
      loadingData: 'Loading data...',
      installmentProgress: 'Installment progress',
      total: 'Total',
      perInstallment: 'Per installment',
      remaining: 'Remaining',
      payInstallment: 'Pay installment',
      undoPayment: 'Undo payment',
      completed: 'Completed',
      pendingInstallments: 'installment pending',
      paymentCompleted: 'Payment completed!',
    },
    savings: {
      title: 'Savings',
      subtitle: 'Create savings goals, register your accounts and track progress towards your financial objectives',
      totalSavings: 'Total savings',
      allAccounts: 'In all accounts',
      goalProgress: 'Goal progress',
      currentAccumulated: 'Current accumulated',
      generalProgress: 'General progress',
      percentageCompleted: 'Percentage completed',
      quickActions: 'Quick actions',
      newGoal: 'New goal',
      setGoal: 'Set goal',
      newAccount: 'New account',
      registerAccount: 'Register account',
      savingsGoals: 'Savings goals',
      goals: 'goals',
      current: 'Current',
      objective: 'Objective',
      progress: 'Progress',
      targetDate: 'Target date',
      daysRemaining: 'Days remaining',
      days: 'days',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      savingsAccounts: 'Savings accounts',
      accounts: 'accounts',
      interest: 'Interest',
      annualGain: 'Annual gain',
      editGoal: 'Edit goal',
      newSavingsGoal: 'New savings goal',
      goalName: 'Goal name',
      savingsObjective: '(savings objective)',
      targetAmount: 'Target amount',
      howMuchSave: '(how much you want to save)',
      currentAmount: 'Current amount',
      howMuchSaved: '(how much you have saved so far)',
      category: 'Category',
      notes: 'Notes',
      optional: '(optional)',
      additionalInfo: 'Additional information (optional)',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      editAccount: 'Edit account',
      newSavingsAccount: 'New savings account',
      accountName: 'Account name',
      accountIdentifier: '(account identifier)',
      currentBalance: 'Current balance',
      moneyAvailable: '(money available in the account)',
      interestRate: 'Interest rate (%)',
      annualYield: '(estimated annual yield)',
      accountType: 'Account type',
      savings: 'Savings',
      checking: 'Checking',
      investment: 'Investment',
      depositInGoal: 'Deposit in goal',
      depositInAccount: 'Deposit in account',
      withdrawFromGoal: 'Withdraw from goal',
      withdrawFromAccount: 'Withdraw from account',
      amount: 'Amount',
      amountToDeposit: '(amount to deposit or withdraw)',
      confirm: 'Confirm',
      loadingData: 'Loading data...',
    },
    categories: {
      title: 'Categories',
      subtitle: 'Manage your transaction categories',
      newCategory: 'New Category',
      incomeCategories: 'Income Categories',
      expenseCategories: 'Expense Categories',
      editCategory: 'Edit Category',
      newCategoryForm: 'New Category',
      name: 'Name',
      type: 'Type',
      expense: 'Expense',
      income: 'Income',
      color: 'Color',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      loadingCategories: 'Loading categories...',
    },
    reports: {
      title: 'Reports',
      subtitle: 'Detailed analysis of your finances',
      balance: 'Balance',
      income: 'Income',
      expenses: 'Expenses',
      monthlyTrend: 'Monthly Trend',
      categoryDistribution: 'Category Distribution',
      topCategories: 'Top Categories',
      ofTotal: 'of total',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month',
      lastYear: 'Last Year',
      all: 'All',
      loadingReports: 'Loading reports...',
    },
    history: {
      title: 'History',
      subtitle: 'Monthly summaries of your finances',
      monthlyHistory: 'Monthly history',
      selectMonth: 'Select a month to view the summary',
      noHistory: 'No history available',
      noHistoryDescription: 'Summaries will appear here when you register transactions',
      totalIncome: 'Total income',
      totalExpenses: 'Total expenses',
      totalSavings: 'Monthly savings',
      balance: 'Balance',
      transactions: 'Transactions',
      avgExpense: 'Average expense',
      topExpenseCategories: 'Top expense categories',
      topIncomeCategories: 'Top income categories',
      mostUsedCard: 'Most used card',
      exportPDF: 'Export PDF',
      exporting: 'Exporting...',
      exportSuccess: 'PDF saved successfully',
      exportError: 'Error exporting PDF',
      backToList: 'Back to history',
      of: 'of total',
      monthSummary: 'Month summary',
      loadingHistory: 'Loading history...',
    },
    transactions: {
      title: 'Transactions',
      subtitle: 'Manage your income and expenses',
      newTransaction: 'New Transaction',
      search: 'Search',
      searchTransactions: 'Search transactions...',
      type: 'Type',
      all: 'All',
      income: 'Income',
      expense: 'Expenses',
      category: 'Category',
      allCategories: 'All',
      clearFilters: 'Clear Filters',
      noTransactions: 'No transactions found',
      editTransaction: 'Edit Transaction',
      newTransactionForm: 'New Transaction',
      description: 'Description',
      amount: 'Amount',
      typeLabel: 'Type',
      categoryLabel: 'Category',
      selectCategory: 'Select category',
      date: 'Date',
      notes: 'Notes (optional)',
      optional: '(optional)',
      additionalInfo: 'Additional information (optional)',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      confirmDelete: 'Are you sure you want to delete this transaction?',
      deletePermanently: 'This action will permanently delete the transaction',
      continue: 'Continue',
      delete: 'Delete',
      loadingTransactions: 'Loading transactions...',
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      selectLanguage: 'Select language',
      spanish: 'Spanish',
      english: 'English',
      backup: 'Save information (Backup)',
      restore: 'Load information (Restore data)',
      backupSuccess: 'Backup created successfully',
      restoreSuccess: 'Data restored successfully',
      restoreWarning: 'This action will overwrite all your current data. DO YOU WANT TO CONTINUE?',
      dataManagement: 'Data Management',
    },
    common: {
      error: 'Error',
      errorSaving: 'Error saving',
      errorDeleting: 'Error deleting',
      errorLoading: 'Error loading',
      pleaseEnter: 'Please enter',
      validAmount: 'a valid amount',
      greaterThanZero: 'greater than zero',
      pleaseSelect: 'Please select',
      category: 'a category',
      cancel: 'Cancel',
      save: 'Save',
      update: 'Update',
      delete: 'Delete',
      edit: 'Edit',
      new: 'New',
      all: 'All',
      example: 'E.g.:',
      numbersOnly: '0.00 (numbers only)',
      quickExpense: 'Quick expense',
      quickIncome: 'Quick income',
      confirmDelete: 'Confirm Delete',
      deletePermanently: 'Are you sure you want to permanently delete this item?',
      electronics: 'Electronics',
      clothing: 'Clothing',
      food: 'Food',
      transportation: 'Transportation',
      entertainment: 'Entertainment',
      shopping: 'Shopping',
      other: 'Other',
      vacations: 'Vacations',
      emergencies: 'Emergencies',
      housing: 'Housing',
      education: 'Education',
    },
  },
};

export const getTranslations = (language: Language): Translations => {
  return translations[language];
};

export const getDefaultLanguage = (): Language => {
  const saved = localStorage.getItem('finbook-language');
  if (saved === 'en' || saved === 'es') {
    return saved;
  }
  return 'es'; // Default to Spanish
};

export const saveLanguage = (language: Language): void => {
  localStorage.setItem('finbook-language', language);
};

