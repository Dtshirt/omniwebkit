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
                  <p className="text-3xl font-bold text-gray-900 dark:text-slute-800 font-mono">{ipData?.ip}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-900 mt-1">{ipData?.type} Address</p>
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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg mb-12">
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

        {/* SEO Content */}
        <div className="mt-16 prose-premium">
          <h2>About the IP Address Finder</h2>
          <p>
            Whenever you connect to the internet, your device is assigned a unique digital identifier. If you find yourself asking "<strong>what's my IP</strong>", you are looking for this exact string of numbers. Our <strong>IP Address Finder</strong> instantly detects and displays your current public IP address along with the network details tied to it.
          </p>
          <p>
            Knowing your exact IP address is essential for a variety of tasks. You might need it to troubleshoot a stubborn network issue, configure a home router, whitelist your connection for a remote work server, or set up a dedicated game server for your friends. It is also the fastest way to verify that your VPN is actually working and masking your real location.
          </p>
          <p>
            Instead of digging through complex computer settings or dealing with messy command prompts, this tool gives you everything you need in a single click. We provide a clean, readable dashboard that explains exactly what your network is broadcasting to the world.
          </p>

          <h2>How to Use This Tool</h2>
          <p>
            We designed this tool to be completely frictionless. There is nothing to install, no software to download, and no complicated steps. Here is how to use it:
          </p>
          <ol>
            <li><strong>Open the page:</strong> The moment you load this tool, it instantly scans your connection and displays your exact public IP address at the top of the screen.</li>
            <li><strong>Review your details:</strong> Scroll through the information cards to see your detected city, country, Internet Service Provider (ISP), and timezone.</li>
            <li><strong>Copy what you need:</strong> Click the small copy icon next to any piece of data to instantly save it to your clipboard. You can paste it straight into an email for your IT support team.</li>
            <li><strong>Check for updates:</strong> If you just switched from Wi-Fi to cellular, or if you just turned on a VPN, click the "Refresh Data" button to run a fresh scan without having to reload the entire page.</li>
          </ol>

          <h2>Privacy & Security</h2>
          <p>
            When dealing with network data, privacy is a major concern. Many free IP lookup sites run heavy tracking scripts, log your connection data, or sell your location profiles to data brokers. We take a distinctly different approach.
          </p>
          <p>
            This IP Address Finder operates strictly as a mirror. It securely queries your active connection to show you what websites already see when you visit them. We do not store your IP address in a database, we do not log your searches, and we do not track your location over time. Once you close this tab, your data is gone. 
          </p>
          <p>
            Remember, your public IP address reveals your approximate geographic location and your ISP to every single website you visit. If you want to hide this information and browse anonymously, we highly recommend using a trusted Virtual Private Network (VPN) to mask your true identity.
          </p>

          <h2>Core Features</h2>
          <p>
            This tool provides much more than just a string of numbers. We engineered it to give you a complete picture of your network fingerprint:
          </p>
          <ul>
            <li><strong>Instant IP detection:</strong> See your IPv4 or IPv6 address the exact moment the page loads. The detection happens automatically in the background.</li>
            <li><strong>Deep geolocation:</strong> Discover exactly where your IP is registered, including your city, region, continent, and postal code.</li>
            <li><strong>Network insights:</strong> Identify your Internet Service Provider (ISP) and Autonomous System Number (ASN) to verify your connection quality.</li>
            <li><strong>One-click copy:</strong> Grab any piece of data instantly to share with tech support or network administrators without risking typos.</li>
            <li><strong>Live refresh:</strong> Update your network details instantly if you change networks, allowing you to test different connections rapidly.</li>
          </ul>

          <h2>Technical Details</h2>
          <p>
            How does an IP address actually work? Think of it like a digital return address for your internet traffic. 
          </p>
          <p>
            Every time you load a website, watch a streaming video, or send an email, your device sends a request to a remote server. That server needs to know exactly where to send the data back. Your <strong>Internet Protocol (IP) address</strong> is that exact location. 
          </p>
          <table>
            <thead>
              <tr>
                <th>IP Type</th>
                <th>Format Example</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IPv4</td>
                <td><code>192.168.1.1</code></td>
                <td>The older, most common standard using four sets of numbers. We are currently running out of these addresses globally.</td>
              </tr>
              <tr>
                <td>IPv6</td>
                <td><code>2001:0db8:85a3::8a2e</code></td>
                <td>The newer standard using longer alphanumeric strings. It was created to support billions of new smart devices.</td>
              </tr>
              <tr>
                <td>Public IP</td>
                <td>(Varies)</td>
                <td>The main address assigned to your modem by your ISP. This is the single address the internet sees.</td>
              </tr>
              <tr>
                <td>Private IP</td>
                <td><code>10.0.0.1</code></td>
                <td>The internal address your router assigns to your specific phone or laptop. It is invisible to the outside world.</td>
              </tr>
            </tbody>
          </table>
          <p>
            This tool specifically checks your <strong>public IP address</strong>. It communicates with an external API server to see exactly what address your router is broadcasting to the outside world. This is why it works even if you are buried behind a complex corporate firewall or a home Wi-Fi network.
          </p>

          <h2>Frequently Asked Questions</h2>
          <h3>Can someone find my exact house using my IP address?</h3>
          <p>
            No. A public IP address only reveals your approximate geographic location, usually down to a specific city or zip code. It points to your Internet Service Provider's local routing hub, not your actual physical street address. Only your ISP has the billing records tying your IP address to your home, and they do not share that without a legal warrant.
          </p>

          <h3>Why does my IP address change?</h3>
          <p>
            Most home internet connections use a "Dynamic IP." This means your Internet Service Provider occasionally rotates the address assigned to your modem to manage their network efficiently. It might change when you restart your router or when your ISP performs maintenance. If you switch from Wi-Fi to a cellular data network on your phone, your IP will also change instantly.
          </p>

          <h3>How do I hide my IP address?</h3>
          <p>
            The most effective way to hide your real IP address is by using a Virtual Private Network (VPN). A VPN routes your internet traffic through an encrypted, secure server in a completely different location. When a website checks your IP, it sees the VPN's address instead of your real one, effectively masking your location.
          </p>
          
          <h3>What is the difference between my public IP and private IP?</h3>
          <p>
            Your public IP is like your home's main street address—it is how the outside internet finds your entire network. Your private IP is like a specific room number inside that house—it is how your Wi-Fi router identifies your specific phone, smart TV, or laptop internally. This tool shows your public street address.
          </p>
          
          <h3>Why does my location look wrong?</h3>
          <p>
            IP geolocation is not perfect. Sometimes, your ISP routes your traffic through a hub in a neighboring city or even a different state. If you are using a VPN or a corporate proxy, the tool will display the location of that proxy server, not your actual physical location. This is completely normal behavior for network routing.
          </p>
        </div>

        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "What's My IP Address Finder",
              "url": "https://omniwebkit.com/tools/whats-my-ip",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Lazydesigners",
                "url": "https://github.com/Dtshirt/omniwebkit"
              },
              "description": "Instantly check your public IP address, network location, ISP, and geographic details with this free, private IP lookup tool."
            })
          }}
        />
      </div>
    </div>
  );
};

export default IPAddressFinder;

/* 
---
**Meta Title:** What's My IP? | Instant Public IP Address Finder
**Meta Description:** Instantly check your public IP address, network location, and ISP details. A fast, private, and secure browser-based IP lookup tool.
**Primary Keyword:** What's my IP
**Word Count:** 880
**Estimated Reading Time:** 4.4 min read
---
*/