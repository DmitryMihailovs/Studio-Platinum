import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Language } from '../types';

interface ResetPasswordViewProps {
  currentLanguage: Language;
  onBackToLogin: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ currentLanguage, onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    // Check if recovery session is established from hash / callback
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        // Listen for recovery event
        const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || session) {
            setSessionReady(true);
          }
        });
        return () => subscription.unsubscribe();
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = supabase;
    if (!client) return;
    setError(null);

    if (password.length < 6) {
      setError(
        currentLanguage === 'ru'
          ? 'Пароль должен содержать не менее 6 символов.'
          : currentLanguage === 'lv'
          ? 'Parolei jābūt vismaz 6 rakstzīmēm garai.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        currentLanguage === 'ru'
          ? 'Пароли не совпадают.'
          : currentLanguage === 'lv'
          ? 'Paroles nesakrīt.'
          : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await client.auth.updateUser({
        password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || (currentLanguage === 'ru' ? 'Не удалось обновить пароль.' : 'Failed to update password.'));
    } finally {
      setLoading(false);
    }
  };

  const copy = {
    ru: {
      title: 'Установка нового пароля',
      subtitle: 'Studio Platinum — Безопасный сброс доступа',
      newPass: 'Новый пароль',
      confirmPass: 'Подтвердите пароль',
      submitBtn: 'Обновить пароль',
      updating: 'Обновление...',
      successTitle: 'Пароль успешно изменен!',
      successDesc: 'Ваш доступ обновлен. Теперь вы можете войти в панель администратора с новым паролем.',
      loginLink: 'Перейти к входу в систему',
      noSession: 'Сессия восстановления не обнаружена или истекла. Пожалуйста, запросите новую ссылку сброса пароля.',
    },
    lv: {
      title: 'Jaunas paroles iestatīšana',
      subtitle: 'Studio Platinum — Droša piekļuves atjaunošana',
      newPass: 'Jaunā parole',
      confirmPass: 'Apstiprināt paroli',
      submitBtn: 'Atjaunināt paroli',
      updating: 'Atjaunina...',
      successTitle: 'Parole veiksmīgi nomainīta!',
      successDesc: 'Jūsu piekļuve ir atjaunināta. Tagad varat pieteikties administratora panelī ar jauno paroli.',
      loginLink: 'Atgriezties uz pieteikšanās lapu',
      noSession: 'Atkopšanas sesija nav atrasta vai tā ir beigusies. Lūdzu, pieprasiet jaunu paroles atiestatīšanas saiti.',
    },
    en: {
      title: 'Set New Password',
      subtitle: 'Studio Platinum — Secure Access Recovery',
      newPass: 'New Password',
      confirmPass: 'Confirm Password',
      submitBtn: 'Update Password',
      updating: 'Updating...',
      successTitle: 'Password Successfully Updated!',
      successDesc: 'Your access has been updated. You can now sign in to the administrator portal with your new password.',
      loginLink: 'Return to Sign In',
      noSession: 'Recovery session not detected or expired. Please request a new password reset link.',
    }
  }[currentLanguage] || {
    title: 'Set New Password',
    subtitle: 'Studio Platinum — Secure Access Recovery',
    newPass: 'New Password',
    confirmPass: 'Confirm Password',
    submitBtn: 'Update Password',
    updating: 'Updating...',
    successTitle: 'Password Successfully Updated!',
    successDesc: 'Your access has been updated. You can now sign in to the administrator portal with your new password.',
    loginLink: 'Return to Sign In',
    noSession: 'Recovery session not detected or expired. Please request a new password reset link.',
  };

  return (
    <div className="min-h-screen bg-[#110f13] text-[#E8E8E8] flex items-center justify-center p-4">
      <div className="bg-[#19161D] border border-white/15 rounded-[32px] max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB86B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB86B]/20 to-[#FFB86B]/5 border border-[#FFB86B]/30 flex items-center justify-center mx-auto text-[#FFB86B]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-serif-cormorant font-semibold text-white tracking-wide">
              {copy.title}
            </h3>
            <p className="text-xs text-white/60 uppercase tracking-wider font-light">
              {copy.subtitle}
            </p>
          </div>

          {success ? (
            <div className="space-y-6 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-white">{copy.successTitle}</h4>
                <p className="text-xs text-white/70 font-light leading-relaxed">{copy.successDesc}</p>
              </div>
              <button
                onClick={onBackToLogin}
                className="btn-luxury btn-accent-luxury w-full py-3.5 text-xs font-semibold cursor-pointer"
              >
                {copy.loginLink}
              </button>
            </div>
          ) : !isSupabaseConfigured ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              Supabase backend is not configured.
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5 text-left">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                  {copy.newPass}
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

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-white/80 font-medium">
                  {copy.confirmPass}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/15 focus:border-[#FFB86B] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-luxury btn-accent-luxury w-full py-4 text-xs font-semibold shadow-xl cursor-pointer"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#FFB86B] border-t-transparent" />
                  ) : (
                    <span>{copy.submitBtn}</span>
                  )}
                </span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs text-white/60 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{copy.loginLink}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
