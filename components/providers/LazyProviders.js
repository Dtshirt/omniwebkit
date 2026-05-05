'use client';

import dynamic from 'next/dynamic';

// These components are all client-side only and should not block initial page load.
// They are lazy-loaded after the main page content is rendered.
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);
const ServiceWorkerRegister = dynamic(
  () => import('@/components/ServiceWorkerRegister'),
  { ssr: false }
);
const GlobalFileValidator = dynamic(
  () => import('@/components/GlobalFileValidator'),
  { ssr: false }
);
const GlobalDropOverlay = dynamic(
  () => import('@/components/GlobalDropOverlay'),
  { ssr: false }
);
const ConsentBanner = dynamic(
  () => import('@/components/ads/ConsentBanner'),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import('@/components/ui/CommandPalette'),
  { ssr: false }
);

export default function LazyProviders() {
  return (
    <>
      <ServiceWorkerRegister />
      <GlobalFileValidator />
      <GlobalDropOverlay />
      <CommandPalette />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
        }}
      />
      <ConsentBanner />
    </>
  );
}
