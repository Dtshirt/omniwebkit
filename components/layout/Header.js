// Updated Header.js with Professional Design
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  Home,
  Grid3X3,
  Star,
  Info,
  ChevronDown,
  Heart,
  Image as Img,
  FileText,
  Clock,
  Type,
  Calculator,
  Code,
  Settings
} from 'lucide-react';
import SearchBar from '@/components/tools/SearchBar';
import DonateModal from '@/components/ui/DonateModal';
import Image from 'next/image';
import { useCommandStore } from '@/hooks/useCommandStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef(null);
  const setCommandOpen = useCommandStore((state) => state.setOpen);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const openDonateModal = () => setIsDonateModalOpen(true);
  const closeDonateModal = () => setIsDonateModalOpen(false);

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Popular tools by category for dropdown menu
  const popularToolsMenu = {
    image: [
      { name: 'Image Converter', href: '/tools/image-converter', desc: 'Convert JPG, PNG, WebP' },
      { name: 'Image Compressor', href: '/tools/image-compressor', desc: 'Reduce file size' },
      { name: 'Background Remover', href: '/tools/background-remover', desc: 'Remove backgrounds' },
      { name: 'Image Resizer', href: '/tools/image-resizer', desc: 'Resize images' }
    ],
    text: [
      { name: 'Password Generator', href: '/tools/password-generator', desc: 'Secure passwords' },
      { name: 'Case Converter', href: '/tools/case-converter', desc: 'Change text case' },
      { name: 'Word Counter', href: '/tools/word-counter', desc: 'Count words & chars' },
      { name: 'Text Reverser', href: '/tools/text-reverser', desc: 'Reverse text' }
    ],
    web: [
      { name: 'QR Code Generator', href: '/tools/qr-generator', desc: 'Create QR codes' },
      { name: 'JSON Formatter', href: '/tools/json-formatter', desc: 'Format JSON' },
      { name: 'Color Picker', href: '/tools/color-picker', desc: 'Pick colors' },
      { name: 'HTML Minifier', href: '/tools/html-minifier', desc: 'Minify HTML' }
    ],
    math: [
      { name: 'Calculator', href: '/tools/basic-calculator', desc: 'Basic calculations' },
      { name: 'Percentage Calculator', href: '/tools/percentage-calculator', desc: 'Calculate %' },
      { name: 'Unit Converter', href: '/tools/unit-converter', desc: 'Convert units' },
      { name: 'Currency Converter', href: '/tools/currency-converter', desc: 'Convert currency' }
    ]
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    {
      name: 'Tools',
      href: '/tools',
      icon: Grid3X3,
      hasDropdown: true,
      dropdown: [
        {
          category: 'Image Tools',
          icon: Img,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          tools: popularToolsMenu.image
        },
        {
          category: 'Text Tools',
          icon: Type,
          color: 'text-violet-600 dark:text-violet-400',
          bgColor: 'bg-violet-50 dark:bg-violet-900/20',
          tools: popularToolsMenu.text
        },
        {
          category: 'Web Tools',
          icon: Code,
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
          tools: popularToolsMenu.web
        },
        {
          category: 'Math Tools',
          icon: Calculator,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          tools: popularToolsMenu.math
        }
      ]
    },
    { name: 'Popular', href: '/tools/popular', icon: Star },
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'About', href: '/about', icon: Info },
  ];

  const handleDropdownToggle = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-soft border-b border-slate-200/50 dark:border-slate-700/50'
          : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
        }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <Image src="/OmniWebKit.png" alt="Logo" width={150} height={100} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.name} className="relative">
                    {item.hasDropdown ? (
                      <button
                        onClick={() => handleDropdownToggle(item.name)}
                        className="flex items-center space-x-1.5 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.name}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''
                          }`} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center space-x-1.5 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    )}

                    {/* Mega Dropdown Menu */}
                    {item.hasDropdown && activeDropdown === item.name && (
                      <div className="absolute top-full left-0 mt-2 w-screen max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg border border-slate-200 dark:border-slate-700 p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {item.dropdown.map((category) => {
                            const CategoryIcon = category.icon;
                            return (
                              <div key={category.category}>
                                <div className="flex items-center space-x-2 mb-4">
                                  <div className={`p-1.5 rounded-lg ${category.bgColor}`}>
                                    <CategoryIcon className={`h-4 w-4 ${category.color}`} />
                                  </div>
                                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                    {category.category}
                                  </h3>
                                </div>
                                <ul className="space-y-1">
                                  {category.tools.map((tool) => (
                                    <li key={tool.name}>
                                      <Link
                                        href={tool.href}
                                        className="block p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                        onClick={() => setActiveDropdown(null)}
                                      >
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">
                                          {tool.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                          {tool.desc}
                                        </div>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <Link
                                  href={`/tools/${category.category.toLowerCase().replace(' tools', '')}`}
                                  className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700 mt-3 font-medium"
                                  onClick={() => setActiveDropdown(null)}
                                >
                                  View all {category.category} →
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-4">
                          <div className="flex items-center justify-between">
                            <Link
                              href="/tools"
                              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                              onClick={() => setActiveDropdown(null)}
                            >
                              Browse All 100+ Tools →
                            </Link>
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <span>New tools added weekly</span>
                              <Zap className="h-3 w-3 text-primary-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Desktop Search */}
              <div className="w-80">
                <button
                  onClick={() => setCommandOpen(true)}
                  className="w-full flex items-center justify-between pl-4 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <Search className="h-4 w-4" />
                    <span>Search tools...</span>
                  </div>
                  <kbd className="hidden sm:inline-flex items-center justify-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-xs mr-0.5">⌘</span>K
                  </kbd>
                </button>
              </div>

              {/* Donate Button */}
              <button
                onClick={openDonateModal}
                className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span>Donate</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setCommandOpen(true)}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-xl"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-xl"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-xl"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Removed - using global Command Palette */}

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200 dark:border-slate-700">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>

                      {/* Mobile Popular Tools */}
                      {item.hasDropdown && (
                        <div className="ml-8 mt-1 space-y-1">
                          {Object.entries(popularToolsMenu).map(([category, tools]) => (
                            <div key={category}>
                              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 px-3">
                                {category} Tools
                              </div>
                              {tools.slice(0, 2).map((tool) => (
                                <Link
                                  key={tool.name}
                                  href={tool.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="block px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg"
                                >
                                  {tool.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Mobile Donate Button */}
                <div className="px-3 pt-4">
                  <button
                    onClick={() => {
                      openDonateModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    <span>Support OmniWebKit</span>
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Donate Modal */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={closeDonateModal}
      />
    </>
  );
};

export default Header;