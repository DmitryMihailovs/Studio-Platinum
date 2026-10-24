import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Save,
  Sparkles,
  Lock,
  LogOut,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Server
} from 'lucide-react';
import { PortfolioItem, TranslationSet } from '../types';
import { supabase, isSupabaseConfigured, fetchAllPortfolioAdmin, uploadPortfolioImage, fetchCategories, createCategory, updateCategory, deleteCategory, CategoryRecord } from '../lib/supabase';

interface AdminPanelProps {
  isOpen: boolean;
  works: PortfolioItem[];
  t: TranslationSet;
  onClose: () => void;
  onRefreshWorks: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  works,
  t,
  onClose,
  onRefreshWorks,
}) => {
  const [session, setSession] = useState<any>(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const [adminItems, setAdminItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'portfolio' | 'categories'>('portfolio');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);

  // Category form state
  const [catEditingId, setCatEditingId] = useState<string | null>(null);
  const [catId, setCatId] = useState('');
  const [catNameRu, setCatNameRu] = useState('');
  const [catNameLv, setCatNameLv] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catIcon, setCatIcon] = useState('Layers');
  const [catDisplayOrder, setCatDisplayOrder] = useState(0);
  const [catIsActive, setCatIsActive] = useState(true);

  const loadCategories = async () => {
    const cats = await fetchCategories();
    setCategories(cats);
  };


  // Form state for creating / editing detailed product info
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'dresser' | 'wardrobe' | 'shelf' | 'custom'>('dresser');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [mainMaterial, setMainMaterial] = useState('');
  const [finishColor, setFinishColor] = useState('');
  const [hardware, setHardware] = useState('');
  const [priceLabel, setPriceLabel] = useState('По запросу');
  const [availability, setAvailability] = useState('Изготовление на заказ (4–6 недель)');
  const [isPublished, setIsPublished] = useState(true);

  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          verifyAdminAccess(session);
        } else {
          setIsAdminAuthorized(null);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          verifyAdminAccess(session);
        } else {
          setIsAdminAuthorized(null);
          setAdminItems([]);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isOpen]);

  const verifyAdminAccess = async (userSession: any) => {
    if (!supabase || !userSession?.user?.email) {
      setIsAdminAuthorized(false);
      return;
    }
    setCheckingAdmin(true);
    try {
      const userEmail = userSession.user.email.trim().toLowerCase();
      // Check public.admin_users allowlist strictly with normalization and maybeSingle
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (error) {
        console.warn('Admin allowlist check error:', error.message, error.code);
        setIsAdminAuthorized(false);
      } else if (!data) {
        console.warn('Admin allowlist: email not found for:', userEmail);
        setIsAdminAuthorized(false);
      } else {
        setIsAdminAuthorized(true);
        loadAdminPortfolio();
        loadCategories();
      }
    } catch (err: any) {
      console.warn('Admin allowlist exception:', err?.message);
      setIsAdminAuthorized(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const loadAdminPortfolio = async () => {
    if (!supabase) return;
    setLoadingItems(true);
    const data = await fetchAllPortfolioAdmin();
    if (data) {
      setAdminItems(data);
    }
    setLoadingItems(false);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      const payload: CategoryRecord = {
        id: catId.trim().toLowerCase().replace(/\s+/g, '-'),
        name_ru: catNameRu,
        name_lv: catNameLv,
        name_en: catNameEn,
        icon: catIcon,
        is_active: catIsActive,
        display_order: catEditingId ? catDisplayOrder : categories.length + 1,
      };

      if (!payload.id || !payload.name_ru) {
        throw new Error('Category ID and Russian name are required.');
      }

      if (catEditingId) {
        const res = await updateCategory(catEditingId, payload);
        if (!res.success) throw new Error(res.error);
        setActionSuccess('Category updated successfully.');
      } else {
        const res = await createCategory(payload);
        if (!res.success) throw new Error(res.error);
        setActionSuccess('Category created successfully.');
      }

      resetCategoryForm();
      loadCategories();
    } catch (err: any) {
      setActionError(err.message || 'Category operation failed.');
    }
  };

  const resetCategoryForm = () => {
    setCatEditingId(null);
    setCatId('');
    setCatNameRu('');
    setCatNameLv('');
    setCatNameEn('');
    setCatIcon('Layers');
    setCatDisplayOrder(0);
    setCatIsActive(true);
  };

  const handleEditCategory = (cat: CategoryRecord) => {
    setCatEditingId(cat.id);
    setCatId(cat.id);
    setCatNameRu(cat.name_ru);
    setCatNameLv(cat.name_lv);
    setCatNameEn(cat.name_en);
    setCatIcon(cat.icon || 'Layers');
    setCatDisplayOrder(cat.display_order || 0);
    setCatIsActive(cat.is_active ?? true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setActionError(null);
    setActionSuccess(null);

    const res = await deleteCategory(id);
    if (!res.success) {
      setActionError(res.error || 'Failed to delete category.');
    } else {
      setActionSuccess('Category deleted successfully.');
      loadCategories();
    }
  };


  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !recoveryEmail.trim()) return;
    setRecoveryLoading(true);
    setRecoveryError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail.trim(), {
        redirectTo: new URL('/reset-password', window.location.origin).toString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      setRecoverySuccess(true);
    } catch (err: any) {
      setRecoveryError(err.message || 'Failed to send password recovery email.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
    } else if (data.session) {
      setSession(data.session);
      setEmail('');
      setPassword('');
      await verifyAdminAccess(data.session);
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setIsAdminAuthorized(null);
    setAdminItems([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setActionError('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setActionError(null);
    setActionSuccess(null);
    setUploadingImage(true);

    try {
      let finalImageUrl = imageUrl;

      if (selectedFile) {
        const uploadedUrl = await uploadPortfolioImage(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      if (!finalImageUrl && !editingId) {
        throw new Error('Image URL or file upload is required.');
      }

      const itemPayload = {
        title,
        description,
        full_description: fullDescription,
        category,
        image_url: finalImageUrl || imageUrl,
        dimensions,
        main_material: mainMaterial,
        finish_color: finishColor,
        hardware,
        price_label: priceLabel,
        availability,
        is_published: isPublished,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from('portfolio_items')
          .update(itemPayload)
          .eq('id', editingId);

        if (error) throw error;
        setActionSuccess('Portfolio item updated successfully with full specifications.');
      } else {
        const maxOrder = adminItems.length > 0 ? Math.max(...adminItems.map(i => i.display_order || 0)) + 1 : 0;
        const { error } = await supabase
          .from('portfolio_items')
          .insert({
            ...itemPayload,
            display_order: maxOrder,
          });

        if (error) throw error;
        setActionSuccess('New portfolio item created successfully.');
      }

      resetForm();
      loadAdminPortfolio();
      onRefreshWorks();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setFullDescription('');
    setCategory('dresser');
    setDimensions('');
    setMainMaterial('');
    setFinishColor('');
    setHardware('');
    setPriceLabel('По запросу');
    setAvailability('Изготовление на заказ (4–6 недель)');
    setIsPublished(true);
    setImageUrl('');
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setFullDescription(item.full_description || '');
    setCategory(item.category || 'dresser');
    setImageUrl(item.image_url || '');
    setImagePreview(item.image_url || '');
    setDimensions(item.dimensions || '');
    setMainMaterial(item.main_material || '');
    setFinishColor(item.finish_color || '');
    setHardware(item.hardware || '');
    setPriceLabel(item.price_label || 'По запросу');
    setAvailability(item.availability || 'Изготовление на заказ');
    setIsPublished(item.is_published ?? true);
    setSelectedFile(null);
  };

  const handleDeleteClick = async (id: string) => {
    if (!supabase || !window.confirm('Are you sure you want to delete this portfolio item?')) return;
    setActionError(null);

    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id);

    if (error) {
      setActionError(error.message);
    } else {
      setActionSuccess('Item deleted successfully.');
      loadAdminPortfolio();
      onRefreshWorks();
    }
  };

  const handleTogglePublish = async (item: any) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('portfolio_items')
      .update({ is_published: !item.is_published })
      .eq('id', item.id);

    if (error) {
      setActionError(error.message);
    } else {
      loadAdminPortfolio();
      onRefreshWorks();
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (!supabase) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= adminItems.length) return;

    const currentItem = adminItems[index];
    const targetItem = adminItems[targetIndex];

    const { error: err1 } = await supabase
      .from('portfolio_items')
      .update({ display_order: targetItem.display_order })
      .eq('id', currentItem.id);

    const { error: err2 } = await supabase
      .from('portfolio_items')
      .update({ display_order: currentItem.display_order })
      .eq('id', targetItem.id);

    if (err1 || err2) {
      setActionError('Failed to reorder items.');
    } else {
      loadAdminPortfolio();
      onRefreshWorks();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#19161D] border border-white/15 rounded-[32px] max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#121015] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFB86B]/20 text-[#FFB86B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif-cormorant font-semibold text-white">
                STUDIO PLATINUM — SECURE ADMIN PORTAL
              </h3>
              <p className="text-xs text-white/50">
                {isSupabaseConfigured
                  ? session
                    ? `Authenticated as ${session.user.email}`
                    : 'Client IT Web / Area IT Authentication Gate'
                  : 'Backend Configuration Required'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
          {!isSupabaseConfigured ? (
            <div className="max-w-2xl mx-auto py-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Server className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-serif-cormorant font-semibold text-white">
                  Backend Authentication & Database Required
                </h4>
                <p className="text-sm text-white/70 font-light leading-relaxed max-w-lg mx-auto">
                  The client's hosting environment (Area IT / IT Web) requires a configured backend service for secure authentication and persistent database storage.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-4">
                <div className="text-xs uppercase tracking-wider text-[#FFB86B] font-semibold">
                  Required Environment Variables:
                </div>
                <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-amber-300 space-y-1">
                  <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=your-supabase-anon-key</div>
                </div>
              </div>

              <div className="pt-4">
                <a href="/" className="btn-luxury btn-accent-luxury text-xs py-3 px-8">
                  Return to Public Website
                </a>
              </div>
            </div>
          ) : checkingAdmin ? (
            <div className="max-w-md mx-auto py-16 space-y-6 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#FFB86B] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs uppercase tracking-wider text-white/70">Verifying administrator authorization...</p>
            </div>
          ) : session && isAdminAuthorized === false ? (
            <div className="max-w-md mx-auto py-12 space-y-6 text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-serif-cormorant font-semibold text-white">
                  Access Denied
                </h4>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  The authenticated account (<span className="text-[#FFB86B] font-mono">{session.user.email}</span>) is not authorized in the <code className="text-white font-mono">public.admin_users</code> allowlist.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
                <div className="text-[11px] uppercase tracking-wider text-white/60 font-medium">To grant administrator access in Supabase SQL Editor:</div>
                <pre className="text-[10px] bg-black/50 p-3 rounded-xl text-amber-300 font-mono overflow-x-auto">
{`INSERT INTO public.admin_users (email)
VALUES ('${session.user.email}')
ON CONFLICT (email) DO NOTHING;`}
                </pre>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleLogout}
                  className="btn-luxury text-xs py-3 px-6 cursor-pointer"
                >
                  Sign Out & Try Another Account
                </button>
              </div>
            </div>
          ) : !session ? (
            <div className="max-w-md mx-auto py-10 space-y-8 text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB86B]/20 to-[#FFB86B]/5 border border-[#FFB86B]/30 flex items-center justify-center mx-auto text-[#FFB86B] shadow-2xl">
                <Lock className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="text-3xl font-serif-cormorant font-semibold text-white tracking-wide">
                  {isForgotPasswordMode ? 'Password Recovery' : 'Administrator Portal'}
                </h4>
                <p className="text-xs text-white/60 font-light tracking-wider uppercase">
                  {isForgotPasswordMode ? 'Studio Platinum Secure Reset' : 'Studio Platinum Secure Access'}
                </p>
              </div>

              {isForgotPasswordMode ? (
                <div className="space-y-6 text-left">
                  {recoverySuccess ? (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-3">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Recovery instructions sent! Check your email inbox.</span>
                      </div>
                      <p className="text-white/70 font-light">
                        We have sent a secure password reset link to <span className="text-[#FFB86B] font-mono">{recoveryEmail}</span>.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setIsForgotPasswordMode(false); setRecoverySuccess(false); setRecoveryEmail(''); }}
                        className="btn-luxury text-xs py-2.5 px-6 w-full mt-2 cursor-pointer"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordRecovery} className="space-y-5">
                      {recoveryError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span>{recoveryError}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                          Administrator Email
                        </label>
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="admin@studioplatinum.lv"
                          className="w-full bg-white/5 border border-white/15 focus:border-[#FFB86B] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={recoveryLoading}
                        className="btn-luxury btn-accent-luxury w-full py-4 text-xs font-semibold shadow-xl cursor-pointer"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {recoveryLoading ? (
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#FFB86B] border-t-transparent" />
                          ) : (
                            <span>Send Recovery Link</span>
                          )}
                        </span>
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => { setIsForgotPasswordMode(false); setRecoveryError(null); }}
                          className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                        >
                          Cancel & Return to Sign In
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  {authError && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-left flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5 text-left">
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                        Administrator Email / Username
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@studioplatinum.lv"
                        className="w-full bg-white/5 border border-white/15 focus:border-[#FFB86B] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                        Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white/5 border border-white/15 focus:border-[#FFB86B] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end text-xs pt-0.5">
                      <button
                        type="button"
                        onClick={() => { setIsForgotPasswordMode(true); setAuthError(null); }}
                        className="text-[#FFB86B] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="btn-luxury btn-accent-luxury w-full py-4 text-xs font-semibold shadow-xl cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {authLoading ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#FFB86B] border-t-transparent" />
                        ) : (
                          <span>Sign In to Dashboard</span>
                        )}
                      </span>
                    </button>
                  </form>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorized Administrator Session Active</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {actionError}
                </div>
              )}

              {actionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  {actionSuccess}
                </div>
              )}

              {/* Tab Switcher */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('portfolio')}
                  className={`text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'portfolio' ? 'bg-[#FFB86B]/20 text-[#FFB86B] font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Portfolio Items ({adminItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className={`text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'categories' ? 'bg-[#FFB86B]/20 text-[#FFB86B] font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Manage Categories ({categories.length})
                </button>
              </div>

              {activeTab === 'categories' ? (
                <div className="space-y-8 animate-fadeIn">
                  {/* Category Create/Edit Form */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                    <h4 className="text-sm uppercase tracking-wider text-[#FFB86B] font-semibold flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>{catEditingId ? 'Edit Category' : 'Create New Category'}</span>
                    </h4>

                    <form onSubmit={handleSaveCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Category ID / Slug (e.g. kitchens, beds) *</label>
                        <input
                          type="text"
                          value={catId}
                          onChange={(e) => setCatId(e.target.value)}
                          disabled={Boolean(catEditingId)}
                          placeholder="kitchens"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B] disabled:opacity-50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Icon (Layers, PackageOpen, Columns3, Sparkles, Box, Home, Armchair, Lamp, Bed, Tv)</label>
                        <input
                          type="text"
                          value={catIcon}
                          onChange={(e) => setCatIcon(e.target.value)}
                          placeholder="Layers"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Name (Russian / Русский) *</label>
                        <input
                          type="text"
                          value={catNameRu}
                          onChange={(e) => setCatNameRu(e.target.value)}
                          placeholder="Кухни"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Name (Latvian / Latviski) *</label>
                        <input
                          type="text"
                          value={catNameLv}
                          onChange={(e) => setCatNameLv(e.target.value)}
                          placeholder="Virtuves"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Name (English) *</label>
                        <input
                          type="text"
                          value={catNameEn}
                          onChange={(e) => setCatNameEn(e.target.value)}
                          placeholder="Kitchens"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Display Order</label>
                        <input
                          type="number"
                          value={catDisplayOrder}
                          onChange={(e) => setCatDisplayOrder(parseInt(e.target.value) || 0)}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={catIsActive}
                            onChange={(e) => setCatIsActive(e.target.checked)}
                            className="rounded border-white/20 bg-white/5 text-[#FFB86B] focus:ring-0"
                          />
                          <span>Active Category (Visible on public website)</span>
                        </label>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
                        {catEditingId && (
                          <button
                            type="button"
                            onClick={resetCategoryForm}
                            className="btn-luxury text-xs py-2.5 px-6 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="btn-luxury btn-accent-luxury py-3 px-8 text-xs font-semibold cursor-pointer"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            <span>{catEditingId ? 'Save Category Changes' : 'Create Category'}</span>
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Categories List */}
                  <div className="space-y-4">
                    <h4 className="text-sm uppercase tracking-wider text-white/80 font-semibold">
                      Manage Dynamic Categories ({categories.length})
                    </h4>

                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[#FFB86B]/15 border border-[#FFB86B]/30 flex items-center justify-center text-[#FFB86B] font-mono text-xs font-bold">
                              {cat.display_order}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                                <span>{cat.name_ru} / {cat.name_en}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono">ID: {cat.id}</span>
                                {!cat.is_active && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 uppercase tracking-widest font-mono">Inactive</span>
                                )}
                              </div>
                              <div className="text-xs text-white/50 truncate">LV: {cat.name_lv} • Icon: {cat.icon}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditCategory(cat)}
                              className="p-2.5 text-[#FFB86B] hover:bg-[#FFB86B]/10 rounded-xl transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-fadeIn">
                  {/* Comprehensive Product Editor Form */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
                    <h4 className="text-sm uppercase tracking-wider text-[#FFB86B] font-semibold flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>{editingId ? 'Edit Product & Specifications' : t.addNewWork}</span>
                    </h4>

                    <form onSubmit={handleSaveItem} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-white/70 mb-1.5">Product Title / Название изделия *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Авторский комод из мореного дуба"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Category / Категория</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as any)}
                          className="w-full bg-[#16131a] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name_ru} / {cat.name_en} ({cat.id})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Publication Status</label>
                        <div className="flex items-center gap-4 pt-3">
                          <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPublished}
                              onChange={(e) => setIsPublished(e.target.checked)}
                              className="rounded border-white/20 bg-white/5 text-[#FFB86B] focus:ring-0"
                            />
                            <span>Published on Public Website</span>
                          </label>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs text-white/70 mb-1.5">Cover Image (Upload or URL)</label>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-xs text-white/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FFB86B]/20 file:text-[#FFB86B] hover:file:bg-[#FFB86B]/30 cursor-pointer bg-white/5 border border-white/15 rounded-xl"
                          />
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="or images/1.jpeg / https://..."
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                          />
                        </div>
                        {imagePreview && (
                          <div className="mt-3 flex items-center gap-3">
                            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-white/20" />
                            <span className="text-xs text-white/60">Image ready for save</span>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs text-white/70 mb-1.5">Short Description / Краткое описание</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Краткое описание для карточки в каталоге..."
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs text-white/70 mb-1.5">Full Product Description / Полное описание</label>
                        <textarea
                          value={fullDescription}
                          onChange={(e) => setFullDescription(e.target.value)}
                          rows={3}
                          placeholder="Подробное описание изделия, мастерства и эксклюзивных деталей..."
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Dimensions / Габариты (Ш×В×Г)</label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="1400 × 850 × 500 мм"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Main Material / Основной материал</label>
                        <input
                          type="text"
                          value={mainMaterial}
                          onChange={(e) => setMainMaterial(e.target.value)}
                          placeholder="Массив мореного дуба"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Finish & Color / Отделка и покрытие</label>
                        <input
                          type="text"
                          value={finishColor}
                          onChange={(e) => setFinishColor(e.target.value)}
                          placeholder="Масло-воск, матовая латунь"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Hardware / Фурнитура и механизмы</label>
                        <input
                          type="text"
                          value={hardware}
                          onChange={(e) => setHardware(e.target.value)}
                          placeholder="Blum Movento с доводчиком"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Price Label / Стоимость</label>
                        <input
                          type="text"
                          value={priceLabel}
                          onChange={(e) => setPriceLabel(e.target.value)}
                          placeholder="По запросу / €2,450"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 mb-1.5">Availability / Сроки изготовления</label>
                        <input
                          type="text"
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          placeholder="Изготовление на заказ (4–6 недель)"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FFB86B]"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
                        {editingId && (
                          <button
                            type="button"
                            onClick={resetForm}
                            className="btn-luxury text-xs py-2.5 px-6 cursor-pointer"
                          >
                            {t.cancel}
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={uploadingImage}
                          className="btn-luxury btn-accent-luxury py-3 px-8 text-xs font-semibold cursor-pointer"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            <span>{uploadingImage ? 'Uploading...' : editingId ? t.saveChanges : t.addNewWork}</span>
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Portfolio List Manager */}
                  <div className="space-y-4">
                    <h4 className="text-sm uppercase tracking-wider text-white/80 font-semibold">
                      Manage Persistent Portfolio Items ({adminItems.length})
                    </h4>

                    {loadingItems ? (
                      <p className="text-xs text-white/50 text-center py-8">Loading portfolio from Supabase...</p>
                    ) : (
                      <div className="space-y-3">
                        {adminItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 gap-4"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                                  <span>{item.title}</span>
                                  {!item.is_published && (
                                    <span className="text-[10px] px-2.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 uppercase tracking-widest font-mono">Draft</span>
                                  )}
                                </div>
                                <div className="text-xs text-white/50 truncate capitalize">Category: {item.category} • {item.dimensions || 'Custom'}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(index, 'up')}
                                disabled={index === 0}
                                className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl disabled:opacity-30 transition-colors cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(index, 'down')}
                                disabled={index === adminItems.length - 1}
                                className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl disabled:opacity-30 transition-colors cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(item)}
                                className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                                title={item.is_published ? 'Unpublish' : 'Publish'}
                              >
                                {item.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-yellow-400" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditClick(item)}
                                className="p-2.5 text-[#FFB86B] hover:bg-[#FFB86B]/10 rounded-xl transition-colors cursor-pointer"
                                title={t.editWork}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(item.id)}
                                className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                                title={t.deleteWork}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex justify-end bg-[#121015] flex-shrink-0">
          <button
            onClick={onClose}
            className="btn-luxury text-xs py-2.5 px-8 cursor-pointer"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
