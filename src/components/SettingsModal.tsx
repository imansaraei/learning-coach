import React, { useState } from 'react';
import { X, Check, Sparkles, ExternalLink, ShieldCheck, Feather } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-dim/85 backdrop-blur-md animate-in fade-in duration-150 overscroll-contain">
      <div className="w-full max-w-lg bg-surface-container border border-outline-variant/60 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-garamond font-bold text-on-surface">
                تنظیمات هوش مصنوعی و کلید API
              </h3>
              <p className="font-sans text-xs text-secondary">
                پیکربندی هوش مصنوعی و ردیابی هزینه صفر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cost & Architecture Info */}
        <div className="bg-surface-container-lowest/80 border border-outline-variant/40 rounded-2xl p-4 text-xs space-y-2 mb-5 font-vazir">
          <div className="flex items-center gap-1.5 text-primary font-bold text-sm font-garamond">
            <Sparkles className="w-4 h-4" />
            <span>طرح رایگان Google AI Studio (هزینه کاملاً $0.00)</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed text-xs">
            طرح رایگان گوگل روزانه <strong>۱۵۰۰ درخواست رایگان</strong> در اختیارتان می‌گذارد که برای ۳۰۰ جلسه کامل کافیست. اسکیما خروجی ساختاریافته بدون خطای توکن تولید می‌شود.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span>حتی بدون کلید، موتور هوشمند محلی به صورت ۱۰۰٪ رایگان فعال است.</span>
          </div>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSave} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5 font-vazir">
              کلید Google Gemini API (اختیاری):
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none font-mono dir-ltr text-left"
            />
            <div className="flex items-center justify-between mt-2 text-[11px] text-outline">
              <span>کلید فقط در مرورگر شما ذخیره می‌شود.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline font-vazir"
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
              className="text-xs text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-full active:scale-[0.96] transition-[transform,color] duration-150 ease-out"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold px-5 py-2 rounded-full text-xs shadow-md active:scale-[0.96] transition-[transform,filter] duration-150 ease-out hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
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
