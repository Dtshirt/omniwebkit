'use client';

import { createContext, useContext, useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const AnalyticsContext = createContext(null);

const AnalyticsTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
};

export const AnalyticsProvider = ({ children }) => {
  // Initialize Google Analytics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // Initialize gtag function
      window.gtag = window.gtag || function() {
        window.dataLayer.push(arguments);
      };
      
      // Set timestamp
      window.gtag('js', new Date());
      
      // Set default consent (GDPR compliant)
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        wait_for_update: 500,
      });

      // Check for existing consent
      const consent = localStorage.getItem('cookie-consent');
      if (consent) {
        try {
          const consentData = JSON.parse(consent);
          window.gtag('consent', 'update', {
            analytics_storage: consentData.analytics ? 'granted' : 'denied',
            ad_storage: consentData.advertising ? 'granted' : 'denied',
          });
        } catch (error) {
          console.error('Failed to parse consent data:', error);
        }
      }

      // Configure Google Analytics
      if (process.env.NEXT_PUBLIC_GA_ID) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    }
  }, []);

  const trackEvent = (eventName, parameters = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: parameters.category || 'engagement',
        event_label: parameters.label,
        value: parameters.value,
        ...parameters
      });
    }
  };

  const trackToolUsage = (toolName, action = 'used') => {
    trackEvent('tool_usage', {
      tool_name: toolName,
      action: action,
      category: 'tools',
      timestamp: new Date().toISOString()
    });
  };

  const trackUserEngagement = (action, details = {}) => {
    trackEvent('user_engagement', {
      engagement_action: action,
      ...details,
      category: 'engagement'
    });
  };

  const trackConversion = (type, value = 0) => {
    trackEvent('conversion', {
      conversion_type: type,
      conversion_value: value,
      category: 'conversion'
    });
  };

  const trackError = (error, context = {}) => {
    trackEvent('error', {
      error_message: error.message || error,
      error_context: JSON.stringify(context),
      category: 'error'
    });
  };

  const value = {
    trackEvent,
    trackToolUsage,
    trackUserEngagement,
    trackConversion,
    trackError
  };

  return (
    <AnalyticsContext.Provider value={value}>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
