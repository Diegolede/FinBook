import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  TrendingUp,
  Calendar,
  BookHeart,
  X
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

const Income: React.FC = () => {
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
  const [quickIncomeAmount, setQuickIncomeAmount] = useState('');
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
      const [transactionsData, categoriesData] = await Promise.all([
        window.electronAPI.getTransactions(),
        window.electronAPI.getCategories()
      ]);
      
      const incomeTransactions = transactionsData.filter(t => t.type === 'income');
      const incomeCategories = categoriesData.filter(c => c.type === 'income');
      
      const uniqueIncomeCategories = removeDuplicateCategories(incomeCategories);
      
      setTransactions(incomeTransactions);
      setCategories(uniqueIncomeCategories);

      const currentMonth = format(new Date(), 'MMMM', { locale: es });
      const currentYear = new Date().getFullYear();
      const goal = await window.electronAPI.getMonthlyGoal(currentMonth, currentYear, 'income');
      
      // Calcular currentAmount basándose en las transacciones del mes actual
      if (goal) {
        const now = new Date();
        const currentMonthNum = now.getMonth();
        const currentYearNum = now.getFullYear();
        
        // Filtrar transacciones del mes actual
        const currentMonthTransactions = incomeTransactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonthNum && 
                 transactionDate.getFullYear() === currentYearNum;
        });
        
        // Calcular el total de ingresos del mes
        const calculatedCurrentAmount = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
        
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
      type: 'income' as const
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
      alert('Error al guardar el ingreso. Por favor, intenta de nuevo.');
    }
  };

  const handleQuickIncome = async (amount: number, description: string) => {
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor, ingresa un monto válido mayor a cero.');
      return;
    }
    
    const transactionData = {
      description,
      amount,
      type: 'income' as const,
      category: 'Ingreso rápido',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: 'Ingreso agregado desde acciones rápidas'
    };

    try {
      await window.electronAPI.addTransaction(transactionData);
      await loadData();
      setQuickIncomeAmount('');
    } catch (error) {
      console.error('Error saving quick income:', error);
      alert('Error al guardar el ingreso rápido. Por favor, intenta de nuevo.');
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
      
      const calculatedCurrentAmount = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      const goalData = {
        targetAmount,
        notes: goalFormData.notes,
        month: format(new Date(), 'MMMM', { locale: es }),
        year: new Date().getFullYear(),
        type: 'income' as const,
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

  const totalIncome = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyIncome = transactions
    .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const averageIncome = transactions.length > 0 ? totalIncome / transactions.length : 0;

  const goalProgress = monthlyGoal ? (monthlyGoal.currentAmount / monthlyGoal.targetAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ingresos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-6 px-6 space-y-6 max-w-[90rem] mx-auto relative z-10">
      {/* Título de la sección */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ingresos</h1>
        <p className="text-sm text-gray-600">Aquí puedes gestionar tus ingresos</p>
      </div>

      {/* Header con estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Ingresos totales</p>
                <p className="text-xs text-gray-500">Todos los tiempos</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Este mes</p>
                <p className="text-xs text-gray-500">Ingresos actuales</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyIncome)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Promedio</p>
                <p className="text-xs text-gray-500">Por transacción</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageIncome)}</p>
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
                  <p className="text-xs font-medium text-gray-900">Nuevo ingreso</p>
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
              
              {/* Ingreso rápido con input */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl border border-gray-200">
                                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                    </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Ingreso rápido"
                      value={quickIncomeAmount}
                      onChange={(e) => setQuickIncomeAmount(formatNumberInput(e.target.value))}
                      className="w-full text-xs bg-white border-none outline-none placeholder-gray-500"
                    />
                  </div>
                </div>
                {quickIncomeAmount && (
                  <button 
                    onClick={() => handleQuickIncome(parseFloat(cleanNumberValue(quickIncomeAmount)), 'Ingreso rápido')}
                    className="w-full px-3 py-2 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    Agregar {formatCurrency(parseFloat(cleanNumberValue(quickIncomeAmount)))}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Meta Mensual */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Meta mensual de ingresos</h3>
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
                    <p className="text-xs text-gray-500">Ingresos actuales</p>
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
                  <span className="text-gray-500">Faltan</span>
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
                  className="mt-3 px-4 py-2 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Establecer meta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fila 3: Historial de Ingresos */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ingresos..."
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
                <option value="all">Todas las categorías</option>
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

          {/* Lista de Ingresos */}
          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                      {transaction.notes && (
                        <p className="text-xs text-gray-400 mt-1">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-700">
                        +{formatCurrency(transaction.amount)}
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
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay ingresos registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Meta Mensual */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                Meta mensual de ingresos
              </h2>
              <button
                onClick={handleCloseGoalModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {monthlyGoal && (
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
            )}
            
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta de ingresos mensual
                </label>
                <input
                  type="text"
                  required
                    value={goalFormData.targetAmount}
                    onChange={(e) => setGoalFormData({...goalFormData, targetAmount: formatNumberInput(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="0.00"
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
        <div className="fixed inset-0 bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTransaction ? 'Editar ingreso' : 'Nuevo ingreso'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Descripción del ingreso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: formatNumberInput(e.target.value)})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="0.00"
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
                  placeholder="Notas adicionales..."
                />
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
        <div className="fixed inset-0 bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-50">
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
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{transactionToDelete?.description}</h3>
                  <p className="text-sm text-gray-500">{transactionToDelete?.category}</p>
                  <p className="text-xs text-gray-400">
                    {transactionToDelete && format(new Date(transactionToDelete.date), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">
                    +{transactionToDelete && formatCurrency(transactionToDelete.amount)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres eliminar este ingreso? Esta acción no se puede deshacer.
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

export default Income;