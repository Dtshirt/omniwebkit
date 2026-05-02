'use client';
import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Shield, Wifi, Clock, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const IPAddressFinder = () => {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Get IP information from multiple sources
  const fetchIPInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try multiple IP detection methods
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipResult = await ipResponse.json();
      const userIP = ipResult.ip;

      // Get detailed information about the IP
      const detailsResponse = await fetch(`https://ipapi.co/${userIP}/json/`);
      const details = await detailsResponse.json();

      // Combine data
      const combinedData = {
        ip: userIP,
        type: userIP.includes(':') ? 'IPv6' : 'IPv4',
        city: details.city || 'Unknown',
        region: details.region || 'Unknown',
        country: details.country_name || 'Unknown',
        countryCode: details.country_code || 'Unknown',
        continent: details.continent_code || 'Unknown',
        timezone: details.timezone || 'Unknown',
        isp: details.org || 'Unknown',
        latitude: details.latitude || null,
        longitude: details.longitude || null,
        postal: details.postal || 'Unknown',
        currency: details.currency || 'Unknown',
        languages: details.languages || 'Unknown',
        asn: details.asn || 'Unknown',
        utc_offset: details.utc_offset || 'Unknown'
      };

      setIpData(combinedData);
    } catch (err) {
      setError('Failed to fetch IP information. Please try again.');
      console.error('IP fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchIPInfo();
  };

  useEffect(() => {
    fetchIPInfo();
  }, []);

  const InfoCard = ({ icon: Icon, title, value, copyable = false, copyKey = '' }) => (
    <div className="  border  rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">{title}</p>
            <p className="text-lg font-semibold text-gray-400 break-all">{value}</p>
          </div>
        </div>
        {copyable && (
          <button
            onClick={() => copyToClipboard(value, copyKey)}
            className="p-2 text-gray-200 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            title="Copy to clipboard"
          >
            {copied === copyKey ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Detecting Your IP Address</h2>
          <p className="text-gray-500 dark:text-gray-400">Please wait while we gather your network information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Error Occurred</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchIPInfo}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-3">
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: "What's My IP", href: '/tools/whats-my-ip' }]} />
      </div>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                <Globe className="w-12 h-12 text-gray-900 dark:text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-100 sm:text-5xl mb-4">
              IP Address Finder
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover comprehensive information about your current IP address and network location
            </p>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Primary IP Information */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your IP Address</h2>
              <div className="inline-flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200">
                <Shield className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{ipData?.ip}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ipData?.type} Address</p>
                </div>
                <button
                  onClick={() => copyToClipboard(ipData?.ip, 'main-ip')}
                  className="p-3 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                  title="Copy IP address"
                >
                  {copied === 'main-ip' ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <Copy className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <InfoCard
            icon={MapPin}
            title="Location"
            value={`${ipData?.city}, ${ipData?.region}`}
            copyable={true}
            copyKey="location"
          />
          <InfoCard
            icon={Globe}
            title="Country"
            value={`${ipData?.country} (${ipData?.countryCode})`}
            copyable={true}
            copyKey="country"
          />
          <InfoCard
            icon={Wifi}
            title="ISP"
            value={ipData?.isp}
            copyable={true}
            copyKey="isp"
          />
          <InfoCard
            icon={Clock}
            title="Timezone"
            value={ipData?.timezone}
            copyable={true}
            copyKey="timezone"
          />
          <InfoCard
            icon={MapPin}
            title="Postal Code"
            value={ipData?.postal}
            copyable={true}
            copyKey="postal"
          />
          <InfoCard
            icon={Globe}
            title="Continent"
            value={ipData?.continent}
            copyable={true}
            copyKey="continent" 
          />
        </div>

        {/* Additional Technical Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Geographic Details */}
          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-blue-600" />
              Geographic Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Latitude</span>
                <span className="text-gray-900 dark:text-white font-mono">{ipData?.latitude || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Longitude</span>
                <span className="text-gray-900 dark:text-white font-mono">{ipData?.longitude || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">UTC Offset</span>
                <span className="text-gray-900 dark:text-white font-mono">{ipData?.utc_offset}</span>
              </div>
            </div>
          </div>

          {/* Network Information */}
          <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Wifi className="w-6 h-6 mr-3 text-purple-600" />
              Network Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">ASN</span>
                <span className="text-gray-900 dark:text-white font-mono">{ipData?.asn}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Currency</span>
                <span className="text-gray-900 dark:text-white">{ipData?.currency}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Languages</span>
                <span className="text-gray-900 dark:text-white">{ipData?.languages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <Shield className="w-8 h-8 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Privacy & Security Notice</h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                This tool shows your public IP address and related information that websites can typically access. 
                Your IP address can reveal your approximate location and ISP. Consider using a VPN if you want to 
                mask this information for privacy reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
 
    </div>
  );
};

export default IPAddressFinder;