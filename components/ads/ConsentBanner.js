'use client';

import { useState, useLayoutEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';

const ConsentBanner = () => {
  // Use null = unknown (SSR), true = show, false = hide
  // This avoids the delayed setState that causes a late LCP paint
  const [showBanner, setShowBanner] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    advertising: false,
    functional: false
  });

  // useLayoutEffect fires synchronously before browser paints.
  // This means the banner either renders immediately or not at all —
  // no late "pop-in" that Chrome records as a new LCP candidate.
  useLayoutEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (_) {}
      setShowBanner(false);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      analytics: true,
      advertising: true,
      functional: true
    };

    localStorage.setItem('cookie-consent', JSON.stringify(allPreferences));
    setPreferences(allPreferences);
    setShowBanner(false);

    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    }
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);

    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_storage: preferences.advertising ? 'granted' : 'denied'
      });
    }
  };

  const handleReject = () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      advertising: false,
      functional: false
    };

    localStorage.setItem('cookie-consent', JSON.stringify(minimalPreferences));
    setPreferences(minimalPreferences);
    setShowBanner(false);

    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  };

  // null = SSR/unknown, don't paint anything (avoids LCP element from SSR HTML)
  // false = consent already given, skip rendering entirely
  if (showBanner !== true) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-soft-lg"
      // Exclude from LCP: fixed overlays shouldn't be LCP candidates,
      // but explicitly marking content-visibility helps some browsers.
      style={{ contentVisibility: 'auto' }}
    >
      <div className="container mx-auto">
        {!showSettings ? (
          /* Main Consent Banner */
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-start space-x-3 flex-1">
              <Cookie className="h-6 w-6 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  We use cookies
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.
                  You can customize your preferences or accept all cookies.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Customize</span>
              </button>

              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Reject All
              </button>

              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* Settings Panel */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">Necessary</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Required for basic site functionality</div>
                </div>
                <input type="checkbox" checked={preferences.necessary} disabled className="w-4 h-4 text-primary-600 rounded" />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">Analytics</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Help us improve our services</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">Advertising</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Personalized ads and content</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.advertising}
                  onChange={(e) => setPreferences(prev => ({ ...prev, advertising: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <div>
                  <div className="font-medium text-sm text-slate-900 dark:text-white">Functional</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Enhanced features and preferences</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Reject All
              </button>

              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentBanner;