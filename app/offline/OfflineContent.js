'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCcw, Lock, Calculator, FileText, Type, Shield, FileJson, QrCode, Ratio, Palette, Keyboard, Search, FileCode } from 'lucide-react';

export default function OfflineContent() {
    const [isOnline, setIsOnline] = useState(false);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        // Check status on mount and when window online/offline events fire
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const checkConnection = async () => {
        setChecking(true);
        try {
            const res = await fetch('/api/health-check', { method: 'HEAD', cache: 'no-store' });
            if (res.ok) {
                setIsOnline(true);
                window.location.reload();
            } else {
                setIsOnline(false);
            }
        } catch (e) {
            setIsOnline(false);
        } finally {
            setTimeout(() => setChecking(false), 500);
        }
    };

    const offlineTools = [
        { name: 'Password Generator', icon: Lock, href: '/tools/password-generator' },
        { name: 'Calculator', icon: Calculator, href: '/tools/calculator' },
        { name: 'Unit Converter', icon: RefreshCcw, href: '/tools/unit-converter' },
        { name: 'WebP Converter', icon: FileText, href: '/tools/image-converter' },
        { name: 'JSON Formatter', icon: FileJson, href: '/tools/json-formatter' },
        { name: 'QR Generator', icon: QrCode, href: '/tools/qr-generator' },
        { name: 'Markdown Editor', icon: FileCode, href: '/tools/markdown-editor' },
        { name: 'Aspect Ratio', icon: Ratio, href: '/tools/aspect-ratio-calculator' },
        { name: 'Case Converter', icon: Type, href: '/tools/case-converter' },
        { name: 'Typing Test', icon: Keyboard, href: '/tools/typing-speed-test' },
        { name: 'Color Picker', icon: Palette, href: '/tools/color-picker' },
        { name: 'BMI Calculator', icon: Calculator, href: '/tools/bmi-calculator' },
        { name: 'Regex Tester', icon: Search, href: '/tools/regex-tester' },
        { name: 'JWT Decoder', icon: Shield, href: '/tools/jwt-decoder' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">

                {/* Status Icon */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto">
                        <WifiOff className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                {/* Main Message */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        You are currently offline
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                        Please check your internet connection. In the meantime, you can assume that many of our tools work offline if they were previously loaded.
                    </p>
                </div>

                {/* Action Button */}
                <div>
                    <button
                        onClick={checkConnection}
                        disabled={checking}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <RefreshCcw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
                        {checking ? 'Checking Status...' : 'Try Again'}
                    </button>
                </div>

                {/* Offline Recommendations */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Tools Available Offline
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {offlineTools.map((tool) => (
                            <Link
                                key={tool.name}
                                href={tool.href}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group text-center h-full"
                            >
                                <tool.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400 mb-3 transition-colors" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                                    {tool.name}
                                </span>
                                <span className="text-xs text-gray-400 mt-1">Client-side only</span>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
