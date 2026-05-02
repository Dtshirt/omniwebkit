// src/app/about/page.js
import { 
  Zap, 
  Shield, 
  Users, 
  Globe, 
  Heart, 
  Target,
  Lightbulb,
  Award
} from 'lucide-react';

export const metadata = {
  title: 'About Us - OmniWebKit',
  description: 'Learn about OmniWebKit mission to provide free, secure, and fast online tools for everyone.',
};

const AboutPage = () => {
  const values = [
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All processing happens locally in your browser. We never collect, store, or transmit your data.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance. Get results instantly without waiting for server processing.'
    },
    {
      icon: Heart,
      title: 'Always Free',
      description: 'All our tools are completely free with no hidden costs, limits, or premium features.'
    },
    {
      icon: Globe,
      title: 'Accessible',
      description: 'Works on any device, anywhere in the world. No registration or downloads required.'
    }
  ];

  const stats = [
    { number: '100+', label: 'Free Tools' },
    { number: '50K+', label: 'Daily Users' },
    { number: '1M+', label: 'Tools Used Monthly' },
    { number: '150+', label: 'Countries Served' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800/10 backdrop-blur-sm rounded-2xl mb-6">
            <Zap className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About OmniWebKit
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make powerful digital tools accessible to everyone, 
            everywhere, without barriers or limitations.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Target className="h-12 w-12 text-primary-600 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                To democratize access to digital tools by creating a comprehensive platform 
                where anyone can find, use, and benefit from powerful utilities without 
                cost, registration, or complexity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Why We Exist
                </h3>
                <div className="space-y-4 text-gray-600 dark:text-gray-400">
                  <p>
                    In today's digital world, simple tasks often require expensive software 
                    or complex installations. We believe essential digital tools should be 
                    as accessible as a web search.
                  </p>
                  <p>
                    OmniWebKit was born from the frustration of needing multiple subscriptions 
                    and downloads for basic tasks. We decided to build something better - 
                    a single platform with everything you need.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Award className="h-12 w-12 text-primary-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              These principles guide every decision we make and every tool we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-2xl mb-6">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Lightbulb className="h-12 w-12 text-primary-600 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Built with Modern Technology
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                We use cutting-edge web technologies to deliver fast, reliable, and secure tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Technology Stack
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Next.js 15 for optimal performance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Client-side processing for privacy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Progressive Web App capabilities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Mobile-first responsive design</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Security & Privacy
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">No data collection or tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">All processing happens locally</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">HTTPS encryption for all traffic</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">Open source and transparent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Built by Developers, for Everyone
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              OmniWebKit is created and maintained by a team of passionate developers 
              who believe in making the web more accessible and useful for everyone.
            </p>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Join Our Community
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Have suggestions for new tools or improvements? We'd love to hear from you! 
                Our community drives the development of new features and tools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <a
                  href="/contact"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>Get in Touch</span>
                </a>
                <a
                  href="https://github.com/multitools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center space-x-2"
                >
                  <span>View on GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

