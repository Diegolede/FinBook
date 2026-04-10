import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  X,
  Trash2,
  Tags,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoriesModal: React.FC<CategoriesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#000000' // Default strictly monochrome color
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

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
      color: category.color || '#000000'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.common.confirmDelete)) return;
    
    try {
      await window.electronAPI.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'expense',
      color: '#000000'
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[10000] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[85vh] overflow-y-auto mx-4 shadow-2xl animate-scale-in border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center shadow-sm">
              <Tags className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-none">{t.categories.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{t.categories.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-gray-900 text-white px-5 py-3 rounded-xl hover:bg-black transition-all shadow-md font-semibold text-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.categories.newCategory}</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-all group"
              aria-label={t.common.cancel}
            >
              <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600 mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">{t.categories.loadingCategories}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t.categories.incomeCategories}
                  </h3>
                </div>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {categories.filter(cat => (cat.type || '').toLowerCase() === 'income').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {categories
                  .filter(cat => (cat.type || '').toLowerCase() === 'income')
                  .map(category => (
                    <CategoryItem 
                      key={category.id} 
                      category={category} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                    />
                  ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t.categories.expenseCategories}
                  </h3>
                </div>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {categories.filter(cat => (cat.type || '').toLowerCase() === 'expense').length}
                </span>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {categories
                  .filter(cat => (cat.type || '').toLowerCase() === 'expense')
                  .map(category => (
                    <CategoryItem 
                      key={category.id} 
                      category={category} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Form - Centered on top */}
        {showForm && (
          <div 
            className="fixed inset-0 bg-[#000] bg-opacity-40 backdrop-blur-[2px] flex items-center justify-center z-[10001] animate-fade-in"
            onClick={handleCloseForm}
          >
            <div 
              className="bg-white rounded-3xl p-7 w-full max-w-md mx-4 shadow-2xl animate-scale-in border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? t.categories.editCategory : t.categories.newCategoryForm}
                </h2>
                <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-widest">
                    {t.categories.name}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-gray-900 focus:bg-white rounded-xl px-4 py-3.5 transition-all outline-none font-medium placeholder-gray-300"
                    placeholder={t.categories.name}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 uppercase tracking-widest">
                    {t.categories.type}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'expense'})}
                      className={`py-3.5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.type === 'expense' 
                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {t.categories.expense}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, type: 'income'})}
                      className={`py-3.5 rounded-xl font-bold transition-all border-2 text-sm ${
                        formData.type === 'income' 
                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {t.categories.income}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 active:scale-95 transition-all text-sm shadow-sm"
                  >
                    {t.categories.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black active:scale-95 transition-all text-sm shadow-lg"
                  >
                    {editingCategory ? t.categories.update : t.categories.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryItem: React.FC<{ 
  category: Category; 
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
}> = ({ category, onEdit, onDelete }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl shadow-sm hover:bg-white hover:border-gray-200 hover:shadow-md transition-all group">
    <div className="flex items-center space-x-4">
      {/* Replaced color icon with a generic monochrome icon */}
      <div className="w-2 h-2 rounded-full bg-gray-900 shadow-sm opacity-20"></div>
      <span className="font-semibold text-gray-700 text-sm tracking-tight">{category.name}</span>
    </div>
    <div className="flex items-center space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(category)}
        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(category.id)}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default CategoriesModal;
