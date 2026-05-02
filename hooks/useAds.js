
// src/hooks/useAds.js - Custom Hook for Ad Management
import { useState, useEffect } from 'react';
import { AdManager } from '@/utils/adManager';

export const useAds = () => {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check if ads should be shown
    const shouldShow = AdManager.shouldShowAds();
    setAdsEnabled(shouldShow);
    setConsentGiven(AdManager.getConsentStatus().advertising);

    // Detect ad blocker
    AdManager.isAdBlockerActive().then(setAdBlockerDetected);

    // Initialize ads if consent is given
    if (shouldShow) {
      AdManager.initializeAds();
    }
  }, []);

  return {
    adsEnabled,
    adBlockerDetected,
    consentGiven,
    trackAdView: AdManager.trackAdView,
    trackAdClick: AdManager.trackAdClick
  };
};