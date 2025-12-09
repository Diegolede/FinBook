import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Calendar,
  DollarSign,
  PieChart,
  LineChart,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils/currency';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        window.electronAPI.getTransactions(),
        window.electronAPI.getCategories()
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return transactionDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return transactionDate >= yearAgo;
        default:
          return true;
      }
    });
    
    return filtered;
  };

  const getCategoryData = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryTotals: { [key: string]: number } = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      }
    });

    const categoryColors: { [key: string]: string } = {};
    categories.forEach(category => {
      categoryColors[category.name] = category.color;
    });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(cat => categoryColors[cat] || '#6B7280'),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const getMonthlyData = () => {
    const filteredTransactions = getFilteredTransactions();
    const monthlyTotals: { [key: string]: { income: number; expenses: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const month = format(new Date(transaction.date), 'yyyy-MM');
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyTotals[month].income += transaction.amount;
      } else {
        monthlyTotals[month].expenses += transaction.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyTotals).sort();
    
    return {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return format(new Date(parseInt(year), parseInt(monthNum) - 1), 'MMM yyyy', { locale: es });
      }),
      datasets: [
        {
          label: 'Ingresos',
          data: sortedMonths.map(month => monthlyTotals[month].income),
          backgroundColor: '#10B981',
          borderColor: '#10B981',
        },
        {
          label: 'Gastos',
          data: sortedMonths.map(month => monthlyTotals[month].expenses),
          backgroundColor: '#EF4444',
          borderColor: '#EF4444',
        }
      ]
    };
  };

  const getSummaryStats = () => {
    const filteredTransactions = getFilteredTransactions();
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, balance };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  const summaryStats = getSummaryStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis detallado de tus finanzas</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="select"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="year">Último Año</option>
              <option value="all">Todo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance</p>
              <p className={`text-2xl font-bold ${summaryStats.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(summaryStats.balance)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-success-600">
                {formatCurrency(summaryStats.totalIncome)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos</p>
              <p className="text-2xl font-bold text-danger-600">
                {formatCurrency(summaryStats.totalExpenses)}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-danger-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia Mensual</h3>
          <Bar 
            data={getMonthlyData()} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categorías</h3>
          <Doughnut 
            data={getCategoryData()} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Top Categories */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías Principales</h3>
        <div className="space-y-4">
          {(() => {
            const filteredTransactions = getFilteredTransactions();
            const categoryTotals: { [key: string]: number } = {};
            
            filteredTransactions.forEach(transaction => {
              if (transaction.type === 'expense') {
                categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
              }
            });

            const sortedCategories = Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5);

            return sortedCategories.map(([category, amount]) => {
              const categoryInfo = categories.find(cat => cat.name === category);
              const percentage = (amount / summaryStats.totalExpenses) * 100;
              
              return (
                <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoryInfo?.color || '#6B7280' }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-sm text-gray-500">{percentage.toFixed(1)}% del total</p>
                    </div>
                  </div>
                  <p className="font-semibold text-danger-600">
                    {formatCurrency(amount)}
                  </p>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};

export default Reports; 