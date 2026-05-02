
// src/components/ads/AdBlockerNotice.js - Ad Blocker Detection
'use client';

import { useState, useEffect } from 'react';
import { Shield, Coffee, Heart, X } from 'lucide-react';
import { AdManager } from '@/utils/adManager';

const AdBlockerNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    AdManager.isAdBlockerActive().then((isBlocked) => {
      if (isBlocked && !localStorage.getItem('adblocker-notice-dismissed')) {
        setIsVisible(true);
      }
    });
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('adblocker-notice-dismissed', 'true');
  };

  const handleSupport = () => {
    window.dispatchEvent(new CustomEvent('open-donate-modal'));
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-soft-lg p-4 z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Shield className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white mb-1">
            Ad Blocker Detected
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            We keep our tools free through ads. Consider supporting us to keep improving!
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleSupport}
              className="flex items-center space-x-1 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Heart className="h-3 w-3" />
              <span>Support Us</span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-1.5 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBlockerNotice;
