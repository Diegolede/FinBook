import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  TrendingDown,
  Calendar,
  BookHeart,
  X,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils/currency';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
  creditCardId?: string;
  totalInstallments?: number;
}

interface CreditCard {
  id: string;
  name: string;
  bank: string;
  limit: number;
  currentBalance: number;
  dueDate: string;
  lastFourDigits: string;
  color: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

interface MonthlyGoal {
  id: string;
  targetAmount: number;
  currentAmount: number;
  month: string;
  year: number;
  type: 'expense' | 'income';
  notes?: string;
}

const Expenses: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [quickExpenseAmount, setQuickExpenseAmount] = useState('');
  const [monthlyGoal, setMonthlyGoal] = useState<MonthlyGoal | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const [goalFormData, setGoalFormData] = useState({
    targetAmount: '',
    notes: ''
  });

  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  // Categorías de gasto por defecto como respaldo en UI
  const defaultExpenseCategories: Category[] = [
    { id: 'default-exp-comida', name: 'Comida', type: 'expense', color: '#F97316' },
    { id: 'default-exp-alimentacion', name: 'Alimentación', type: 'expense', color: '#EF4444' },
    { id: 'default-exp-supermercado', name: 'Supermercado', type: 'expense', color: '#22C55E' },
    { id: 'default-exp-restaurantes', name: 'Restaurantes', type: 'expense', color: '#E11D48' },
    { id: 'default-exp-transporte', name: 'Transporte', type: 'expense', color: '#F59E0B' },
    { id: 'default-exp-vivienda', name: 'Vivienda', type: 'expense', color: '#8B5CF6' },
    { id: 'default-exp-servicios', name: 'Servicios', type: 'expense', color: '#0EA5E9' },
    { id: 'default-exp-salud', name: 'Salud', type: 'expense', color: '#10B981' },
    { id: 'default-exp-educacion', name: 'Educación', type: 'expense', color: '#3B82F6' },
    { id: 'default-exp-hogar', name: 'Hogar', type: 'expense', color: '#7C3AED' },
    { id: 'default-exp-mascotas', name: 'Mascotas', type: 'expense', color: '#F59E0B' },
    { id: 'default-exp-impuestos', name: 'Impuestos', type: 'expense', color: '#6B7280' },
    { id: 'default-exp-seguro', name: 'Seguro', type: 'expense', color: '#0284C7' },
    { id: 'default-exp-deudas', name: 'Deudas', type: 'expense', color: '#DC2626' },
    { id: 'default-exp-regalos', name: 'Regalos', type: 'expense', color: '#F43F5E' },
    { id: 'default-exp-viajes', name: 'Viajes', type: 'expense', color: '#0EA5E9' },
    { id: 'default-exp-compras', name: 'Compras', type: 'expense', color: '#8B5CF6' },
    { id: 'default-exp-otros', name: 'Otros Gastos', type: 'expense', color: '#6B7280' },
  ];

  // Función para formatear números mientras se escribe
  const formatNumberInput = (value: string) => {
    // Remover todos los caracteres no numéricos excepto el punto decimal
    const cleanValue = value.replace(/[^\d.]/g, '');
    
    // Asegurar que solo haya un punto decimal
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Formatear la parte entera con separadores de miles
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return parts.join('.');
  };

  // Función para limpiar el formato y obtener solo números
  const cleanNumberValue = (value: string) => {
    return value.replace(/[^\d.]/g, '');
  };

  // Función para eliminar categorías duplicadas
  const removeDuplicateCategories = (categories: Category[]) => {
    const uniqueCategories = categories.filter((category, index, self) => 
      index === self.findIndex(c => c.name.toLowerCase() === category.name.toLowerCase())
    );
    return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData, creditCardsData] = await Promise.all([
        window.electronAPI.getTransactions(),
        window.electronAPI.getCategories(),
        window.electronAPI.getCreditCards()
      ]);
      
      const expenseTransactions = transactionsData.filter(t => t.type === 'expense');
      const expenseCategories = categoriesData.filter(c => (c.type || '').toLowerCase() === 'expense');
      
      const uniqueExpenseCategories = removeDuplicateCategories(expenseCategories);
      
      setTransactions(expenseTransactions);
      setCategories(uniqueExpenseCategories.length > 0 ? uniqueExpenseCategories : defaultExpenseCategories);
      setCreditCards(creditCardsData);

      const currentMonth = format(new Date(), 'MMMM', { locale: es });
      const currentYear = new Date().getFullYear();
      const goal = await window.electronAPI.getMonthlyGoal(currentMonth, currentYear, 'expense');
      
      // Calcular currentAmount basándose en las transacciones del mes actual
      if (goal) {
        const now = new Date();
        const currentMonthNum = now.getMonth();
        const currentYearNum = now.getFullYear();
        
        // Filtrar transacciones del mes actual
        const currentMonthTransactions = expenseTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonthNum && 
                 transactionDate.getFullYear() === currentYearNum;
        });
        
        // Calcular el total: para gastos en cuotas, solo contar una cuota por mes
        const calculatedCurrentAmount = currentMonthTransactions.reduce((sum, t) => {
          // Si es un gasto en cuotas (totalInstallments > 1), solo contar una cuota
          if (t.totalInstallments && t.totalInstallments > 1) {
            return sum + (t.amount / t.totalInstallments);
          }
          // Para gastos simples, contar el monto completo
          return sum + t.amount;
        }, 0);
        
        // Actualizar la meta con el currentAmount calculado
        if (goal.currentAmount !== calculatedCurrentAmount) {
          const updatedGoal = {
            ...goal,
            currentAmount: calculatedCurrentAmount
          };
          await window.electronAPI.saveMonthlyGoal(updatedGoal);
          setMonthlyGoal(updatedGoal);
        } else {
          setMonthlyGoal(goal);
        }
      } else {
        setMonthlyGoal(goal);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(cleanNumberValue(formData.amount));
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, ingresa un monto válido mayor a cero.');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Por favor, ingresa una descripción.');
      return;
    }
    
    if (!formData.category) {
      alert('Por favor, selecciona una categoría.');
      return;
    }
    
    const transactionData = {
      ...formData,
      amount,
      type: 'expense' as const
    };

    try {
      if (editingTransaction) {
        await window.electronAPI.updateTransaction({
          ...transactionData,
          id: editingTransaction.id
        });
      } else {
        await window.electronAPI.addTransaction(transactionData);
      }
      
      await loadData();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error al guardar el gasto. Por favor, intenta de nuevo.');
    }
  };

  const handleQuickExpense = async (amount: number, description: string) => {
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, ingresa un monto válido mayor a cero.');
      return;
    }
    
    const transactionData = {
      description,
      amount,
      type: 'expense' as const,
      category: 'Gasto rápido',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: 'Gasto agregado desde acciones rápidas'
    };

    try {
      await window.electronAPI.addTransaction(transactionData);
      await loadData();
      setQuickExpenseAmount('');
    } catch (error) {
      console.error('Error saving quick expense:', error);
      alert('Error al guardar el gasto rápido. Por favor, intenta de nuevo.');
    }
  };

  const handleMonthlyGoal = () => {
    if (monthlyGoal) {
      setGoalFormData({
        targetAmount: monthlyGoal.targetAmount.toString(),
        notes: monthlyGoal.notes || ''
      });
    }
    setShowGoalModal(true);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const targetAmount = parseFloat(cleanNumberValue(goalFormData.targetAmount));
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('Por favor, ingresa un monto objetivo válido mayor a cero.');
      return;
    }
    
    try {
      const now = new Date();
      const currentMonthNum = now.getMonth();
      const currentYearNum = now.getFullYear();
      
      // Calcular currentAmount basándose en las transacciones del mes actual
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonthNum && 
               transactionDate.getFullYear() === currentYearNum;
      });
      
      const calculatedCurrentAmount = currentMonthTransactions.reduce((sum, t) => {
        // Si es un gasto en cuotas (totalInstallments > 1), solo contar una cuota
        if (t.totalInstallments && t.totalInstallments > 1) {
          return sum + (t.amount / t.totalInstallments);
        }
        // Para gastos simples, contar el monto completo
        return sum + t.amount;
      }, 0);
      
      const goalData = {
        targetAmount,
        notes: goalFormData.notes,
        month: format(new Date(), 'MMMM', { locale: es }),
        year: new Date().getFullYear(),
        type: 'expense' as const,
        currentAmount: calculatedCurrentAmount
      };

      await window.electronAPI.saveMonthlyGoal(goalData);
      loadData();
      setShowGoalModal(false);
      setGoalFormData({ targetAmount: '', notes: '' });
    } catch (error) {
      console.error('Error saving monthly goal:', error);
      alert('Error al guardar la meta mensual. Por favor, intenta de nuevo.');
    }
  };

  const handleCloseGoalModal = () => {
    setShowGoalModal(false);
    setGoalFormData({ targetAmount: '', notes: '' });
  };

  const handleDelete = async (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        await window.electronAPI.deleteTransaction(transactionToDelete.id);
        await loadData();
        setShowDeleteModal(false);
        setTransactionToDelete(null);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      date: transaction.date,
      notes: transaction.notes || ''
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setFormData({
      description: '',
      amount: '',
      category: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    });
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyExpenses = transactions
    .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const averageExpense = transactions.length > 0 ? totalExpenses / transactions.length : 0;

  const goalProgress = monthlyGoal ? (monthlyGoal.currentAmount / monthlyGoal.targetAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-6 px-6 space-y-6 max-w-[90rem] mx-auto relative z-10">
      {/* Título de la sección */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gastos</h1>
        <p className="text-sm text-gray-600">Registra cada gasto, establece límites mensuales y mantén un control detallado de tus finanzas</p>
      </div>

      {/* Header con estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Total acumulado</p>
                <p className="text-xs text-gray-500">Historial completo</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Mes actual</p>
                <p className="text-xs text-gray-500">Gastos del período</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyExpenses)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Minus className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Promedio</p>
                <p className="text-xs text-gray-500">Por gasto</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageExpense)}</p>
        </div>
      </div>

      {/* Bento Grid Principal */}
      <div className="space-y-4">
        {/* Fila 2: Acciones Rápidas + Meta Mensual */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowForm(true)}
                className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900">Nuevo gasto</p>
                </div>
              </button>
              <button 
                onClick={handleMonthlyGoal}
                className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <BookHeart className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900">Meta mensual</p>
                  {monthlyGoal && (
                    <p className="text-xs text-gray-500">
                      {formatCurrency(monthlyGoal.currentAmount)} / {formatCurrency(monthlyGoal.targetAmount)}
                    </p>
                  )}
                </div>
              </button>
              
              {/* Gasto rápido con input */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl border border-gray-200">
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Minus className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Monto del gasto rápido"
                      value={quickExpenseAmount}
                      onChange={(e) => setQuickExpenseAmount(formatNumberInput(e.target.value))}
                      className="w-full text-xs bg-white border-none outline-none placeholder-gray-500"
                    />
                  </div>
                </div>
                {quickExpenseAmount && (
                  <button 
                    onClick={() => handleQuickExpense(parseFloat(cleanNumberValue(quickExpenseAmount)), 'Gasto rápido')}
                    className="w-full px-3 py-2 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Agregar {formatCurrency(parseFloat(cleanNumberValue(quickExpenseAmount)))}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Meta Mensual */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Meta mensual de gastos</h3>
              <button 
                onClick={handleMonthlyGoal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            {monthlyGoal ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyGoal.currentAmount)}</p>
                    <p className="text-xs text-gray-500">Acumulado del mes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-700">{formatCurrency(monthlyGoal.targetAmount)}</p>
                    <p className="text-xs text-gray-500">Meta mensual</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Progreso</span>
                    <span className="text-gray-500">{goalProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gray-900 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(goalProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Restante</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(Math.max(0, monthlyGoal.targetAmount - monthlyGoal.currentAmount))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookHeart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No hay meta mensual establecida</p>
                <button 
                  onClick={handleMonthlyGoal}
                  className="mt-3 px-4 py-2 bg-[#0f0f0f] text-white text-xs rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Establecer meta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fila 3: Historial de Gastos */}
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="all">Ver todas</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Gastos */}
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                      {transaction.notes && (
                        <p className="text-xs text-gray-400 mt-1">{transaction.notes}</p>
                      )}
                      {/* Información de tarjeta de crédito */}
                      {transaction.creditCardId && (() => {
                        const card = creditCards.find(c => c.id === transaction.creditCardId);
                        if (!card) return null;
                        const cardDisplay = card.bank ? `${card.name} ${card.bank}` : card.name;
                        return (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {cardDisplay}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-700">
                        -{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Comienza registrando tu primer gasto</p>
                <p className="text-xs text-gray-400">Usa el botón "Nuevo gasto" o el gasto rápido para empezar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Meta Mensual */}
      {showGoalModal && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                Meta mensual de gastos
              </h2>
              <button
                onClick={handleCloseGoalModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {monthlyGoal ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso actual</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(monthlyGoal.currentAmount)} / {formatCurrency(monthlyGoal.targetAmount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(goalProgress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {goalProgress.toFixed(1)}% completado
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookHeart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No hay meta mensual establecida</p>
                <button 
                  onClick={handleMonthlyGoal}
                  className="mt-3 px-4 py-2 bg-[#0f0f0f] text-white text-xs rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Establecer meta
                </button>
              </div>
            )}
            
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta de gastos mensual
                  <span className="text-xs text-gray-500 ml-1">(límite máximo)</span>
                </label>
                <input
                  type="text"
                  required
                    value={goalFormData.targetAmount}
                    onChange={(e) => setGoalFormData({...goalFormData, targetAmount: formatNumberInput(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="0.00 (solo números)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                    value={goalFormData.notes}
                    onChange={(e) => setGoalFormData({...goalFormData, notes: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={3}
                  placeholder="Notas sobre tu meta mensual..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseGoalModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTransaction ? 'Editar gasto' : 'Nuevo gasto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                  <span className="text-xs text-gray-500 ml-1">(en qué gastaste)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Ej: Compra en supermercado, cena en restaurante, viaje en taxi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                  <span className="text-xs text-gray-500 ml-1">(cantidad gastada)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: formatNumberInput(e.target.value)})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="0.00 (solo números)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={3}
                  placeholder="Información adicional (opcional)"
                />
              </div>

              {/* Tarjeta de Crédito */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {/* <input
                    type="checkbox"
                    id="isCreditCard"
                    checked={formData.isCreditCard}
                    onChange={(e) => setFormData({...formData, isCreditCard: e.target.checked})}
                    className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                  />
                  <label htmlFor="isCreditCard" className="text-sm font-medium text-gray-700">
                    Pagado con tarjeta de crédito
                  </label> */}
                </div>

                {/* {formData.isCreditCard && (
                  <div className="space-y-4 pl-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarjeta de Crédito
                      </label>
                      <select
                        value={formData.creditCardId}
                        onChange={(e) => setFormData({...formData, creditCardId: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar tarjeta</option>
                        {creditCards.map(card => (
                          <option key={card.id} value={card.id}>
                            {card.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total de Cuotas
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.totalInstallments}
                          onChange={(e) => setFormData({...formData, totalInstallments: parseInt(e.target.value) || 1})}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {formData.totalInstallments > 1 && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Monto por cuota:</span> {formatCurrency(parseFloat(cleanNumberValue(formData.amount)) / formData.totalInstallments)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Total de cuotas:</span> {formData.totalInstallments}
                        </p>
                      </div>
                    )}
                  </div>
                )} */}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {editingTransaction ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {showDeleteModal && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar eliminación
              </h2>
              <button
                onClick={cancelDelete}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{transactionToDelete?.description}</h3>
                  <p className="text-sm text-gray-500">{transactionToDelete?.category}</p>
                  <p className="text-xs text-gray-400">
                    {transactionToDelete && format(new Date(transactionToDelete.date), 'dd/MM/yyyy', { locale: es })}
                  </p>
                  {/* Información de tarjeta de crédito en modal */}
                  {transactionToDelete?.creditCardId && (() => {
                    const card = creditCards.find(c => c.id === transactionToDelete.creditCardId);
                    if (!card) return null;
                    const cardDisplay = card.bank ? `${card.name} ${card.bank}` : card.name;
                    return (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {cardDisplay}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">
                    -{transactionToDelete && formatCurrency(transactionToDelete.amount)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Esta acción eliminará permanentemente el gasto. ¿Deseas continuar?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;