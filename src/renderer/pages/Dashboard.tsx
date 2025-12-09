import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  PiggyBank,
  Wallet,
  Settings,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/currency';

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [allocation, setAllocation] = useState<{ needs: number; wants: number; savings: number; methodTitle?: string }>({ needs: 50, wants: 30, savings: 20, methodTitle: 'Método clásico' });
  const [showPresets, setShowPresets] = useState(false);
  const [methodTitle, setMethodTitle] = useState<string>('Método clásico');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryData, transactionsData, currentAllocation] = await Promise.all([
        window.electronAPI.getSummary(),
        window.electronAPI.getTransactions(),
        window.electronAPI.getBudgetAllocation()
      ]);
      
      setSummary(summaryData);
      const sortedByDateDesc = [...transactionsData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentTransactions(sortedByDateDesc.slice(0, 5));
      setAllocation(currentAllocation);
      setMethodTitle(getMethodTitleForAllocation(currentAllocation));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    { title: 'Método clásico', needs: 50, wants: 30, savings: 20 },
    { title: 'Ingresos ajustados / Prioridad de necesidades', needs: 65, wants: 20, savings: 15 },
    { title: 'Ingresos cómodos / Prioridad de ahorro', needs: 45, wants: 25, savings: 30 },
    { title: 'Ataque de deudas / Ahorro rápido', needs: 55, wants: 15, savings: 30 },
    { title: 'Construcción de patrimonio / Largo plazo', needs: 50, wants: 20, savings: 30 },
    { title: 'Períodos inestables / Buffer financiero', needs: 60, wants: 15, savings: 25 },
  ];

  const getMethodTitleForAllocation = (alloc: { needs: number; wants: number; savings: number; methodTitle?: string }) => {
    // Si hay un título guardado, usarlo (esto resuelve el problema de métodos con mismos valores)
    if (alloc.methodTitle) {
      return alloc.methodTitle;
    }
    // Si no hay título guardado, buscar en los presets
    const match = presets.find(p => p.needs === alloc.needs && p.wants === alloc.wants && p.savings === alloc.savings);
    return match ? match.title : 'Método personalizado';
  };

  const applyPreset = async (preset: { title: string; needs: number; wants: number; savings: number }) => {
    const previous = allocation;
    // Reflejar inmediatamente en la UI
    const newAllocation = { needs: preset.needs, wants: preset.wants, savings: preset.savings, methodTitle: preset.title };
    setAllocation(newAllocation);
    setMethodTitle(preset.title);
    setShowPresets(false);
    try {
      await window.electronAPI.saveBudgetAllocation(newAllocation);
    } catch (e) {
      console.error(e);
      // Revertir si falla la persistencia
      setAllocation(previous);
      setMethodTitle(getMethodTitleForAllocation(previous));
      alert('No se pudo guardar la configuración');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'income':
        navigate('/income');
        break;
      case 'expense':
        navigate('/expenses');
        break;
      case 'savings':
        navigate('/savings');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-6 px-6 space-y-6 max-w-[90rem] mx-auto relative z-10">
      {/* Título de bienvenida */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido a FinBook</h1>
        <p className="text-sm text-gray-600">Vista general de tus ingresos, gastos y balance del mes actual</p>
      </div>

      {/* Primera fila: Métricas principales simplificadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Ingresos</p>
                <p className="text-xs text-gray-500">Mes actual</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalIncome || 0)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Gastos</p>
                <p className="text-xs text-gray-500">Mes actual</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.totalExpenses || 0)}</p>
        </div>

        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-gray-600" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-600">Balance</p>
                <p className="text-xs text-gray-500">Mes actual</p>
              </div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency((summary?.totalIncome || 0) - (summary?.totalExpenses || 0))}</p>
        </div>
      </div>

      {showPresets && (
        <div
          className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0"
          role="dialog"
          aria-modal="true"
          style={{ margin: 0, padding: 0 }}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-2xl mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Configurar presupuesto mensual</h2>
            <p className="text-sm text-gray-500 mt-1">Elige un método de distribución o personaliza los porcentajes</p>
              <button
                onClick={() => setShowPresets(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {presets.map((p) => {
                // Verificar si este preset está seleccionado comparando valores y título
                const isSelected = (allocation.needs === p.needs && 
                                  allocation.wants === p.wants && 
                                  allocation.savings === p.savings) ||
                                  (allocation.methodTitle === p.title);
                return (
                  <button
                    key={p.title}
                    type="button"
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 ${
                      isSelected 
                        ? 'border-gray-900 bg-gray-100 shadow-md' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => applyPreset(p)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-base font-semibold text-gray-900">
                        {p.title}
                      </p>
                      {isSelected && (
                        <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Necesidades {p.needs}% · Deseos {p.wants}% · Ahorro {p.savings}%</p>
                  </button>
                );
              })}
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPresets(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segunda fila: Acciones Rápidas + Método 50-30-20 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Acciones Rápidas */}
        <div className="bg-white rounded-3xl px-5 pt-8 pb-5 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Acciones rápidas</h3>
          <div className="space-y-2">
            <button onClick={() => handleQuickAction('income')} className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-900">Registrar ingreso</p>
                <p className="text-xs text-gray-500">Agregar dinero recibido</p>
              </div>
            </button>
            <button onClick={() => handleQuickAction('expense')} className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-900">Registrar gasto</p>
                <p className="text-xs text-gray-500">Agregar dinero gastado</p>
              </div>
            </button>
            <button onClick={() => handleQuickAction('savings')} className="w-full flex items-center space-x-2 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-200">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-900">Gestionar ahorros</p>
                <p className="text-xs text-gray-500">Ver metas y cuentas</p>
              </div>
            </button>
          </div>
        </div>

        {/* Método 50-30-20 configurable */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg relative">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">{methodTitle}</h3>
            <button
              className="group p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Ajustes de método 50-30-20"
              onClick={() => setShowPresets((s) => !s)}
            >
              <Settings className="w-5 h-5 text-gray-600 transition-transform duration-500 ease-in-out group-hover:rotate-[360deg]" />
            </button>
          </div>
          {/* modal moved outside to avoid stacking issues */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Necesidades */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] transform-gpu will-change-transform hover:scale-[1.03] hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600">{allocation.needs}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Necesidades</h4>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">Alquiler, comida, servicios básicos y transporte</p>
                <p className="text-xs text-gray-500">
                  Presupuesto: {formatCurrency((summary?.totalIncome || 0) * (allocation.needs / 100))}
                </p>
              </div>
            </div>

            {/* Deseos */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] transform-gpu will-change-transform hover:scale-[1.03] hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600">{allocation.wants}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Deseos</h4>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">Entretenimiento, restaurantes, compras y hobbies</p>
                <p className="text-xs text-gray-500">
                  Presupuesto: {formatCurrency((summary?.totalIncome || 0) * (allocation.wants / 100))}
                </p>
              </div>
            </div>

            {/* Ahorros */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] transform-gpu will-change-transform hover:scale-[1.03] hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600">{allocation.savings}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Ahorros</h4>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">Fondo de emergencia, inversiones y metas a largo plazo</p>
                <p className="text-xs text-gray-500">
                  Presupuesto: {formatCurrency((summary?.totalIncome || 0) * (allocation.savings / 100))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tercera fila: Transacciones Recientes */}
      <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Transacciones recientes</h3>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-gray-100' : 'bg-gray-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-gray-700' : 'text-gray-700'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(transaction.date), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aún no tienes transacciones registradas</p>
              <p className="text-xs text-gray-400">Usa las acciones rápidas para agregar tu primer ingreso o gasto</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 