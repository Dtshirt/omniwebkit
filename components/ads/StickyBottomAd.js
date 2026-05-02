// src/components/ads/StickyBottomAd.js - Mobile Sticky Ad
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AdBanner from './AdBanner';
import { useAds } from '@/hooks/useAds';

const StickyBottomAd = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { adsEnabled } = useAds();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!adsEnabled || !isMobile || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-1 z-10 p-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Close ad"
        >
          <X className="h-3 w-3" />
        </button>
        
        <AdBanner 
          slot={process.env.NEXT_PUBLIC_AD_SLOT_MOBILE_BOTTOM}
          size="mobile-banner"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default StickyBottomAd;
