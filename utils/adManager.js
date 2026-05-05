// src/utils/adManager.js - Ad Management Utilities
export class AdManager {
  static isAdBlockerActive() {
    // Simple ad blocker detection
    return new Promise((resolve) => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-10000px';
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        const isBlocked = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);
        resolve(isBlocked);
      }, 100);
    });
  }

  static trackAdView(adSlot, adSize) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ad_impression', {
        ad_slot: adSlot,
        ad_size: adSize,
        event_category: 'advertising'
      });
    }
  }

  static trackAdClick(adSlot, adSize) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'ad_click', {
        ad_slot: adSlot,
        ad_size: adSize,
        event_category: 'advertising'
      });
    }
  }

  static getAdSlotId(slotName) {
    const slots = {
      'top-banner': process.env.NEXT_PUBLIC_AD_SLOT_TOP_BANNER,
      'sidebar-left': process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_LEFT,
      'sidebar-right': process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR_RIGHT,
      'in-content': process.env.NEXT_PUBLIC_AD_SLOT_IN_CONTENT,
      'bottom-content': process.env.NEXT_PUBLIC_AD_SLOT_BOTTOM_CONTENT,
      'mobile-bottom': process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_BOTTOM
    };
    return slots[slotName] || '0000000000';
  }

  static shouldShowAds() {
    // Disable ads completely for now as requested
    return false;
  }

  static getConsentStatus() {
    if (typeof window === 'undefined') return { advertising: false };
    
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) return { advertising: false };
    
    try {
      return JSON.parse(consent);
    } catch {
      return { advertising: false };
    }
  }

  static initializeAds() {
    if (!this.shouldShowAds()) return;
    
    // Initialize Google AdSense
    if (typeof window !== 'undefined' && !window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4969619104257736';
      script.async = true;
      script.setAttribute('data-ad-client', process.env.NEXT_PUBLIC_ADSENSE_ID);
      document.head.appendChild(script);
      
      window.adsbygoogle = window.adsbygoogle || [];
    }
  }
}


