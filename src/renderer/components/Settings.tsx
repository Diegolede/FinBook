/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import React, { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../utils/i18n';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      className="fixed -top-1 -left-1 -right-1 -bottom-1 w-[calc(100%+2px)] h-[calc(100%+2px)] bg-[#0f0f0f] bg-opacity-50 flex items-center justify-center z-[9999] m-0 p-0"
      role="dialog"
      aria-modal="true"
      style={{ margin: 0, padding: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">{t.settings.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.common.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t.settings.language}
            </label>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setLanguage('es');
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  language === 'es'
                    ? 'border-gray-900 bg-gray-100 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{t.settings.spanish}</span>
                  {language === 'es' && (
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  setLanguage('en');
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  language === 'en'
                    ? 'border-gray-900 bg-gray-100 shadow-md'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{t.settings.english}</span>
                  {language === 'en' && (
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t.dashboard.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

