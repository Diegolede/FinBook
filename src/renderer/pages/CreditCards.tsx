import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  CreditCard,
  DollarSign,
  X,
  CheckCircle,
  Clock,
  ArrowLeft,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils/currency';

interface CreditCard {
  id: string;
  name: string;
  bank: string;
  creditLimit: number;
}

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
  paidInstallments?: number;
  isFixedExpense?: boolean;
}

const CreditCards: React.FC = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [isFixedExpense, setIsFixedExpense] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showDeleteTransactionModal, setShowDeleteTransactionModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [cardFormData, setCardFormData] = useState({
    name: '',
    bank: '',
    creditLimit: ''
  });

  const [transactionFormData, setTransactionFormData] = useState({
    description: '',
    amount: '',
    category: '',
    notes: '',
    creditCardId: '',
    totalInstallments: 1
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

  // Recargar datos cuando se navegue a esta sección
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, cardsData] = await Promise.all([
        window.electronAPI.getTransactions(),
        window.electronAPI.getCreditCards()
      ]);

      const creditCardTransactions = transactionsData.filter(t => t.creditCardId);
      setTransactions(creditCardTransactions);
      setCreditCards(cardsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardFormData.name.trim()) {
      alert('Por favor, ingresa un nombre para la tarjeta.');
      return;
    }
    
    if (!cardFormData.bank.trim()) {
      alert('Por favor, ingresa el nombre del banco.');
      return;
    }
    
    const creditLimit = parseFloat(cleanNumberValue(cardFormData.creditLimit));
    if (isNaN(creditLimit) || creditLimit <= 0) {
      alert('Por favor, ingresa un límite de crédito válido mayor a cero.');
      return;
    }
    
    const cardData = {
      ...cardFormData,
      creditLimit,
    };

    try {
      if (editingCard) {
        await window.electronAPI.updateCreditCard({ ...editingCard, ...cardData });
      } else {
        await window.electronAPI.addCreditCard(cardData);
      }
      
      loadData();
      handleCloseCardForm();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Error al guardar la tarjeta. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteCard = async (card: CreditCard) => {
    setCardToDelete(card);
    setShowDeleteModal(true);
  };

  const confirmDeleteCard = async () => {
    if (cardToDelete) {
      try {
        await window.electronAPI.deleteCreditCard(cardToDelete.id);
        loadData();
        setShowDeleteModal(false);
        setCardToDelete(null);
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };

  const cancelDeleteCard = () => {
    setShowDeleteModal(false);
    setCardToDelete(null);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setCardFormData({
      name: card.name,
      bank: card.bank,
      creditLimit: card.creditLimit.toString()
    });
    setShowCardForm(true);
  };

  const handleCloseCardForm = () => {
    setShowCardForm(false);
    setEditingCard(null);
    setCardFormData({
      name: '',
      bank: '',
      creditLimit: ''
    });
  };

  const handleUpdateInstallment = async (transactionId: string, paidInstallments: number) => {
    try {
      const transactionToUpdate = transactions.find(t => t.id === transactionId);
      if (transactionToUpdate) {
        await window.electronAPI.updateTransaction({
          ...transactionToUpdate,
          paidInstallments
        });
        loadData();
      }
    } catch (error) {
      console.error('Error updating installment:', error);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!transactionFormData.description.trim()) {
      alert('Por favor, ingresa una descripción para el gasto.');
      return;
    }
    
    if (!transactionFormData.amount || parseFloat(cleanNumberValue(transactionFormData.amount)) <= 0) {
      alert('Por favor, ingresa un monto válido.');
      return;
    }
    
    if (!transactionFormData.category) {
      alert('Por favor, selecciona una categoría.');
      return;
    }
    
    if (!transactionFormData.creditCardId) {
      alert('Por favor, selecciona una tarjeta de crédito.');
      return;
    }
    
    if (!transactionFormData.totalInstallments || transactionFormData.totalInstallments < 1) {
      alert('Por favor, ingresa un número válido de cuotas.');
      return;
    }
    
    const transactionData = {
      ...transactionFormData,
      amount: parseFloat(cleanNumberValue(transactionFormData.amount)),
      type: 'expense' as const,
      date: format(new Date(), 'yyyy-MM-dd'), // Usar fecha actual automáticamente
      paidInstallments: 0,
      isFixedExpense: isFixedExpense
    };

    try {
      if (editingTransaction) {
        await window.electronAPI.updateTransaction({
          ...(editingTransaction as Transaction),
          ...transactionData,
          id: editingTransaction.id
        });
      } else {
        await window.electronAPI.addTransaction(transactionData);
      }
      loadData();
      handleCloseTransactionForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error al guardar la transacción. Por favor, intenta de nuevo.');
    }
  };

  const handleCloseTransactionForm = () => {
    setShowTransactionForm(false);
    setIsFixedExpense(false);
    setEditingTransaction(null);
    setTransactionFormData({
      description: '',
      amount: '',
      category: '',
      notes: '',
      creditCardId: '',
      totalInstallments: 1
    });
  };

  const handleEditFixedTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFixedExpense(transaction.isFixedExpense || false);
    setTransactionFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      notes: transaction.notes || '',
      creditCardId: transaction.creditCardId || '',
      totalInstallments: transaction.totalInstallments || 1
    });
    setShowTransactionForm(true);
  };

  const handleDeleteFixedTransaction = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteTransactionModal(true);
  };

  const confirmDeleteFixedTransaction = async () => {
    if (transactionToDelete) {
      try {
        await window.electronAPI.deleteTransaction(transactionToDelete.id);
        setShowDeleteTransactionModal(false);
        setTransactionToDelete(null);
        loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const cancelDeleteFixedTransaction = () => {
    setShowDeleteTransactionModal(false);
    setTransactionToDelete(null);
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesCard = selectedCard === 'all' || transaction.creditCardId === selectedCard;
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCard && matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + transactions.filter(t => t.creditCardId === card.id).reduce((acc, t) => acc + t.amount, 0), 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);

  // Calcular el gasto del mes actual en tarjetas de crédito
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Gastos simples del mes actual
  const currentMonthSimpleExpenses = transactions
    .filter(t => t.creditCardId) // Solo transacciones de tarjetas de crédito
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             (!t.totalInstallments || t.totalInstallments === 1); // Gastos simples
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Gastos en cuotas del mes actual (una cuota)
  const currentMonthInstallmentExpenses = transactions
    .filter(t => t.creditCardId && t.totalInstallments && t.totalInstallments > 1)
    .filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + (t.amount / t.totalInstallments!), 0);
  
  // Cuotas pendientes de gastos anteriores que corresponden al mes actual
  const pendingInstallmentsThisMonth = transactions
    .filter(t => t.creditCardId && t.totalInstallments && t.totalInstallments > 1)
    .filter(t => {
      const transactionDate = new Date(t.date);
      const paidInstallments = t.paidInstallments || 0;
      const totalInstallments = t.totalInstallments || 1;
      
      // Calcular cuántos meses han pasado desde la transacción
      const monthsDiff = (currentYear - transactionDate.getFullYear()) * 12 + 
                        (currentMonth - transactionDate.getMonth());
      
      // La cuota que corresponde al mes actual sería: monthsDiff + 1 (mes 0 = primera cuota)
      const currentInstallmentNumber = monthsDiff + 1;
      
      // Incluir si: la cuota actual no ha sido pagada y está dentro del rango de cuotas totales
      return currentInstallmentNumber > paidInstallments && 
             currentInstallmentNumber <= totalInstallments &&
             monthsDiff >= 0; // Solo meses futuros o actuales
    })
    .reduce((sum, t) => sum + (t.amount / t.totalInstallments!), 0);
  
  const monthlyExpense = currentMonthSimpleExpenses + 
                         currentMonthInstallmentExpenses + 
                         pendingInstallmentsThisMonth;

  const installmentTransactions = transactions.filter(t => t.totalInstallments && t.totalInstallments > 1);
  const totalInstallmentAmount = installmentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const paidInstallmentAmount = installmentTransactions.reduce((sum, t) => {
    const paidInstallments = t.paidInstallments || 0;
    const totalInstallments = t.totalInstallments || 1;
    return sum + (t.amount * (paidInstallments / totalInstallments));
  }, 0);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tarjetas</h1>
        <p className="text-sm text-gray-600">Gestiona tus tarjetas, registra gastos en cuotas y mantén un seguimiento de tus deudas pendientes</p>
      </div>

      {/* Header con estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Deuda acumulada</p>
                <p className="text-xs text-gray-500">Total pendiente</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCreditCardDebt)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Vencimiento mensual</p>
                <p className="text-xs text-gray-500">Pago del período</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(monthlyExpense)}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Cuotas restantes</p>
                <p className="text-xs text-gray-500">Pendiente de pago</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInstallmentAmount - paidInstallmentAmount)}</p>
        </div>
      </div>

      {/* Bento Grid Principal */}
      <div className="space-y-4">
        {/* Fila 2: Acciones Rápidas + Tarjetas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowCardForm(true)}
                className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900">Nueva tarjeta</p>
                </div>
              </button>
              <button 
                onClick={() => { setIsFixedExpense(false); setShowTransactionForm(true); }}
                className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900">Nuevo gasto</p>
                </div>
              </button>
              <button 
                onClick={() => { setIsFixedExpense(true); setTransactionFormData(prev => ({ ...prev, totalInstallments: 1 })); setShowTransactionForm(true); }}
                className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-900">Gasto fijo</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tarjetas de Crédito */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Mis tarjetas</h3>
              <p className="text-xs text-gray-500">{creditCards.length} tarjetas</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creditCards.map((card) => {
                const currentBalance = transactions.filter(t => t.creditCardId === card.id).reduce((acc, t) => acc + t.amount, 0);
                return (
                <div key={card.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{card.name}</h4>
                        <p className="text-xs text-gray-500">{card.bank}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Límite:</span>
                      <span className="font-medium">{formatCurrency(card.creditLimit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saldo:</span>
                      <span className="font-medium text-gray-700">{formatCurrency(currentBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponible:</span>
                      <span className="font-medium text-gray-700">
                        {formatCurrency(card.creditLimit - currentBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilización:</span>
                      <span className="font-medium text-gray-700">
                        {((currentBalance / card.creditLimit) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                </div>
              )})}
            </div>
          </div>
        </div>

        {/* Fila 3: Gastos Simples */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Gastos simples</h3>
            <p className="text-xs text-gray-500">
              {filteredTransactions.filter(t => t.creditCardId && (!t.isFixedExpense) && (t.totalInstallments === 1 || !t.totalInstallments) && t.category !== 'Saldo Inicial').length} gastos
            </p>
          </div>

          {/* Grid de Gastos Simples */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions
              .filter(t => t.creditCardId && (!t.isFixedExpense) && (t.totalInstallments === 1 || !t.totalInstallments) && t.category !== 'Saldo Inicial')
              .map((transaction) => {
                const card = creditCards.find(c => c.id === transaction.creditCardId);
                return (
                  <div key={transaction.id} className="bg-white rounded-2xl p-4 border border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{transaction.description}</h3>
                          <p className="text-xs text-gray-500">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {card && (
                          <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                        <button
                          onClick={() => handleEditFixedTransaction(transaction)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Editar gasto"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteFixedTransaction(transaction)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {card && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs font-medium text-gray-700">{card.name}</p>
                        <p className="text-xs text-gray-500">{card.bank}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Estado Vacío */}
          {filteredTransactions.filter(t => t.creditCardId && (!t.isFixedExpense) && (t.totalInstallments === 1 || !t.totalInstallments) && t.category !== 'Saldo Inicial').length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay gastos registrados</p>
              <p className="text-xs text-gray-400">Los gastos de una sola cuota aparecerán aquí. Usa "Nuevo gasto" para agregar uno</p>
            </div>
          )}
        </div>

        {/* Fila 4: Gastos Fijos */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Gastos fijos</h3>
            <p className="text-xs text-gray-500">
              {filteredTransactions.filter(t => t.creditCardId && t.isFixedExpense && t.category !== 'Saldo Inicial').length} gastos
            </p>
          </div>

          {/* Grid de Gastos Fijos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions
              .filter(t => t.creditCardId && t.isFixedExpense && t.category !== 'Saldo Inicial')
              .map((transaction) => {
                const card = creditCards.find(c => c.id === transaction.creditCardId);
                return (
                  <div key={transaction.id} className="bg-white rounded-2xl p-4 border border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{transaction.description}</h3>
                          <p className="text-xs text-gray-500">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {card && (
                          <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                        <button
                          onClick={() => handleEditFixedTransaction(transaction)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Editar gasto"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteFixedTransaction(transaction)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {card && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs font-medium text-gray-700">{card.name}</p>
                        <p className="text-xs text-gray-500">{card.bank}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(transaction.amount)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Estado Vacío */}
          {filteredTransactions.filter(t => t.creditCardId && t.isFixedExpense && t.category !== 'Saldo Inicial').length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay gastos fijos registrados</p>
              <p className="text-xs text-gray-400">Los gastos recurrentes (suscripciones, servicios) aparecerán aquí</p>
            </div>
          )}
        </div>

        {/* Fila 5: Gastos en Cuotas */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Gastos en cuotas</h3>
            <p className="text-xs text-gray-500">
              {filteredTransactions.filter(t => t.creditCardId && (!t.isFixedExpense) && t.totalInstallments && t.totalInstallments > 1).length} gastos
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar gastos en cuotas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="all">Ver todas</option>
                {creditCards.map(card => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Gastos en Cuotas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions
              .filter(t => t.creditCardId && (!t.isFixedExpense) && t.totalInstallments && t.totalInstallments > 1)
              .map((transaction) => {
                const card = creditCards.find(c => c.id === transaction.creditCardId);
                const paidInstallments = transaction.paidInstallments || 0;
                const totalInstallments = transaction.totalInstallments || 1;
                const installmentProgress = (paidInstallments / totalInstallments) * 100;
                const installmentAmount = transaction.amount / totalInstallments;
                const remainingAmount = transaction.amount - (installmentAmount * paidInstallments);
                const remainingInstallments = totalInstallments - paidInstallments;

                return (
                  <div key={transaction.id} className="bg-white rounded-2xl p-4 border border-gray-200 hover:bg-gray-50 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md">
                    {/* Header de la Card */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{transaction.description}</h3>
                          <p className="text-xs text-gray-500">{transaction.category}</p>
                        </div>
                      </div>
                      {card && (
                        <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Información de la Tarjeta */}
                    {card && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs font-medium text-gray-700">{card.name}</p>
                        <p className="text-xs text-gray-500">{card.bank}</p>
                      </div>
                    )}

                    {/* Barra de Progreso */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Progreso de cuotas</span>
                        <span className="text-xs font-medium text-gray-700">
                          {paidInstallments}/{totalInstallments}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#0f0f0f] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${installmentProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Montos */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Total:</span>
                        <span className="text-xs font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Por cuota:</span>
                        <span className="text-xs font-medium text-gray-700">
                          {formatCurrency(installmentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Restante:</span>
                        <span className="text-xs font-medium text-gray-700">
                          {formatCurrency(remainingAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Fecha */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center space-x-2">
                      {remainingInstallments > 0 ? (
                        <>
                          <button
                            onClick={() => handleUpdateInstallment(transaction.id, paidInstallments + 1)}
                            className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md font-medium text-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Pagar cuota</span>
                          </button>
                          
                          {paidInstallments > 0 && (
                            <button
                              onClick={() => handleUpdateInstallment(transaction.id, paidInstallments - 1)}
                              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md font-medium border border-gray-200 text-sm"
                              title="Deshacer pago de cuota"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>Retroceder cuota</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
                          <CheckCircle className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Completado</span>
                        </div>
                      )}
                    </div>

                    {/* Estado de Cuotas Pendientes */}
                    {remainingInstallments > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700">
                            {remainingInstallments} cuota{remainingInstallments > 1 ? 's' : ''} pendiente{remainingInstallments > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Estado de Completado */}
                    {paidInstallments >= totalInstallments && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-700">¡Pago completado!</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Estado Vacío */}
          {filteredTransactions.filter(t => t.creditCardId && (!t.isFixedExpense) && t.totalInstallments && t.totalInstallments > 1).length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No hay gastos en cuotas</p>
              <p className="text-xs text-gray-400">Los gastos a plazos (compras grandes) aparecerán aquí. Puedes pagar cuotas individualmente</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Tarjeta */}
      {showCardForm && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCard ? 'Editar tarjeta' : 'Nueva tarjeta'}
              </h2>
              <button
                onClick={handleCloseCardForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la tarjeta
                </label>
                <input
                  type="text"
                  required
                  value={cardFormData.name}
                  onChange={(e) => setCardFormData({...cardFormData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Ej: Visa Clásica"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco
                </label>
                <input
                  type="text"
                  required
                  value={cardFormData.bank}
                  onChange={(e) => setCardFormData({...cardFormData, bank: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Ej: Banco Santander"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de crédito
                  <span className="text-xs text-gray-500 ml-1">(monto máximo disponible)</span>
                </label>
                <input
                  type="text"
                  required
                  value={cardFormData.creditLimit}
                  onChange={(e) => setCardFormData({...cardFormData, creditLimit: formatNumberInput(e.target.value)})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="0.00 (solo números)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCardForm}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  {editingCard ? 'Actualizar' : 'Guardar'}
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
                onClick={cancelDeleteCard}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{cardToDelete?.name}</h3>
                  <p className="text-sm text-gray-500">{cardToDelete?.bank}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Esta acción eliminará permanentemente la tarjeta y sus datos. ¿Deseas continuar?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={cancelDeleteCard}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteCard}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación de Gasto Fijo */}
      {showDeleteTransactionModal && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar eliminación
              </h2>
              <button
                onClick={cancelDeleteFixedTransaction}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{transactionToDelete?.description}</h3>
                  <p className="text-sm text-gray-500">{transactionToDelete?.category}</p>
                  <p className="text-xs text-gray-400">
                    {transactionToDelete && format(new Date(transactionToDelete.date), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">{transactionToDelete && formatCurrency(transactionToDelete.amount)}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Esta acción eliminará permanentemente el gasto. ¿Deseas continuar?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={cancelDeleteFixedTransaction}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteFixedTransaction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Gasto */}
      {showTransactionForm && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTransaction ? (isFixedExpense ? 'Editar gasto fijo' : 'Editar gasto') : (isFixedExpense ? 'Nuevo gasto fijo' : 'Nuevo gasto con tarjeta')}
              </h2>
              <button
                onClick={handleCloseTransactionForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                  <span className="text-xs text-gray-500 ml-1">(qué compraste o pagaste)</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionFormData.description}
                  onChange={(e) => setTransactionFormData({...transactionFormData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Ej: Compra de electrodoméstico, pago de suscripción mensual..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                  <span className="text-xs text-gray-500 ml-1">(total del gasto)</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionFormData.amount}
                  onChange={(e) => setTransactionFormData({...transactionFormData, amount: formatNumberInput(e.target.value)})}
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
                  value={transactionFormData.category}
                  onChange={(e) => setTransactionFormData({...transactionFormData, category: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Electrónicos">Electrónicos</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Compras">Compras</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarjeta de crédito
                </label>
                <select
                  required
                  value={transactionFormData.creditCardId}
                  onChange={(e) => setTransactionFormData({...transactionFormData, creditCardId: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Seleccionar tarjeta</option>
                  {creditCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name} - {card.bank}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total de cuotas
                  <span className="text-xs text-gray-500 ml-1">(número de pagos mensuales)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={transactionFormData.totalInstallments}
                  onChange={(e) => setTransactionFormData({...transactionFormData, totalInstallments: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              {transactionFormData.totalInstallments > 1 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Monto por cuota:</span> {formatCurrency(parseFloat(cleanNumberValue(transactionFormData.amount)) / transactionFormData.totalInstallments)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">Total de cuotas:</span> {transactionFormData.totalInstallments}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={transactionFormData.notes}
                  onChange={(e) => setTransactionFormData({...transactionFormData, notes: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  rows={3}
                  placeholder="Información adicional (opcional)"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseTransactionForm}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0f0f0f] text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Guardar gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;