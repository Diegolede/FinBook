import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2,
  Tag
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

const Categories: React.FC = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await window.electronAPI.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await window.electronAPI.updateCategory({
          ...formData,
          id: editingCategory.id
        });
      } else {
        await window.electronAPI.addCategory(formData);
      }
      
      await loadCategories();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'expense',
      color: '#3B82F6'
    });
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#6B7280', '#6366F1', '#14B8A6'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.categories.loadingCategories}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.categories.title}</h1>
          <p className="text-gray-600">{t.categories.subtitle}</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t.categories.newCategory}</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Income Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-success-500 rounded-full mr-2"></span>
            {t.categories.incomeCategories}
          </h3>
          <div className="space-y-3">
            {categories
              .filter(cat => (cat.type || '').toLowerCase() === 'income')
              .map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-danger-500 rounded-full mr-2"></span>
            {t.categories.expenseCategories}
          </h3>
          <div className="space-y-3">
            {categories
              .filter(cat => (cat.type || '').toLowerCase() === 'expense')
              .map(category => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingCategory ? t.categories.editCategory : t.categories.newCategoryForm}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.categories.name}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input"
                  placeholder={t.categories.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.categories.type}
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense'})}
                  className="select"
                >
                  <option value="expense">{t.categories.expense}</option>
                  <option value="income">{t.categories.income}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.categories.color}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn btn-secondary flex-1"
                >
                  {t.categories.cancel}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingCategory ? t.categories.update : t.categories.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 