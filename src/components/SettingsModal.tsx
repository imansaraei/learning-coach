import React, { useState } from 'react';
import { X, Check, Sparkles, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface border border-[#232B3B] rounded p-6 shadow-modal-elevation relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#232B3B] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-surface-low border border-petronas-primary/40 text-petronas-secondary flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-silver-platinum uppercase tracking-wider">
                SYSTEM CONFIGURATION // API TELEMETRY
              </h3>
              <p className="font-mono text-[10px] text-silver-graphite">
                ZERO-COST ARCHITECTURE MONITOR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-silver-graphite hover:text-white hover:bg-surface-high transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cost & Architecture Spec */}
        <div className="bg-surface-low border border-[#232B3B] rounded p-3.5 text-xs space-y-2 mb-4 font-mono">
          <div className="flex items-center gap-1.5 text-petronas-secondary font-bold text-[11px] uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI STUDIO FREE TIER (1,500 RPD // $0.00 COST)</span>
          </div>
          <p className="text-silver-aero leading-relaxed text-[11px] font-vazir">
            طرح رایگان Google AI Studio روزانه <strong>۱۵۰۰ درخواست رایگان</strong> (1,500 RPD) و ۱۵ درخواست در دقیقه در اختیارتان می‌گذارد که برای ۳۰۰ جلسه کامل کافیست. اسکیما JSON به صورت نیتیو بدون خطا اجرا می‌شود.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-petronas-tertiary">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-vazir">در صورت نبود کلید، موتور هوشمند محلی بدون وقفه فعال است.</span>
          </div>
        </div>

        {/* API Key Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-silver-platinum mb-1.5 uppercase">
              GOOGLE GEMINI API KEY (OPTIONAL):
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-canvas border border-[#232B3B] focus:border-petronas-secondary focus:ring-1 focus:ring-petronas-secondary rounded px-3 py-2 text-xs text-silver-platinum placeholder:text-silver-graphite focus:outline-none font-mono dir-ltr text-left"
            />
            <div className="flex items-center justify-between mt-2 font-mono text-[10px] text-silver-graphite">
              <span>LOCALSTORAGE ONLY // NEVER TRANSMITTED</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-petronas-secondary hover:underline"
              >
                <span>GET FREE KEY</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-silver-graphite hover:text-white px-3 py-1.5 rounded"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-petronas-primary hover:bg-petronas-secondary text-canvas font-bold px-4 py-1.5 rounded text-xs border border-petronas-secondary shadow-petronas-btn transition"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-canvas" />
                  <span>SAVED!</span>
                </>
              ) : (
                <span>SAVE CONFIG</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
