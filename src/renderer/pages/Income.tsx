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
import { es, enUS } from 'date-fns/locale';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../contexts/LanguageContext';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes?: string;
  isFixedExpense?: boolean;
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
  const { t, language } = useLanguage();
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
    notes: '',
    isFixedExpense: false
  });

  const [goalFormData, setGoalFormData] = useState({
    targetAmount: '',
    notes: ''
  });

  // Función para formatear números mientras se escribe
  const formatNumberInput = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[0]) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return parts.join('.');
  };

  const cleanNumberValue = (value: string) => {
    return value.replace(/[^\d.]/g, '');
  };

  const parseDateParts = (dateStr: string) => {
    const [yearStr, monthStr] = dateStr.split('-');
    return {
      year: parseInt(yearStr, 10),
      month: parseInt(monthStr, 10) - 1
    };
  };

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
      const incomeCategories = categoriesData.filter(c => (c.type || '').toLowerCase() === 'income');
      const uniqueIncomeCategories = removeDuplicateCategories(incomeCategories);
      
      setTransactions(incomeTransactions);
      setCategories(uniqueIncomeCategories);

      const currentMonth = format(new Date(), 'MMMM', { locale: language === 'es' ? es : enUS });
      const currentYear = new Date().getFullYear();
      const goal = await window.electronAPI.getMonthlyGoal(currentMonth, currentYear, 'income');
      
      if (goal) {
        const now = new Date();
        const currentMonthNum = now.getMonth();
        const currentYearNum = now.getFullYear();
        const currentMonthStr = format(now, 'yyyy-MM');
        
        const applicableTransactions = incomeTransactions.filter(t => {
          const { year, month } = parseDateParts(t.date);
          const tMonthStr = t.date.substring(0, 7);
          if (!t.isFixedExpense && year === currentYearNum && month === currentMonthNum) return true;
          if (t.isFixedExpense && currentMonthStr >= tMonthStr) return true;
          return false;
        });
        
        const calculatedCurrentAmount = applicableTransactions.reduce((sum, t) => sum + t.amount, 0);
        
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
      alert(`${t.common.pleaseEnter} ${t.common.validAmount} ${t.common.greaterThanZero}.`);
      return;
    }
    if (!formData.description.trim()) {
      alert(`${t.common.pleaseEnter} una descripción.`);
      return;
    }
    if (!formData.category) {
      alert(`${t.common.pleaseSelect} ${t.common.category}.`);
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
      alert(`${t.common.errorSaving} el ingreso. ${t.common.pleaseEnter} intenta de nuevo.`);
    }
  };

  const handleQuickIncome = async (amount: number, description: string) => {
    if (isNaN(amount) || amount <= 0) {
      alert(`${t.common.pleaseEnter} ${t.common.validAmount} ${t.common.greaterThanZero}.`);
      return;
    }
    const transactionData = {
      description,
      amount,
      type: 'income' as const,
      category: t.common.quickIncome,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: 'Ingreso agregado desde acciones rápidas'
    };
    try {
      await window.electronAPI.addTransaction(transactionData);
      await loadData();
      setQuickIncomeAmount('');
    } catch (error) {
      console.error('Error saving quick income:', error);
      alert(`${t.common.errorSaving} el ingreso rápido. ${t.common.pleaseEnter} intenta de nuevo.`);
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
      alert(`${t.common.pleaseEnter} un monto objetivo válido ${t.common.greaterThanZero}.`);
      return;
    }
    try {
      const now = new Date();
      const currentMonthNum = now.getMonth();
      const currentYearNum = now.getFullYear();
      const currentMonthStr = format(now, 'yyyy-MM');
      
      const calculatedCurrentAmount = transactions.filter(t => {
        const { year, month } = parseDateParts(t.date);
        const tMonthStr = t.date.substring(0, 7);
        return (month === currentMonthNum && year === currentYearNum && !t.isFixedExpense) || (t.isFixedExpense && currentMonthStr >= tMonthStr);
      }).reduce((sum, t) => sum + t.amount, 0);
      
      const goalData = {
        targetAmount,
        notes: goalFormData.notes,
        month: format(new Date(), 'MMMM', { locale: language === 'es' ? es : enUS }),
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
      alert(`${t.common.errorSaving} la meta mensual. ${t.common.pleaseEnter} intenta de nuevo.`);
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
      notes: transaction.notes || '',
      isFixedExpense: transaction.isFixedExpense || false
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
      notes: '',
      isFixedExpense: false
    });
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const now = new Date();
      const currentMonthNum = now.getMonth();
      const currentYearNum = now.getFullYear();
      const currentMonthStr = format(now, 'yyyy-MM');
      const { year, month } = parseDateParts(transaction.date);
      const tMonthStr = transaction.date.substring(0, 7);

      const isCurrentMonthSimple = !transaction.isFixedExpense && year === currentYearNum && month === currentMonthNum;
      const isActiveFixed = transaction.isFixedExpense && currentMonthStr >= tMonthStr;

      if (!isCurrentMonthSimple && !isActiveFixed) return false;

      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const _now = new Date();
  const _currentMonthStr = format(_now, 'yyyy-MM');
  const monthlyIncome = transactions
    .filter(t => { 
      const { year, month } = parseDateParts(t.date); 
      const tMonthStr = t.date.substring(0, 7);
      return (month === _now.getMonth() && year === _now.getFullYear() && !t.isFixedExpense) || (t.isFixedExpense && _currentMonthStr >= tMonthStr);
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const averageIncome = transactions.length > 0 ? totalIncome / transactions.length : 0;
  const goalProgress = monthlyGoal ? (monthlyGoal.currentAmount / monthlyGoal.targetAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.income.loadingData}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-6 px-6 space-y-6 max-w-[90rem] mx-auto relative z-10">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.income.title}</h1>
        <p className="text-sm text-gray-600">{t.income.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">{t.income.totalAccumulated}</p>
                <p className="text-xs text-gray-500">{t.income.fullHistory}</p>
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
                <p className="text-base font-medium text-gray-600">{t.income.currentMonth}</p>
                <p className="text-xs text-gray-500">{t.income.periodIncome}</p>
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
                <p className="text-base font-medium text-gray-600">{t.income.average}</p>
                <p className="text-xs text-gray-500">{t.income.perIncome}</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageIncome)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-3xl px-5 pt-8 pb-5 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 mb-6">{t.income.quickActions}</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowForm(true)}
                className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900">{t.income.newIncome}</p>
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
                  <p className="text-xs font-medium text-gray-900">{t.income.monthlyGoal}</p>
                  {monthlyGoal && (
                    <p className="text-xs text-gray-500">
                      {formatCurrency(monthlyGoal.currentAmount)} / {formatCurrency(monthlyGoal.targetAmount)}
                    </p>
                  )}
                </div>
              </button>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl border border-gray-200">
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={t.income.quickIncomeAmount}
                      value={quickIncomeAmount}
                      onChange={(e) => setQuickIncomeAmount(formatNumberInput(e.target.value))}
                      className="w-full text-xs bg-white border-none outline-none placeholder-gray-500"
                    />
                  </div>
                </div>
                {quickIncomeAmount && (
                  <button 
                    onClick={() => handleQuickIncome(parseFloat(cleanNumberValue(quickIncomeAmount)), t.common.quickIncome)}
                    className="w-full px-3 py-2 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    {t.income.add} {formatCurrency(parseFloat(cleanNumberValue(quickIncomeAmount)))}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">{t.income.monthlyIncomeGoal}</h3>
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
                    <p className="text-xs text-gray-500">{t.income.accumulatedMonth}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-700">{formatCurrency(monthlyGoal.targetAmount)}</p>
                    <p className="text-xs text-gray-500">{t.income.goalMonthly}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{t.income.progress}</span>
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
                  <span className="text-gray-500">{t.income.remaining}</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(Math.max(0, monthlyGoal.targetAmount - monthlyGoal.currentAmount))}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookHeart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm mb-1">{t.income.defineObjective}</p>
                <p className="text-xs text-gray-400">{t.income.maintainControl}</p>
                <button 
                  onClick={handleMonthlyGoal}
                  className="mt-3 px-4 py-2 bg-gray-900 text-white text-xs rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {t.income.setGoal}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.income.searchIncome}
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
                <option value="all">{t.income.viewAll}</option>
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
                title="Limpiar filtros"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      </div>
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
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: language === 'es' ? es : enUS })}
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
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                <p className="text-gray-500 mb-2">{t.income.startRegistering}</p>
                <p className="text-xs text-gray-400">{t.income.useNewIncome}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGoalModal && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t.income.incomeGoal}</h2>
              <button onClick={handleCloseGoalModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {monthlyGoal && (
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso actual</span>
                  <span className="text-sm text-gray-500">{formatCurrency(monthlyGoal.currentAmount)} / {formatCurrency(monthlyGoal.targetAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-900 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{goalProgress.toFixed(1)}% completado</p>
              </div>
            )}
            
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.income.incomeGoal}
                  <span className="text-xs text-gray-500 ml-1">{t.income.objectiveToReach}</span>
                </label>
                <input
                  type="text"
                  required
                  value={goalFormData.targetAmount}
                  onChange={(e) => setGoalFormData({...goalFormData, targetAmount: formatNumberInput(e.target.value)})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder={t.common.numbersOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea
                  value={goalFormData.notes}
                  onChange={(e) => setGoalFormData({...goalFormData, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={3}
                  placeholder={t.income.additionalInfo}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={handleCloseGoalModal} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">{t.income.cancel}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors">{t.income.save} {t.income.monthlyGoal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingTransaction ? t.income.editIncome : t.income.newIncomeForm}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.income.description}<span className="text-xs text-gray-500 ml-1">{t.income.origin}</span></label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder={`${t.common.example} ${language === 'es' ? 'Salario mensual, trabajo freelance, venta de producto...' : 'Monthly salary, freelance work, product sale...'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.income.amount}<span className="text-xs text-gray-500 ml-1">{t.income.amountReceived}</span></label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: formatNumberInput(e.target.value)})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder={t.common.numbersOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.income.category}</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">{t.income.selectCategory}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.income.date}</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="isFixedExpense"
                  checked={formData.isFixedExpense}
                  onChange={(e) => setFormData({...formData, isFixedExpense: e.target.checked})}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                />
                <label htmlFor="isFixedExpense" className="text-sm font-medium text-gray-700">
                  {t.creditCards?.fixedExpense || 'Ingreso Fijo (Se repite cada mes)'}
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={3}
                  placeholder={t.income.additionalInfo}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={handleCloseForm} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">{t.income.cancel}</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors">{editingTransaction ? (t.common.save || 'Guardar') : (t.common.add || 'Agregar')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-gray-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t.income.confirmDelete}</h2>
            <p className="text-gray-600 mb-8">{t.income.confirmDeleteMsg || '¿Estás seguro de que deseas eliminar este ingreso?'}</p>
            <div className="flex space-x-3">
              <button onClick={cancelDelete} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-200">{t.income.cancel}</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-3 bg-gray-900 text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-200">{t.income.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;