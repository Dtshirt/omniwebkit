'use client';
import React, { useState, useRef, useCallback } from 'react';
import {
  Download,
  QrCode,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Calendar,
  Camera,
  X,
  Plus,
  Eye,
  Check,
  AlertCircle,
  Copy,
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Utility Functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateURL = (url) => {
  const urlRegex = /^https?:\/\/.+/;
  return urlRegex.test(url);
};

const formatPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

// QR Code Generator (Simple implementation)
const generateQRCode = (text, size = 200) => {
  // Create a simple QR code using a free QR code API
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
};

// Main Component
const VCardGenerator = () => {
  // State Management
  const [formData, setFormData] = useState({
    prefix: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    nickname: '',
    organization: '',
    department: '',
    title: '',
    email: '',
    workEmail: '',
    phone: '',
    mobile: '',
    fax: '',
    website: '',
    workWebsite: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    workAddress: '',
    workCity: '',
    workState: '',
    workZipCode: '',
    workCountry: '',
    birthday: '',
    anniversary: '',
    notes: '',
    categories: '',
    photo: null,
    photoName: ''
  });

  const [socialLinks, setSocialLinks] = useState([
    { platform: 'LinkedIn', url: '', icon: '💼' },
    { platform: 'Twitter', url: '', icon: '🐦' },
    { platform: 'GitHub', url: '', icon: '💻' }
  ]);

  const [customFields, setCustomFields] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [generatedVCard, setGeneratedVCard] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(true);

  const fileInputRef = useRef(null);
  const vCardTextareaRef = useRef(null);

  // Event Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    // Format phone numbers automatically
    let formattedValue = value;
    if (name.includes('phone') || name.includes('mobile') || name.includes('fax')) {
      formattedValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        photo: 'Photo size must be less than 5MB'
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        photo: 'Please select a valid image file'
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        photo: event.target.result,
        photoName: file.name
      }));
      setErrors(prev => ({
        ...prev,
        photo: ''
      }));
    };
    reader.onerror = () => {
      setErrors(prev => ({
        ...prev,
        photo: 'Failed to read image file'
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const removePhoto = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      photo: null,
      photoName: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSocialLinkChange = useCallback((index, field, value) => {
    setSocialLinks(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  }, []);

  const addSocialLink = useCallback(() => {
    setSocialLinks(prev => [...prev, { platform: '', url: '', icon: '🔗' }]);
  }, []);

  const removeSocialLink = useCallback((index) => {
    setSocialLinks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addCustomField = useCallback(() => {
    setCustomFields(prev => [...prev, { label: '', value: '' }]);
  }, []);

  const removeCustomField = useCallback((index) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleCustomFieldChange = useCallback((index, field, value) => {
    setCustomFields(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.workEmail && !validateEmail(formData.workEmail)) {
      newErrors.workEmail = 'Please enter a valid work email address';
    }

    // URL validation
    if (formData.website && !validateURL(formData.website)) {
      newErrors.website = 'Website URL must start with http:// or https://';
    }
    if (formData.workWebsite && !validateURL(formData.workWebsite)) {
      newErrors.workWebsite = 'Work website URL must start with http:// or https://';
    }

    // Social links validation
    socialLinks.forEach((link, index) => {
      if (link.url && !validateURL(link.url)) {
        newErrors[`social_${index}`] = 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, socialLinks]);

  // vCard Generation with proper formatting
  const generateVCard = useCallback(() => {
    if (!validateForm()) return null;

    setLoading(true);

    try {
      let vcard = 'BEGIN:VCARD\r\n';
      vcard += 'VERSION:3.0\r\n';

      // Full name
      const fullName = [formData.prefix, formData.firstName, formData.middleName, formData.lastName, formData.suffix]
        .filter(Boolean).join(' ');
      vcard += `FN:${fullName}\r\n`;

      // Structured name
      vcard += `N:${formData.lastName};${formData.firstName};${formData.middleName};${formData.prefix};${formData.suffix}\r\n`;

      // Nickname
      if (formData.nickname) vcard += `NICKNAME:${formData.nickname}\r\n`;

      // Organization
      if (formData.organization) {
        const org = formData.department
          ? `${formData.organization};${formData.department}`
          : formData.organization;
        vcard += `ORG:${org}\r\n`;
      }

      // Title
      if (formData.title) vcard += `TITLE:${formData.title}\r\n`;

      // Email addresses
      if (formData.email) vcard += `EMAIL;TYPE=HOME:${formData.email}\r\n`;
      if (formData.workEmail) vcard += `EMAIL;TYPE=WORK:${formData.workEmail}\r\n`;

      // Phone numbers
      if (formData.phone) vcard += `TEL;TYPE=HOME:${formData.phone}\r\n`;
      if (formData.mobile) vcard += `TEL;TYPE=CELL:${formData.mobile}\r\n`;
      if (formData.fax) vcard += `TEL;TYPE=FAX:${formData.fax}\r\n`;

      // Websites
      if (formData.website) vcard += `URL;TYPE=HOME:${formData.website}\r\n`;
      if (formData.workWebsite) vcard += `URL;TYPE=WORK:${formData.workWebsite}\r\n`;

      // Home address
      if (formData.address || formData.city || formData.state || formData.zipCode || formData.country) {
        vcard += `ADR;TYPE=HOME:;;${formData.address || ''};${formData.city || ''};${formData.state || ''};${formData.zipCode || ''};${formData.country || ''}\r\n`;
      }

      // Work address
      if (formData.workAddress || formData.workCity || formData.workState || formData.workZipCode || formData.workCountry) {
        vcard += `ADR;TYPE=WORK:;;${formData.workAddress || ''};${formData.workCity || ''};${formData.workState || ''};${formData.workZipCode || ''};${formData.workCountry || ''}\r\n`;
      }

      // Dates
      if (formData.birthday) {
        const birthday = formData.birthday.replace(/-/g, '');
        vcard += `BDAY:${birthday}\r\n`;
      }
      if (formData.anniversary) {
        const anniversary = formData.anniversary.replace(/-/g, '');
        vcard += `X-ANNIVERSARY:${anniversary}\r\n`;
      }

      // Photo
      if (formData.photo) {
        const photoData = formData.photo.split(',')[1];
        const mimeType = formData.photo.split(';')[0].split(':')[1];
        vcard += `PHOTO;ENCODING=BASE64;TYPE=${mimeType.split('/')[1].toUpperCase()}:${photoData}\r\n`;
      }

      // Social links
      socialLinks.forEach(link => {
        if (link.platform && link.url) {
          vcard += `X-SOCIALPROFILE;TYPE=${link.platform}:${link.url}\r\n`;
        }
      });

      // Custom fields
      customFields.forEach(field => {
        if (field.label && field.value) {
          vcard += `X-${field.label.toUpperCase().replace(/\s/g, '-')}:${field.value}\r\n`;
        }
      });

      // Categories
      if (formData.categories) vcard += `CATEGORIES:${formData.categories}\r\n`;

      // Notes
      if (formData.notes) vcard += `NOTE:${formData.notes}\r\n`;

      // Revision timestamp
      const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      vcard += `REV:${now}\r\n`;

      vcard += 'END:VCARD\r\n';

      setGeneratedVCard(vcard);
      return vcard;
    } catch (error) {
      console.error('Error generating vCard:', error);
      setErrors({ general: 'Failed to generate vCard. Please check your data.' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [formData, socialLinks, customFields, validateForm]);

  // Download functionality with proper MIME type
  const downloadVCard = useCallback(() => {
    const vcard = generateVCard();
    if (!vcard) return;

    try {
      const blob = new Blob([vcard], {
        type: 'text/vcard;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `${formData.firstName}_${formData.lastName}`.replace(/\s/g, '_');
      link.download = `${fileName}.vcf`;

      // Add proper file attributes
      link.setAttribute('download', `${fileName}.vcf`);
      link.setAttribute('type', 'text/vcard');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      setErrors({ general: 'Failed to download vCard file' });
    }
  }, [formData.firstName, formData.lastName, generateVCard]);

  // Generate QR Code
  const generateQRCodeImage = useCallback(() => {
    const vcard = generateVCard();
    if (!vcard) return;

    try {
      const qrUrl = generateQRCode(vcard, 300);
      setQrCodeUrl(qrUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      setErrors({ general: 'Failed to generate QR code' });
    }
  }, [generateVCard]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    const vcard = generateVCard();
    if (!vcard) return;

    navigator.clipboard.writeText(vcard).then(() => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }).catch(() => {
      // Fallback for older browsers
      if (vCardTextareaRef.current) {
        vCardTextareaRef.current.select();
        document.execCommand('copy');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    });
  }, [generateVCard]);

  const previewVCard = useCallback(() => {
    if (validateForm()) {
      generateVCard();
      setShowPreview(true);
      setShowPreviewModal(true);
    }
  }, [validateForm, generateVCard]);

  // Professional Card Preview Component
  const ProfessionalCardPreview = ({ isModal = false }) => {
    const fullName = [formData.prefix, formData.firstName, formData.middleName, formData.lastName, formData.suffix]
      .filter(Boolean).join(' ');

    return (
      <div className={`bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80 ${isModal ? 'p-8' : 'p-6'} rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm`}>
        <div className="flex items-start space-x-6 mb-6">
          {formData.photo && (
            <img
              src={formData.photo}
              alt="Profile"
              className={`${isModal ? 'w-24 h-24' : 'w-20 h-20'} rounded-full object-cover border-4 border-white shadow-md`}
            />
          )}
          <div className="flex-1 min-w-0">
            <h2 className={`${isModal ? 'text-3xl' : 'text-2xl'} font-bold text-slate-900 dark:text-white mb-2`}>
              {fullName || 'Full Name'}
            </h2>
            {formData.title && (
              <p className={`${isModal ? 'text-lg' : 'text-base'} text-blue-600 font-semibold mb-1`}>
                {formData.title}
              </p>
            )}
            {formData.organization && (
              <p className={`${isModal ? 'text-base' : 'text-sm'} text-slate-600 dark:text-slate-400 mb-1`}>
                {formData.organization}
                {formData.department && ` • ${formData.department}`}
              </p>
            )}
            {formData.nickname && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{formData.nickname}"</p>
            )}
          </div>
        </div>

        <div className={`grid ${isModal ? 'md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
          {/* Contact Information */}
          {(formData.email || formData.workEmail || formData.phone || formData.mobile) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Contact Information
              </h3>
              {formData.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Personal Email</p>
                    <p className="text-sm text-blue-600">{formData.email}</p>
                  </div>
                </div>
              )}
              {formData.workEmail && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Email</p>
                    <p className="text-sm text-green-600">{formData.workEmail}</p>
                  </div>
                </div>
              )}
              {formData.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</p>
                    <p className="text-sm text-purple-600">{formData.phone}</p>
                  </div>
                </div>
              )}
              {formData.mobile && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile</p>
                    <p className="text-sm text-indigo-600">{formData.mobile}</p>
                  </div>
                </div>
              )}
              {formData.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</p>
                    <a href={formData.website} className="text-sm text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {formData.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address Information */}
          {(formData.address || formData.workAddress) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Address Information
              </h3>
              {formData.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Home Address</p>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {formData.address && <p>{formData.address}</p>}
                      {(formData.city || formData.state || formData.zipCode) && (
                        <p>{[formData.city, formData.state, formData.zipCode].filter(Boolean).join(', ')}</p>
                      )}
                      {formData.country && <p>{formData.country}</p>}
                    </div>
                  </div>
                </div>
              )}
              {formData.workAddress && (
                <div className="flex items-start space-x-3">
                  <Building className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Address</p>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {formData.workAddress && <p>{formData.workAddress}</p>}
                      {(formData.workCity || formData.workState || formData.workZipCode) && (
                        <p>{[formData.workCity, formData.workState, formData.workZipCode].filter(Boolean).join(', ')}</p>
                      )}
                      {formData.workCountry && <p>{formData.workCountry}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Social Links */}
        {socialLinks.some(link => link.url) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
              Social Media
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks
                .filter(link => link.url)
                .map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span>{link.icon}</span>
                    <span className="text-sm font-medium">{link.platform}</span>
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {(formData.birthday || formData.notes || formData.categories) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
              Additional Information
            </h3>
            <div className="space-y-2">
              {formData.birthday && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Birthday: {new Date(formData.birthday).toLocaleDateString()}
                  </span>
                </div>
              )}
              {formData.categories && (
                <div className="flex items-start space-x-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Categories:</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{formData.categories}</span>
                </div>
              )}
              {formData.notes && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes:</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Form Components (keeping the same structure as before)
  const PersonalInfoTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Prefix
          </label>
          <input
            type="text"
            name="prefix"
            value={formData.prefix}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mr., Dr., etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Suffix
          </label>
          <input
            type="text"
            name="suffix"
            value={formData.suffix}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jr., Sr., PhD, etc."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Michael"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Nickname
        </label>
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Johnny"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Birthday
          </label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Anniversary
          </label>
          <input
            type="date"
            name="anniversary"
            value={formData.anniversary}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Photo Upload */}
      {/* <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          <Camera className="inline w-4 h-4 mr-1" />
          Profile Photo
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Choose Photo
          </button>
          {formData.photo && (
            <div className="flex items-center space-x-2">
              <img
                src={formData.photo}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">{formData.photoName}</span>
              <button
                type="button"
                onClick={removePhoto}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {errors.photo && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.photo}
          </p>
        )}
      </div> */}
    </div>
  );

  const ContactInfoTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Personal Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            placeholder="john.doe@gmail.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Work Email
          </label>
          <input
            type="email"
            name="workEmail"
            value={formData.workEmail}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.workEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            placeholder="john.doe@company.com"
          />
          {errors.workEmail && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.workEmail}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Phone className="inline w-4 h-4 mr-1" />
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Mobile
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(555) 987-6543"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Fax
          </label>
          <input
            type="tel"
            name="fax"
            value={formData.fax}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="(555) 111-2222"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Globe className="inline w-4 h-4 mr-1" />
            Personal Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.website ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            placeholder="https://johndoe.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.website}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Work Website
          </label>
          <input
            type="url"
            name="workWebsite"
            value={formData.workWebsite}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.workWebsite ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            placeholder="https://company.com"
          />
          {errors.workWebsite && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.workWebsite}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const ProfessionalInfoTab = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <Building className="inline w-4 h-4 mr-1" />
            Organization
          </label>
          <input
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Acme Corporation"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Engineering"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Job Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Senior Software Developer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Categories
        </label>
        <input
          type="text"
          name="categories"
          value={formData.categories}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Technology, Software, Business (comma-separated)"
        />
      </div>
    </div>
  );

  const AddressTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-800 dark:text-white mb-4 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Home Address
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="USA"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-slate-800 dark:text-white mb-4 flex items-center">
          <Building className="w-4 h-4 mr-2" />
          Work Address
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Street Address</label>
            <input
              type="text"
              name="workAddress"
              value={formData.workAddress}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="456 Business Ave"
            />
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City</label>
              <input
                type="text"
                name="workCity"
                value={formData.workCity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State</label>
              <input
                type="text"
                name="workState"
                value={formData.workState}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ZIP Code</label>
              <input
                type="text"
                name="workZipCode"
                value={formData.workZipCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10002"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
              <input
                type="text"
                name="workCountry"
                value={formData.workCountry}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="USA"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SocialTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          Social Media Links
        </label>
        {socialLinks.map((link, index) => (
          <div key={index} className="flex items-center gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
            <span className="text-xl">{link.icon}</span>
            <input
              type="text"
              placeholder="Platform (e.g., LinkedIn)"
              value={link.platform}
              onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="url"
              placeholder="https://..."
              value={link.url}
              onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
              className={`flex-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[`social_${index}`] ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
            />
            {socialLinks.length > 1 && (
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSocialLink}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Social Link
        </button>
      </div>

      {/* Custom Fields */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          Custom Fields
        </label>
        {customFields.map((field, index) => (
          <div key={index} className="flex gap-3 mb-3">
            <input
              type="text"
              placeholder="Field Label"
              value={field.label}
              onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Field Value"
              value={field.value}
              onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
              className="flex-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => removeCustomField(index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addCustomField}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Custom Field
        </button>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Additional notes, skills, interests, or any other information..."
        />
      </div>
    </div>
  );

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User, component: PersonalInfoTab },
    { id: 'contact', label: 'Contact', icon: Phone, component: ContactInfoTab },
    { id: 'professional', label: 'Professional', icon: Building, component: ProfessionalInfoTab },
    { id: 'address', label: 'Address', icon: MapPin, component: AddressTab },
    { id: 'social', label: 'Social & Notes', icon: Globe, component: SocialTab }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Professional vCard Generator
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Create comprehensive digital business cards with QR codes
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-300">Operation completed successfully!</span>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-300">{errors.general}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              {/* Tab Navigation */}
              <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                        }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {tabs.find(tab => tab.id === activeTab)?.component()}
              </div>
            </div>

            {/* Preview Section Below Form */}
            {showPreview && (
              <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div
                  className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                  onClick={() => setPreviewExpanded(!previewExpanded)}
                >
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Business Card Preview</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPreviewModal(true);
                      }}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    {previewExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                </div>
                {previewExpanded && (
                  <div className="p-6">
                    <ProfessionalCardPreview />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Buttons */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={previewVCard}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      Preview vCard
                    </>
                  )}
                </button>

                <button
                  onClick={downloadVCard}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download vCard
                </button>

                <button
                  onClick={copyToClipboard}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Copy className="w-5 h-5 mr-2" />
                  Copy to Clipboard
                </button>

                <button
                  onClick={generateQRCodeImage}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Generate QR Code
                </button>
              </div>
            </div>

            {/* Quick Preview in Sidebar */}
            {showPreview && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Quick Preview</h3>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/40 dark:to-slate-800/40 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start space-x-3 mb-4">
                    {formData.photo && (
                      <img
                        src={formData.photo}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {[formData.prefix, formData.firstName, formData.middleName, formData.lastName, formData.suffix]
                          .filter(Boolean).join(' ') || 'Full Name'}
                      </h4>
                      {formData.title && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{formData.title}</p>
                      )}
                      {formData.organization && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{formData.organization}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {formData.email && (
                      <div className="flex items-center truncate">
                        <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                        {formData.email}
                      </div>
                    )}
                    {formData.phone && (
                      <div className="flex items-center truncate">
                        <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                        {formData.phone}
                      </div>
                    )}
                    {formData.website && (
                      <div className="flex items-center truncate">
                        <Globe className="w-3 h-3 mr-2 flex-shrink-0" />
                        {formData.website}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* vCard Raw Data */}
            {generatedVCard && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">vCard Data</h3>
                <textarea
                  ref={vCardTextareaRef}
                  value={generatedVCard}
                  readOnly
                  rows="6"
                  className="w-full px-3 py-2 text-xs font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg resize-none"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Raw vCard data in standard format
                </p>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">About vCards</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Compatible with all major contact applications (Outlook, Apple Contacts, Google Contacts)</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Supports photos, multiple addresses, social links, and custom fields</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Easy sharing via email, messaging, or QR codes</p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p>Automatically imports when opened on any device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Business Card Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <ProfessionalCardPreview isModal={true} />
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={downloadVCard}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download vCard
              </button>
              <button
                onClick={generateQRCodeImage}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrCodeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">QR Code for vCard</h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mb-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for vCard"
                  className="mx-auto border border-slate-200 dark:border-slate-700 rounded-lg"
                  style={{ maxWidth: '300px', width: '100%' }}
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Scan this QR code with any smartphone camera to instantly add the contact information to your phone.
              </p>
              <div className="flex space-x-3 justify-center">
                <a
                  href={qrCodeUrl}
                  download="vcard-qr-code.png"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </a>
                <button
                  onClick={() => {
                    // Copy QR code URL to clipboard
                    navigator.clipboard.writeText(qrCodeUrl).then(() => {
                      setShowSuccess(true);
                      setTimeout(() => setShowSuccess(false), 3000);
                    });
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p><strong>How to use:</strong></p>
                <p>• Open your phone's camera app</p>
                <p>• Point the camera at the QR code</p>
                <p>• Tap the notification that appears</p>
                <p>• The contact will be added automatically</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SEO Content ── */}
      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-5 pb-10">

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online vCard Generator — Create Digital Business Cards Instantly</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            A vCard is a digital business card. It is a standard file format (.vcf) that stores contact information — name, phone numbers, email addresses, websites, physical addresses, social media links, and more. When someone opens a vCard file on their phone, tablet, or computer, the contact is automatically added to their address book. No manual typing needed.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            This free vCard Generator lets you create professional vCards directly in your browser. Fill in your personal details, contact information, professional info, home and work addresses, social media links, custom fields, and notes. The tool validates your data, formats everything according to the vCard 3.0 standard, and lets you download the .vcf file, copy the raw data to your clipboard, or generate a QR code that anyone can scan to instantly save your contact.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            The interface is organized into five tabs — Personal, Contact, Professional, Address, and Social & Notes — so you can fill in exactly the information you need without being overwhelmed. A live preview shows you how your business card will look. You can expand it into a full-screen modal for a detailed view before downloading.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            vCards are used by professionals, freelancers, sales teams, recruiters, and anyone who shares contact information regularly. Instead of exchanging paper business cards that get lost, you can share a .vcf file via email, messaging apps, or QR code. The recipient scans or opens it, and your full contact details are saved instantly. All processing runs in your browser. No data is sent to any server. No account required.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { t: 'Comprehensive Contact Fields', c: 'text-blue-600 dark:text-blue-400', b: 'Name with prefix/suffix, nickname, personal and work emails, phone, mobile, fax, personal and work websites. Everything a professional contact needs.' },
              { t: 'Home & Work Addresses', c: 'text-violet-600 dark:text-violet-400', b: 'Separate fields for home and work addresses with street, city, state, ZIP code, and country. Both are included in the vCard output.' },
              { t: 'Social Media Links', c: 'text-emerald-600 dark:text-emerald-400', b: 'Add unlimited social media profiles with custom platform names and URLs. Pre-loaded with LinkedIn, Twitter, and GitHub.' },
              { t: 'QR Code Generation', c: 'text-amber-600 dark:text-amber-400', b: 'Generate a scannable QR code containing your full vCard data. Anyone can scan it with their phone camera to instantly save your contact.' },
              { t: 'Download & Copy', c: 'text-rose-600 dark:text-rose-400', b: 'Download your vCard as a .vcf file or copy the raw data to your clipboard. Share it via email, messaging, or embed it on your website.' },
              { t: 'Professional Preview', c: 'text-indigo-600 dark:text-indigo-400', b: 'See a styled business card preview before downloading. Expand it to full-screen modal view with download and QR code buttons.' },
            ].map(({ t, c, b }) => (
              <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this vCard generator free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
              { q: 'What is a vCard (.vcf) file?', a: 'A vCard is a standard file format for digital business cards. It stores contact information and is supported by all major contact apps including Outlook, Apple Contacts, and Google Contacts.' },
              { q: 'Does it send my data to a server?', a: 'No. All processing happens in your browser. Nothing is uploaded or stored anywhere.' },
              { q: 'Can I add social media links?', a: 'Yes. You can add unlimited social media profiles with custom platform names and URLs.' },
              { q: 'Does it generate QR codes?', a: 'Yes. Click Generate QR Code to create a scannable QR code containing your full vCard data.' },
              { q: 'What vCard version does it use?', a: 'vCard 3.0, which is the most widely supported version across all platforms and devices.' },
              { q: 'Can I add custom fields?', a: 'Yes. The Social & Notes tab lets you add unlimited custom fields with any label and value.' },
              { q: 'Does it work on mobile?', a: 'Yes. The interface is fully responsive with a tabbed layout that works on any screen size.' },
            ].map(({ q, a }) => (
              <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                  <span>{q}</span>
                  <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                </summary>
                <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VCardGenerator; 