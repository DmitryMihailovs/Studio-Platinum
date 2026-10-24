import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, ShieldAlert } from 'lucide-react';
import { PortfolioItem, TranslationSet } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  works: PortfolioItem[];
  t: TranslationSet;
  onClose: () => void;
  onSaveWorks: (works: PortfolioItem[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  works,
  t,
  onClose,
  onSaveWorks,
}) => {
  const [items, setItems] = useState<PortfolioItem[]>(works);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState('images/1.jpeg');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'dresser' | 'wardrobe' | 'shelf' | 'custom'>('dresser');

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      title: newTitle,
      image: newImage || 'images/1.jpeg',
      description: newDesc || 'Studio Platinum custom furniture object.',
      category: newCategory,
      year: '2026',
    };

    const updated = [newItem, ...items];
    setItems(updated);
    onSaveWorks(updated);

    setNewTitle('');
    setNewDesc('');
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((it) => it.id !== id);
    setItems(updated);
    onSaveWorks(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#1F1C24] border border-white/15 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Prototype Banner Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#16131a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFB86B]/20 text-[#FFB86B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif-cormorant font-semibold text-white">
                {t.adminTitle}
              </h3>
              <p className="text-xs text-white/50">
                Client-side prototype interface for local previewing and gallery drafting
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Prototype Security Disclaimer */}
        <div className="px-6 py-3 bg-[#FFB86B]/10 border-b border-[#FFB86B]/20 flex items-center gap-3 text-xs text-white/80">
          <ShieldAlert className="w-4 h-4 text-[#FFB86B] flex-shrink-0" />
          <span>{t.adminPrototypeNote}</span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Add Item Form */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm uppercase tracking-wider text-[#FFB86B] font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>{t.addNewWork}</span>
            </h4>

            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/70 mb-1">Title / Название</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Работа 16 — Премиум Консоль"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Category / Категория</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#16131a] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                >
                  <option value="dresser">Dresser / Комод</option>
                  <option value="wardrobe">Wardrobe / Шкаф</option>
                  <option value="shelf">Shelving / Стеллаж</option>
                  <option value="custom">Custom Object</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-white/70 mb-1">Image Path / Image URL</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="images/1.jpeg"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-white/70 mb-1">Description / Описание</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Описание материалов и особенностей..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="btn-luxury btn-accent-luxury py-2.5 px-6 text-xs"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>{t.addNewWork}</span>
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Gallery */}
          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-wider text-white/80 font-semibold">
              Current Portfolio ({items.length} items)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                      <div className="text-xs text-white/50 truncate">{item.category}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    title={t.deleteWork}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end bg-[#16131a]">
          <button
            onClick={onClose}
            className="btn-luxury text-xs py-2 px-6"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
