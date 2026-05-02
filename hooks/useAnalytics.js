'use client';

import { useAnalytics as useAnalyticsContext } from '@/components/providers/AnalyticsProvider';

export const useAnalytics = () => {
  const analytics = useAnalyticsContext();
  
  // Enhanced tracking functions
  const trackToolUsage = (toolName, action = 'used', additionalData = {}) => {
    analytics.trackToolUsage(toolName, action);
    
    // Also track to custom endpoint for detailed analytics
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'tool_usage',
          data: {
            tool: toolName,
            action,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ...additionalData
          }
        })
      }).catch(error => {
        console.error('Analytics API error:', error);
      });
    }
  };

  const trackPageView = (pagePath, pageTitle) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: pageTitle || document.title,
        page_location: window.location.href,
        page_path: pagePath || window.location.pathname,
      });
    }
  };

  const trackDownload = (fileName, fileType) => {
    analytics.trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType,
      category: 'downloads'
    });
  };

  const trackShare = (platform, content) => {
    analytics.trackEvent('content_share', {
      platform,
      content,
      category: 'sharing'
    });
  };

  return {
    ...analytics,
    trackToolUsage,
    trackPageView,
    trackDownload,
    trackShare
  };
};