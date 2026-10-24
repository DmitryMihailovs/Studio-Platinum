import { createClient } from '@supabase/supabase-js';
import { PortfolioItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database Helper Functions with Graceful Fallbacks

export async function fetchPublishedPortfolio(): Promise<PortfolioItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      image: row.image_url || (row.images && row.images[0]) || '',
      images: row.images || (row.image_url ? [row.image_url] : []),
      title: row.title,
      description: row.description || '',
      fullDescription: row.full_description || '',
      category: row.category || 'dresser',
      year: row.year || '2026',
      materials: row.materials || [],
      dimensions: row.dimensions || '',
      width: row.width || '',
      height: row.height || '',
      depth: row.depth || '',
      mainMaterial: row.main_material || '',
      finishColor: row.finish_color || '',
      hardware: row.hardware || '',
      priceLabel: row.price_label || '',
      availability: row.availability || '',
      isPublished: row.is_published ?? true,
      displayOrder: row.display_order ?? 0,
    }));
  } catch (err) {
    console.warn('Supabase connection exception:', err);
    return null;
  }
}

export async function fetchAllPortfolioAdmin(): Promise<any[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('Supabase admin fetch error:', error.message);
      return null;
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase admin fetch exception:', err);
    return null;
  }
}

export async function uploadPortfolioImage(file: File): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err: any) {
    console.error('Image upload failed:', err.message);
    throw err;
  }
}

export async function uploadInquiryAttachment(file: File): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `inquiries/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('inquiry-attachments')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    return filePath;
  } catch (err: any) {
    console.error('Inquiry attachment upload failed:', err.message);
    throw err;
  }
}

export async function getInquiryAttachmentSignedUrl(filePath: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.storage
      .from('inquiry-attachments')
      .createSignedUrl(filePath, 3600);

    if (error || !data) {
      throw new Error(error?.message || 'Failed to generate signed URL');
    }

    return data.signedUrl;
  } catch (err: any) {
    console.error('Failed to create signed URL:', err.message);
    return null;
  }
}

export async function submitInquiry(inquiryData: {
  full_name: string;
  email?: string;
  phone?: string;
  furniture_type?: string;
  description: string;
  budget?: string;
  preferred_contact?: string;
  image_url?: string;
  images?: string[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!supabase) {
    return { success: true, id: 'mock-' + Date.now() };
  }
  try {
    const { data, error } = await supabase.from('inquiries').insert([inquiryData]).select().single();
    if (error) {
      console.warn('Inquiry insert error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.warn('Inquiry insert exception:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export interface CategoryRecord {
  id: string;
  name_ru: string;
  name_lv: string;
  name_en: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

export async function fetchCategories(): Promise<CategoryRecord[]> {
  const defaultCategories: CategoryRecord[] = [
    { id: 'console', name_ru: 'Консоль / Сервант', name_lv: 'Konsole / Sānu skapis', name_en: 'Console / Sideboard', icon: 'Columns3', is_active: true, display_order: 1 },
    { id: 'kitchen', name_ru: 'Кухня', name_lv: 'Virtuve', name_en: 'Kitchen', icon: 'Home', is_active: true, display_order: 2 },
    { id: 'wardrobe', name_ru: 'Шкафы / Гардеробная', name_lv: 'Skapji / Walk-in garderobe', name_en: 'Wardrobe / Walk-in Closet', icon: 'PackageOpen', is_active: true, display_order: 3 },
    { id: 'bathroom', name_ru: 'Мебель для ванной', name_lv: 'Vannas istabas mēbeles', name_en: 'Bathroom Furniture', icon: 'Lamp', is_active: true, display_order: 4 },
    { id: 'custom', name_ru: 'Другой проект', name_lv: 'Cits projekts', name_en: 'Other Custom Project', icon: 'Sparkles', is_active: true, display_order: 5 },
  ];

  if (!supabase) {
    return defaultCategories;
  }
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultCategories;
    }
    return data;
  } catch (err) {
    return defaultCategories;
  }
}

export async function createCategory(cat: CategoryRecord): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { error } = await supabase.from('categories').insert([cat]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCategory(id: string, cat: Partial<CategoryRecord>): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { error } = await supabase.from('categories').update(cat).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { count, error: countError } = await supabase
      .from('portfolio_items')
      .select('*', { count: 'exact', head: true })
      .eq('category', id);

    if (count && count > 0) {
      return { success: false, error: `Cannot delete category: ${count} portfolio item(s) are currently assigned to it.` };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}



