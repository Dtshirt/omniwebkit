
// src/utils/analytics.js - Enhanced Analytics
export class Analytics {
  static trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: parameters.category || 'engagement',
        event_label: parameters.label,
        value: parameters.value,
        ...parameters
      });
    }
    
    // Also track with Mixpanel if available
    if (typeof mixpanel !== 'undefined') {
      mixpanel.track(eventName, parameters);
    }
  }

  static trackToolUsage(toolName, action = 'used') {
    this.trackEvent('tool_usage', {
      tool_name: toolName,
      action: action,
      category: 'tools',
      timestamp: new Date().toISOString()
    });
  }

  static trackPageView(pagePath, pageTitle) {
    if (typeof gtag !== 'undefined') {
      gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath
      });
    }
  }

  static trackUserEngagement(action, details = {}) {
    this.trackEvent('user_engagement', {
      engagement_action: action,
      ...details,
      category: 'engagement'
    });
  }

  static trackConversion(type, value = 0) {
    this.trackEvent('conversion', {
      conversion_type: type,
      conversion_value: value,
      category: 'conversion'
    });
  }

  static trackError(error, context = {}) {
    this.trackEvent('error', {
      error_message: error.message || error,
      error_context: JSON.stringify(context),
      category: 'error'
    });
  }
}

