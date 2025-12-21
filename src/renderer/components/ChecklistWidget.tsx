import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

const ChecklistWidget: React.FC = () => {
    const { t } = useLanguage();
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [newItemText, setNewItemText] = useState('');
    const [loading, setLoading] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const loadedItems = await window.electronAPI.getChecklistItems();
            setItems(loadedItems);
        } catch (error) {
            console.error('Error loading checklist items:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newItemText.trim()) return;

        try {
            const addedItem = await window.electronAPI.addChecklistItem(newItemText.trim());
            setItems([...items, addedItem]);
            setNewItemText('');
        } catch (error) {
            console.error('Error adding checklist item:', error);
        }
    };

    const toggleItem = async (id: string, completed: boolean) => {
        try {
            // Optimistic update
            setItems(items.map(item =>
                item.id === id ? { ...item, completed: !completed } : item
            ));
            await window.electronAPI.toggleChecklistItem(id, !completed);
        } catch (error) {
            console.error('Error toggling checklist item:', error);
            // Revert on error
            loadItems();
        }
    };

    const deleteItem = async (id: string) => {
        try {
            // Optimistic update
            setItems(items.filter(item => item.id !== id));
            await window.electronAPI.deleteChecklistItem(id);
        } catch (error) {
            console.error('Error deleting checklist item:', error);
            // Revert on error
            loadItems();
        }
    };

    return (
        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-200 flex flex-col h-full transition-transform duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {items.filter(i => !i.completed).length} pendientes
                </span>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar space-y-2 max-h-[220px]">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No hay notas pendientes</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                        >
                            <div
                                className="flex items-center space-x-3 flex-1 cursor-pointer"
                                onClick={() => toggleItem(item.id, item.completed)}
                            >
                                <div className={`transition-all duration-200 ${item.completed ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    {item.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </div>
                                <span className={`text-sm transition-all duration-200 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {item.text}
                                </span>
                            </div>
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="text-gray-300 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-lg hover:bg-gray-100"
                                title={t.common?.delete || "Eliminar"}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={addItem} className="mt-auto relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Agregar nota..."
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white text-sm transition-all duration-200"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newItemText.trim()}
                >
                    <Plus className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChecklistWidget;
