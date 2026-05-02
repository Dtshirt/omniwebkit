// Shared redirect component for pSEO pages → routes to the main video compressor tool
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function VideoCompressorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/tools/video-compressor');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">Loading Video Compressor...</p>
      </div>
    </div>
  );
}
