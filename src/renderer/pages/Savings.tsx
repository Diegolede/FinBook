import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2,
  PiggyBank,
  BookHeart,
  X,
  BarChart3,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils/currency';

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  notes?: string;
}

interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  type: 'checking' | 'savings' | 'investment';
}

const Savings: React.FC = () => {
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustContext, setAdjustContext] = useState<
    | { type: 'goal'; item: SavingsGoal; isDeposit: boolean }
    | { type: 'account'; item: SavingsAccount; isDeposit: boolean }
    | null
  >(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const [goalFormData, setGoalFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    category: '',
    notes: ''
  });

  const [accountFormData, setAccountFormData] = useState({
    name: '',
    balance: '',
    interestRate: '',
    type: 'savings' as 'checking' | 'savings' | 'investment'
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

  // Función para limpiar el formato y obtener solo números
  const cleanNumberValue = (value: string) => {
    return value.replace(/[^\d.]/g, '');
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const goals = await window.electronAPI.getSavingsGoals();
      const accounts = await window.electronAPI.getSavingsAccounts();
      setSavingsGoals(goals);
      setSavingsAccounts(accounts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustForGoal = (goal: SavingsGoal, isDeposit: boolean) => {
    setAdjustContext({ type: 'goal', item: goal, isDeposit });
    setAdjustAmount('');
    setShowAdjustModal(true);
  };

  const openAdjustForAccount = (account: SavingsAccount, isDeposit: boolean) => {
    setAdjustContext({ type: 'account', item: account, isDeposit });
    setAdjustAmount('');
    setShowAdjustModal(true);
  };

  const closeAdjustModal = () => {
    setShowAdjustModal(false);
    setAdjustContext(null);
    setAdjustAmount('');
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustContext) return;

    const numericAmount = parseFloat(cleanNumberValue(adjustAmount)) || 0;
    if (numericAmount <= 0) {
      closeAdjustModal();
      return;
    }

    try {
      if (adjustContext.type === 'goal') {
        const goal = adjustContext.item;
        const newCurrent = adjustContext.isDeposit
          ? goal.currentAmount + numericAmount
          : Math.max(0, goal.currentAmount - numericAmount);
        await window.electronAPI.updateSavingsGoal({ ...goal, currentAmount: newCurrent });
      } else {
        const account = adjustContext.item;
        const newBalance = adjustContext.isDeposit
          ? account.balance + numericAmount
          : Math.max(0, account.balance - numericAmount);
        await window.electronAPI.updateSavingsAccount({ ...account, balance: newBalance });
      }

      await loadData();
    } catch (error) {
      console.error('Error adjusting amount:', error);
    } finally {
      closeAdjustModal();
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalFormData.name.trim()) {
      alert('Por favor, ingresa un nombre para la meta.');
      return;
    }
    
    if (!goalFormData.category) {
      alert('Por favor, selecciona una categoría.');
      return;
    }
    
    const targetAmount = parseFloat(cleanNumberValue(goalFormData.targetAmount));
    const currentAmount = parseFloat(cleanNumberValue(goalFormData.currentAmount));
    
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('Por favor, ingresa un monto objetivo válido mayor a cero.');
      return;
    }
    
    if (isNaN(currentAmount) || currentAmount < 0) {
      alert('Por favor, ingresa un monto actual válido (mayor o igual a cero).');
      return;
    }
    
    const goalData = {
      ...goalFormData,
      targetAmount,
      currentAmount
    };

    try {
      if (editingGoal) {
        const updatedGoal = {
          ...editingGoal,
          ...goalData
        };
        await window.electronAPI.updateSavingsGoal(updatedGoal);
      } else {
        await window.electronAPI.addSavingsGoal(goalData);
      }
      
      loadData();
      handleCloseGoalForm();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Error al guardar la meta. Por favor, intenta de nuevo.');
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountFormData.name.trim()) {
      alert('Por favor, ingresa un nombre para la cuenta.');
      return;
    }
    
    const balance = parseFloat(cleanNumberValue(accountFormData.balance));
    const interestRate = parseFloat(cleanNumberValue(accountFormData.interestRate));
    
    if (isNaN(balance)) {
      alert('Por favor, ingresa un saldo válido.');
      return;
    }
    
    if (isNaN(interestRate) || interestRate < 0) {
      alert('Por favor, ingresa una tasa de interés válida (mayor o igual a cero).');
      return;
    }
    
    const accountData = {
      ...accountFormData,
      balance,
      interestRate
    };

    try {
      if (editingAccount) {
        const updatedAccount = {
          ...editingAccount,
          ...accountData
        };
        await window.electronAPI.updateSavingsAccount(updatedAccount);
      } else {
        await window.electronAPI.addSavingsAccount(accountData);
      }
      
      loadData();
      handleCloseAccountForm();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Error al guardar la cuenta. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await window.electronAPI.deleteSavingsGoal(id);
      loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await window.electronAPI.deleteSavingsAccount(id);
      loadData();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      notes: goal.notes || '',
    });
    setShowGoalForm(true);
  };

  const handleEditAccount = (account: SavingsAccount) => {
    setEditingAccount(account);
    setAccountFormData({
      name: account.name,
      balance: account.balance.toString(),
      interestRate: account.interestRate.toString(),
      type: account.type,
    });
    setShowAccountForm(true);
  };

  const handleCloseGoalForm = () => {
    setShowGoalForm(false);
    setEditingGoal(null);
    setGoalFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      category: '',
      notes: ''
    });
  };

  const handleCloseAccountForm = () => {
    setShowAccountForm(false);
    setEditingAccount(null);
    setAccountFormData({
      name: '',
      balance: '',
      interestRate: '',
      type: 'savings' as 'checking' | 'savings' | 'investment'
    });
  };

  // Función para traducir tipos de cuenta
  const getAccountTypeLabel = (type: 'checking' | 'savings' | 'investment'): string => {
    const typeMap: Record<'checking' | 'savings' | 'investment', string> = {
      'checking': 'Corriente',
      'savings': 'Ahorros',
      'investment': 'Inversión'
    };
    return typeMap[type] || type;
  };

  const totalSavings = savingsAccounts.reduce((sum, account) => sum + account.balance, 0);
  const totalGoals = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalBookHearts = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const progressPercentage = totalBookHearts > 0 ? (totalGoals / totalBookHearts) * 100 : 0;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ahorros</h1>
        <p className="text-sm text-gray-600">Crea metas de ahorro, registra tus cuentas y haz seguimiento del progreso hacia tus objetivos financieros</p>
      </div>

      {/* Header con estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <PiggyBank className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Ahorros totales</p>
                <p className="text-xs text-gray-500">En todas las cuentas</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSavings)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <BookHeart className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Progreso de metas</p>
                <p className="text-xs text-gray-500">Acumulado actual</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalGoals)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Progreso general</p>
                <p className="text-xs text-gray-500">Porcentaje completado</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{progressPercentage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setShowGoalForm(true)}
            className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
              <Plus className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-gray-900">Nueva meta</p>
              <p className="text-xs text-gray-500">Establecer meta</p>
            </div>
          </button>
          
          <button
            onClick={() => setShowAccountForm(true)}
            className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-gray-900">Nueva cuenta</p>
              <p className="text-xs text-gray-500">Registrar cuenta</p>
            </div>
          </button>
        </div>
      </div>

      {/* Metas de Ahorro */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Metas de ahorro</h3>
          <p className="text-xs text-gray-500">{savingsGoals.length} metas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const daysUntilBookHeart = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center">
                      <BookHeart className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{goal.name}</h4>
                      <p className="text-xs text-gray-500">{goal.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actual:</span>
                    <span className="font-medium text-gray-700">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Objetivo:</span>
                    <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progreso:</span>
                    <span className="font-medium text-gray-700">
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha objetivo:</span>
                    <span className="font-medium">
                      {format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  </div>
                  {daysUntilBookHeart > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Días restantes:</span>
                      <span className="font-medium text-gray-700">
                        {daysUntilBookHeart} días
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Barra de Progreso */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#0f0f0f] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {goal.notes && (
                  <p className="text-xs text-gray-500 mt-2">{goal.notes}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => openAdjustForGoal(goal, true)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Depositar
                  </button>
                  <button
                    onClick={() => openAdjustForGoal(goal, false)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-3 h-3" /> Retirar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cuentas de Ahorro */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Cuentas de ahorro</h3>
          <p className="text-xs text-gray-500">{savingsAccounts.length} cuentas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsAccounts.map((account) => (
            <div key={account.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center">
                    <PiggyBank className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{account.name}</h4>
                    <p className="text-xs text-gray-500">{getAccountTypeLabel(account.type)}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Saldo:</span>
                  <span className="font-medium text-gray-700">{formatCurrency(account.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interés:</span>
                  <span className="font-medium">{account.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ganancia anual:</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(account.balance * (account.interestRate / 100))}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => openAdjustForAccount(account, true)}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Depositar
                </button>
                <button
                  onClick={() => openAdjustForAccount(account, false)}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-3 h-3" /> Retirar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Nueva Meta */}
      {showGoalForm && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGoal ? 'Editar meta' : 'Nueva meta de ahorro'}
              </h2>
              <button
                onClick={handleCloseGoalForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la meta
                  <span className="text-xs text-gray-500 ml-1">(objetivo de ahorro)</span>
                </label>
                <input
                  type="text"
                  required
                  value={goalFormData.name}
                  onChange={(e) => setGoalFormData({...goalFormData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Ej: Vacaciones de verano, fondo de emergencia, compra de auto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto objetivo
                  <span className="text-xs text-gray-500 ml-1">(cuánto quieres ahorrar)</span>
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
                  Monto actual
                  <span className="text-xs text-gray-500 ml-1">(cuánto has ahorrado hasta ahora)</span>
                </label>
                  <input
                    type="text"
                    required
                    value={goalFormData.currentAmount}
                    onChange={(e) => setGoalFormData({...goalFormData, currentAmount: formatNumberInput(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="0.00 (solo números)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    required
                    value={goalFormData.category}
                    onChange={(e) => setGoalFormData({...goalFormData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Emergencias">Emergencias</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Vivienda">Vivienda</option>
                    <option value="Educación">Educación</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha objetivo
                  </label>
                  <input
                    type="date"
                    required
                    value={goalFormData.targetDate}
                    onChange={(e) => setGoalFormData({...goalFormData, targetDate: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
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
                  placeholder="Información adicional (opcional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseGoalForm}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {editingGoal ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Nueva Cuenta */}
      {showAccountForm && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAccount ? 'Editar cuenta' : 'Nueva cuenta de ahorro'}
              </h2>
              <button
                onClick={handleCloseAccountForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la cuenta
                  <span className="text-xs text-gray-500 ml-1">(identificador de la cuenta)</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({...accountFormData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Ej: Cuenta principal, fondo de emergencia..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saldo actual
                  <span className="text-xs text-gray-500 ml-1">(dinero disponible en la cuenta)</span>
                </label>
                  <input
                    type="text"
                    required
                    value={accountFormData.balance}
                    onChange={(e) => setAccountFormData({...accountFormData, balance: formatNumberInput(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="0.00 (solo números)"
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa de interés (%)
                  <span className="text-xs text-gray-500 ml-1">(rendimiento anual estimado)</span>
                </label>
                  <input
                    type="text"
                    required
                    value={accountFormData.interestRate}
                    onChange={(e) => setAccountFormData({...accountFormData, interestRate: formatNumberInput(e.target.value)})}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cuenta
                </label>
                <select
                  required
                  value={accountFormData.type}
                  onChange={(e) => setAccountFormData({...accountFormData, type: e.target.value as 'checking' | 'savings' | 'investment'})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="savings">Ahorros</option>
                  <option value="checking">Corriente</option>
                  <option value="investment">Inversión</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAccountForm}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {editingAccount ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdjustModal && adjustContext && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {adjustContext.isDeposit ? 'Depositar' : 'Retirar'}{' '}
                {adjustContext.type === 'goal' ? 'en meta' : 'en cuenta'}
              </h2>
              <button
                onClick={closeAdjustModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="text-sm text-gray-700">
                <p className="font-medium">
                  {adjustContext.type === 'goal' ? adjustContext.item.name : adjustContext.item.name}
                </p>
                <p className="text-gray-500">
                  {adjustContext.type === 'goal'
                    ? `Actual: ${formatCurrency(adjustContext.item.currentAmount)}`
                    : `Saldo: ${formatCurrency(adjustContext.item.balance)}`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                  <span className="text-xs text-gray-500 ml-1">(cantidad a depositar o retirar)</span>
                </label>
                <input
                  type="text"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(formatNumberInput(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="0.00 (solo números)"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeAdjustModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
