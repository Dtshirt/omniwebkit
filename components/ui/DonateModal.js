// src/components/ui/DonateModal.js
'use client';

import { useState } from 'react';
import { X, Heart, Coffee, Gift, CreditCard, Smartphone } from 'lucide-react';

const DonateModal = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');

  const predefinedAmounts = [
    { amount: 3, label: '$3', description: 'Buy us a coffee ☕' },
    { amount: 5, label: '$5', description: 'Support our hosting 🚀' },
    { amount: 10, label: '$10', description: 'Fund new features 🎯' },
    { amount: 25, label: '$25', description: 'Sponsor development 💻' },
    { amount: 50, label: '$50', description: 'Become a patron 👑' },
    { amount: 0, label: 'Custom', description: 'Choose your amount 💝' }
  ];

  const paymentMethods = [
    { id: 'paypal', name: 'PayPal', icon: CreditCard, description: 'Secure payment via PayPal' },
    { id: 'stripe', name: 'Credit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'crypto', name: 'Cryptocurrency', icon: Smartphone, description: 'Bitcoin, Ethereum' }
  ];

  const handleDonate = () => {
    const amount = selectedAmount === 0 ? parseFloat(customAmount) : selectedAmount;

    if (!amount || amount < 1) {
      alert('Please enter a valid amount');
      return;
    }

    switch (paymentMethod) {
      case 'paypal':
        window.open(`https://www.paypal.com/donate/?amount=${amount}&currency_code=USD`, '_blank');
        break;
      case 'stripe':
        alert('Stripe integration would go here');
        break;
      case 'crypto':
        alert('Crypto payment integration would go here');
        break;
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-slate-200 dark:border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-white fill-current" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Support OmniWebKit
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Help us keep the tools free for everyone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Amount Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Choose Amount
            </label>
            <div className="grid grid-cols-2 gap-3">
              {predefinedAmounts.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => setSelectedAmount(option.amount)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${selectedAmount === option.amount
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                >
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          {selectedAmount === 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-8 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl border-2 text-left transition-all ${paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600'
                      }`}
                  >
                    <IconComponent className={`h-5 w-5 ${paymentMethod === method.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'
                      }`} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {method.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {method.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Impact Message */}
          <div className="bg-gradient-to-r from-primary-50 to-violet-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Gift className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                  Your Impact
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Your donation helps us maintain servers, develop new tools, and keep everything free.
                  Every contribution, no matter the size, makes a difference! 🙏
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Maybe Later
            </button>
            <button
              onClick={handleDonate}
              className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Heart className="h-4 w-4 fill-current" />
              <span>
                Donate ${selectedAmount === 0 ? customAmount || '0' : selectedAmount}
              </span>
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
            OmniWebKit is made with ❤️ by developers, for developers. Thank you for your support!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;