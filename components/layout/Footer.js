import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Github,
  Twitter,
  Mail,
  Heart,
  ExternalLink,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    tools: [
      { name: 'Image Tools', href: '/tools/image' },
      { name: 'Text Tools', href: '/tools/text' },
      { name: 'Math Tools', href: '/tools/math' },
      { name: 'Web Tools', href: '/tools/web' },
      { name: 'All Tools', href: '/tools' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Contact', href: '/contact' }
    ],
    resources: [
      { name: 'Popular Tools', href: '/tools/popular' },
      { name: 'Blog', href: '/blog' },
    ]
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'All processing happens locally in your browser',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices and screen sizes',
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20'
    },
    {
      icon: Globe,
      title: 'Always Free',
      description: 'No registration, no limits, completely free to use',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image src="/OmniWebKit.png" alt="Logo" width={150} height={100} />
            </Link>

            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-sm">
              Your all-in-one digital toolkit with 100+ free online tools.
              Fast, secure, and always available when you need them.
            </p>

            {/* Social Links - uncomment when social profiles are created */}
            {/* <div className="flex items-center space-x-2">
              <a href="#" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:hello@omniwebkit.com" className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Popular Tools
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    {link.href.startsWith('http') && (
                      <ExternalLink className="h-3 w-3" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-9 h-9 ${feature.bgColor} rounded-xl flex items-center justify-center`}>
                      <IconComponent className={`h-4 w-4 ${feature.color}`} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
              <span>
                © {currentYear} OmniWebKit. All rights reserved.
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Built with Next.js & Tailwind CSS</span>
            </div>

            <div className="flex items-center space-x-1 text-sm text-slate-500 dark:text-slate-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for developers and creators</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;