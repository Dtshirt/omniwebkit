// src/app/not-found.js
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | OmniWebKit',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-md mx-auto">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</div>
            <div className="w-24 h-24 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
              <Search className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Page Not Found
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved,
            deleted, or you entered the wrong URL.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Link>

            <Link
              href="/tools"
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Browse Tools</span>
            </Link>
          </div>

          {/* Popular Tools */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Popular Tools
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/tools/image-converter"
                className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
              >
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  Image Converter
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Convert images
                </div>
              </Link>

              <Link
                href="/tools/password-generator"
                className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
              >
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  Password Generator
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Generate passwords
                </div>
              </Link>

              <Link
                href="/tools/qr-generator"
                className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
              >
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  QR Generator
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Create QR codes
                </div>
              </Link>

              <Link
                href="/tools/basic-calculator"
                className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
              >
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  Calculator
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Math calculations
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}