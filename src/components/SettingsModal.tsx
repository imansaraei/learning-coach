import React, { useState } from 'react';
import { X, Key, Check, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">تنظیمات هوش مصنوعی و کلید API</h3>
              <p className="text-xs text-slate-400">پیکربندی مدل و معماری هزینه صفر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison / Cost Explainer */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 mb-5">
          <div className="flex items-center gap-1.5 text-teal-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>چرا Gemini 2.5 Flash در Google AI Studio؟ (هزینه کاملاً $0)</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            طرح رایگان گوگل (Google AI Studio) روزانه <strong>۱۵۰۰ درخواست رایگان</strong> (1,500 RPD) و ۱۵ درخواست در دقیقه در اختیارتان می‌گذارد که برای ۳۰۰ جلسه کامل کافیست. برخلاف مدل‌های اوپن‌سورس در OpenRouter، مدل Gemini پشتیبانی نیتیو از JSON Schema بدون خطا دارد و در زبان فارسی بسیار قوی‌تر است.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>بدون کلید هم سیستم در حالت هوشمند محلی به صورت ۱۰۰٪ رایگان کار می‌کند.</span>
          </div>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              کلید Google Gemini API (اختیاری):
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono dir-ltr text-left"
            />
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
              <span>کلید فقط در مرورگر شما (localStorage) نگهداری می‌شود.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-teal-400 hover:underline"
              >
                <span>دریافت رایگان کلید</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-950" />
                  <span>ذخیره شد!</span>
                </>
              ) : (
                <span>ذخیره تنظیمات</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
