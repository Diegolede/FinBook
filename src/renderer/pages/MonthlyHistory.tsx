import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  FileDown,
  ArrowLeft,
  BarChart3,
  ChevronRight,
  PiggyBank,
  Search,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionItem {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  notes: string;
  creditCardId: string | null;
  creditCardName: string | null;
  isSavings: boolean;
}

interface MonthSummary {
  monthKey: string;
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
  transactions: TransactionItem[];
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyHistory: React.FC = () => {
  const { t, language } = useLanguage();
  const [history, setHistory] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<MonthSummary | null>(null);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'savings'>('all');

  const monthNames = language === 'es' ? MONTH_NAMES_ES : MONTH_NAMES_EN;

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await window.electronAPI.getMonthlyHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthLabel = (monthKey: string): string => {
    const [yearStr, monthStr] = monthKey.split('-');
    const monthIndex = parseInt(monthStr, 10) - 1;
    return `${monthNames[monthIndex]} ${yearStr}`;
  };

  const handleExportPDF = async (month: MonthSummary) => {
    setExporting(true);
    try {
      // Find previous month for comparison
      const currentIndex = history.findIndex(h => h.monthKey === month.monthKey);
      const prevMonth = currentIndex < history.length - 1 ? history[currentIndex + 1] : null;

      const comparisons = {
        incomeChange: prevMonth && prevMonth.totalIncome > 0 
          ? ((month.totalIncome - prevMonth.totalIncome) / prevMonth.totalIncome) * 100 
          : 0,
        expenseChange: prevMonth && prevMonth.totalExpenses > 0 
          ? ((month.totalExpenses - prevMonth.totalExpenses) / prevMonth.totalExpenses) * 100 
          : 0,
        savingsChange: prevMonth && prevMonth.totalSavings > 0 
          ? ((month.totalSavings - prevMonth.totalSavings) / prevMonth.totalSavings) * 100 
          : 0,
        balanceChange: prevMonth && Math.abs(prevMonth.balance) > 0 
          ? ((month.balance - prevMonth.balance) / Math.abs(prevMonth.balance)) * 100 
          : 0
      };

      const result = await window.electronAPI.exportMonthlyPDF({
        monthLabel: getMonthLabel(month.monthKey),
        totalIncome: month.totalIncome,
        totalExpenses: month.totalExpenses,
        totalSavings: month.totalSavings,
        balance: month.balance,
        transactionCount: month.transactionCount,
        expenseCount: month.expenseCount,
        avgExpense: month.avgExpense,
        topCategories: month.topCategories,
        topIncomeCategories: month.topIncomeCategories,
        topCards: month.topCards,
        transactions: month.transactions,
        comparisons
      });
      if (result.success) {
        // Success
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.history.loadingHistory}</p>
        </div>
      </div>
    );
  }

  // ─── DETAIL VIEW ─────────────────────────────────────────────
  if (selectedMonth) {
    const m = selectedMonth;
    const maxCatAmount = m.topCategories.length > 0 ? m.topCategories[0].amount : 1;
    const maxIncomeCatAmount = m.topIncomeCategories.length > 0 ? m.topIncomeCategories[0].amount : 1;

    const filteredTransactions = (m.transactions || []).filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || 
                          (filterType === 'savings' && tx.isSavings) ||
                          (filterType === 'income' && tx.type === 'income' && !tx.isSavings) ||
                          (filterType === 'expense' && tx.type === 'expense' && !tx.isSavings);
      return matchesSearch && matchesType;
    });

    return (
      <div className="pt-8 pb-6 px-6 space-y-6 max-w-[90rem] mx-auto relative z-10">
        {/* Header con botón volver */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedMonth(null)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getMonthLabel(m.monthKey)}</h1>
              <p className="text-sm text-gray-600">{t.history.monthSummary}</p>
            </div>
          </div>
          
          <button
            onClick={() => handleExportPDF(m)}
            disabled={exporting}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#0f0f0f] text-white rounded-2xl hover:bg-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            <span className="font-medium">{exporting ? t.history.exporting : t.history.exportPDF}</span>
          </button>
        </div>

        {/* Stats principales - Bento Grid Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t.history.totalIncome}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(m.totalIncome)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t.history.totalExpenses}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(m.totalExpenses)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t.history.totalSavings}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(m.totalSavings)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t.history.balance}</p>
            </div>
            <p className={`text-2xl font-bold ${m.balance >= 0 ? 'text-gray-900' : 'text-gray-900'}`}>
              {formatCurrency(m.balance)}
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top categorías de gasto */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">{t.history.topExpenseCategories}</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            {m.topCategories.length > 0 ? (
              <div className="space-y-4">
                {m.topCategories.map((cat, i) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-sm font-semibold text-gray-700">{cat.category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(cat.amount)}</span>
                        <span className="text-xs font-medium text-gray-400 w-10 text-right">{cat.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gray-900 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${(cat.amount / maxCatAmount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">—</div>
            )}
          </div>

          {/* Top categorías de ingreso & Cards */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 flex-1">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{t.history.topIncomeCategories}</h3>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
              {m.topIncomeCategories.length > 0 ? (
                <div className="space-y-4">
                  {m.topIncomeCategories.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{cat.category}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(cat.amount)}</span>
                          <span className="text-xs font-medium text-gray-400">{cat.percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gray-400 h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${(cat.amount / maxIncomeCatAmount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-sm">—</div>
              )}
            </div>

            {m.topCards.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.history.mostUsedCard}</h3>
                {m.topCards.slice(0, 3).map((card, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{card.name}</p>
                            <p className="text-xs text-gray-500">{card.bank}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-base font-bold text-gray-900">{formatCurrency(card.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── TRANSACTION LIST (FULL WIDTH) ─── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="p-7 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{t.history.transactions}</h3>
                    <p className="text-sm text-gray-500">{m.transactionCount} movimientos registrados</p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder={t.transactions.search || "Buscar..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all w-full md:w-64"
                        />
                    </div>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                        {(['all', 'income', 'expense', 'savings'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const [y, mo, d] = tx.date.split('-');
                  const dateFormatted = `${d}/${mo}/${y}`;
                  
                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-2xl transition-all duration-200 border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                            tx.isSavings ? 'bg-gray-100' :
                            tx.type === 'income' ? 'bg-gray-100' : 'bg-gray-100'
                        }`}>
                          {tx.isSavings ? (
                            <PiggyBank className="w-6 h-6 text-gray-600" />
                          ) : tx.type === 'income' ? (
                            <TrendingUp className="w-6 h-6 text-gray-600" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-black transition-colors">{tx.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{tx.category}</span>
                            {tx.creditCardName && (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                <CreditCard className="w-3 h-3" />
                                {tx.creditCardName}
                              </span>
                            )}
                            {dateFormatted && <span className="text-xs text-gray-300">•</span>}
                            <span className="text-xs text-gray-400">{dateFormatted}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-lg font-black ${
                            tx.isSavings ? 'text-gray-900' :
                            tx.type === 'income' ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        {tx.notes && <p className="text-[10px] text-gray-300 italic max-w-[150px] truncate">{tx.notes}</p>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                    <p className="text-gray-400 font-medium">No se encontraron transacciones con esosfiltros.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ───────────────────────────────────────────────
  return (
    <div className="pt-8 pb-6 px-6 space-y-6 max-w-[90rem] mx-auto relative z-10">
      {/* Título */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.history.title}</h1>
        <p className="text-sm text-gray-600">{t.history.subtitle}</p>
      </div>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((month) => {
            const isPositive = month.balance >= 0;
            return (
              <div
                key={month.monthKey}
                onClick={() => setSelectedMonth(month)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{getMonthLabel(month.monthKey)}</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{month.transactionCount} {language === 'es' ? 'transacciones' : 'transactions'}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-8">
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{language === 'es' ? 'Ingresos' : 'Income'}</p>
                        <p className="text-sm font-bold text-gray-900">+{formatCurrency(month.totalIncome)}</p>
                    </div>
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{language === 'es' ? 'Gastos' : 'Expenses'}</p>
                        <p className="text-sm font-bold text-gray-900">-{formatCurrency(month.totalExpenses)}</p>
                    </div>
                    <div className="flex flex-col items-end min-w-[120px]">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Balance</p>
                        <p className={`text-lg font-black ${isPositive ? 'text-gray-900' : 'text-gray-900'}`}>
                            {formatCurrency(month.balance)}
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 shadow-sm border border-gray-200 text-center">
          <CalendarDays className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t.history.noHistory}</h3>
          <p className="text-gray-500 max-w-sm mx-auto">{t.history.noHistoryDescription}</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyHistory;
