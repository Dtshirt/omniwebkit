'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

const AdBanner = ({
  slot,
  size = 'rectangle',
  className = '',
  title = '',
  showClose = false,
  onClose
}) => {
  const adRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);

  // Ad size configurations
  const adSizes = {
    'leaderboard': { width: 728, height: 90, responsive: true },
    'rectangle': { width: 300, height: 250, responsive: true },
    'skyscraper': { width: 160, height: 600, responsive: false },
    'mobile-banner': { width: 320, height: 50, responsive: true },
    'large-rectangle': { width: 336, height: 280, responsive: true },
    'banner': { width: 468, height: 60, responsive: true }
  };

  const adConfig = adSizes[size] || adSizes.rectangle;

  // Initialize Google AdSense
  useEffect(() => {
    if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (error) {
        console.error('AdSense error:', error);
        setAdLoaded(true);
      }
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  // Demo/Fallback ad content
  const demoAds = {
    'leaderboard': {
      title: 'Boost Your Development',
      description: 'Professional developer tools and resources',
      cta: 'Learn More',
      gradient: 'from-primary-500 to-primary-700'
    },
    'rectangle': {
      title: 'Premium Tools',
      description: 'Upgrade your workflow with pro features',
      cta: 'Try Free',
      gradient: 'from-emerald-500 to-primary-600'
    },
    'skyscraper': {
      title: 'Design\nResources',
      description: 'Stock photos, icons & more',
      cta: 'Browse',
      gradient: 'from-violet-500 to-primary-600'
    },
    'mobile-banner': {
      title: 'App Tools',
      description: 'Mobile development made easy',
      cta: 'Download',
      gradient: 'from-amber-500 to-orange-500'
    }
  };

  const demoAd = demoAds[size] || demoAds.rectangle;

  return (
    <div
      className={`ad-container ${className} ${adConfig.responsive ? 'w-full' : ''}`}
      style={{
        maxWidth: adConfig.responsive ? `${adConfig.width}px` : undefined,
        minHeight: `${adConfig.height}px`
      }}
    >
      {title && (
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2 uppercase tracking-wide">
          {title}
        </div>
      )}

      <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {/* Close button */}
        {showClose && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 p-1 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Close ad"
          >
            <X className="h-3 w-3 text-slate-600 dark:text-slate-400" />
          </button>
        )}

        {/* Google AdSense Ad */}
        {process.env.NEXT_PUBLIC_ADSENSE_ID ? (
          <ins
            ref={adRef}
            className="adsbygoogle block"
            style={{
              display: 'block',
              width: adConfig.responsive ? '100%' : `${adConfig.width}px`,
              height: `${adConfig.height}px`
            }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
            data-ad-slot={slot}
            data-ad-format={adConfig.responsive ? 'auto' : undefined}
            data-full-width-responsive={adConfig.responsive ? 'true' : 'false'}
          />
        ) : (
          /* Demo/Fallback Ad */
          <div
            className={`w-full h-full bg-gradient-to-r ${demoAd.gradient} p-4 flex flex-col justify-center items-center text-white cursor-pointer hover:opacity-90 transition-opacity`}
            style={{ minHeight: `${adConfig.height}px` }}
            onClick={() => {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'demo_ad_click', {
                  ad_slot: slot,
                  ad_size: size
                });
              }
            }}
          >
            <div className="text-center">
              <h3 className="font-bold text-sm md:text-base mb-1 leading-tight">
                {demoAd.title}
              </h3>
              <p className="text-xs opacity-90 mb-2">
                {demoAd.description}
              </p>
              <div className="inline-flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-xs">
                <span>{demoAd.cta}</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;