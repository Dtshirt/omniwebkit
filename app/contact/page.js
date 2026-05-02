// src/app/contact/page.js
'use client';

import { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  Github,
  Twitter,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactTypes = [
    { id: 'general', name: 'General Inquiry', icon: MessageSquare },
    { id: 'bug', name: 'Bug Report', icon: AlertCircle },
    { id: 'feature', name: 'Feature Request', icon: CheckCircle },
    { id: 'business', name: 'Business Inquiry', icon: Mail }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get in touch for any questions or support',
      contact: 'hello@omniwebkit.com',
      href: 'mailto:hello@omniwebkit.com'
    },
    {
      icon: Github,
      title: 'GitHub',
      description: 'Report bugs or contribute to the project',
      contact: 'github.com/OmniWebKit',
      href: 'https://github.com/OmniWebKit'
    },
    {
      icon: Twitter,
      title: 'Twitter',
      description: 'Follow us for updates and announcements',
      contact: '@OmniWebKit',
      href: 'https://twitter.com/OmniWebKit'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you'd send this to your backend
      console.log('Form submitted:', formData);

      setSubmitted(true);
      toast.success('Message sent successfully!');

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-6">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Have questions, suggestions, or feedback? We'd love to hear from you.
            Reach out and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200 font-medium">
                      Thank you! Your message has been sent successfully.
                    </span>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                    We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {contactTypes.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = formData.type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                          className={`p-3 rounded-lg border-2 transition-all text-left flex items-center space-x-3 ${isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                            }`}
                        >
                          <IconComponent className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          <span className={`font-medium text-sm ${isSelected
                              ? 'text-primary-700 dark:text-primary-300'
                              : 'text-gray-900 dark:text-white'
                            }`}>
                            {type.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us more about your inquiry, feedback, or how we can help you..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Other Ways to Reach Us
              </h3>

              <div className="space-y-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <a
                      key={index}
                      href={info.href}
                      target={info.href.startsWith('http') ? '_blank' : undefined}
                      rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {info.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {info.description}
                        </p>
                        <p className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                          {info.contact}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Response Time */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Response Times
              </h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      General Inquiries
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Within 24 hours
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      Bug Reports
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Within 48 hours
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      Feature Requests
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Within 1 week
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Need Quick Answers?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Check out our frequently asked questions for instant answers to common queries.
              </p>
              <a
                href="/faq"
                className="btn-secondary w-full text-center"
              >
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;