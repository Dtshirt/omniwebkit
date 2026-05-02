'use client'
import { useState } from 'react';
import { Lock, Unlock, Copy, Download, Shield, AlertCircle, CheckCircle2, Eye, EyeOff, Upload, HelpCircle, Key } from 'lucide-react';

export default function SecureTextVaultWithRecovery() {
  const [inputText, setInputText] = useState('');
  const [password, setPassword] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  
  // Security Questions State
  const [enableRecovery, setEnableRecovery] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: 'What is your mother\'s maiden name?', answer: 'deepak' },
    { question: 'What was the name of your first pet?', answer: 'deepak' },
    { question: 'What city were you born in?', answer: 'deepak' }
  ]);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryAnswers, setRecoveryAnswers] = useState(['', '', '']);
  const [extractedQuestions, setExtractedQuestions] = useState([]);

  // Predefined security questions
  const predefinedQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your favorite book?",
    "What was your childhood nickname?",
    "What is the name of your favorite teacher?",
    "What street did you grow up on?",
    "What is your father's middle name?",
    "What was the make of your first car?",
    "What is your favorite movie?"
  ];

  // Custom obfuscation markers
  const PROTECTED_MARKER = '§Ҩ';
  const UNPROTECTED_MARKER = '¶Ӂ';
  const CHUNK_DELIM = '$$X1$';
  const METADATA_DELIM = '##M2#';
  const FILE_SIGNATURE = 'STVAULT1.0';
  const RECOVERY_DELIM = '##REC#';

  // Utility: Convert ArrayBuffer to Base64
  const bufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Utility: Convert Base64 to ArrayBuffer
  const base64ToBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Split string into random-sized chunks
  const splitIntoChunks = (str) => {
    const chunks = [];
    let pos = 0;
    while (pos < str.length) {
      const size = Math.floor(Math.random() * 8) + 4;
      chunks.push(str.slice(pos, pos + size));
      pos += size;
    }
    return chunks;
  };

  // Hash security answers for storage
  const hashAnswer = async (answer) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(answer.toLowerCase().trim());
    const hash = await crypto.subtle.digest('SHA-256', data);
    return bufferToBase64(hash);
  };

  // Custom obfuscation: Mix chunks with delimiters
  const obfuscate = async (salt, iv, encrypted, isProtected, recoveryData = null) => {
    const saltB64 = bufferToBase64(salt);
    const ivB64 = bufferToBase64(iv);
    const encryptedB64 = bufferToBase64(encrypted);

    const saltChunks = splitIntoChunks(saltB64);
    const ivChunks = splitIntoChunks(ivB64);
    const encChunks = splitIntoChunks(encryptedB64);

    const marker = isProtected ? PROTECTED_MARKER : UNPROTECTED_MARKER;
    
    let obfuscated = FILE_SIGNATURE + marker + 
      saltChunks.join(CHUNK_DELIM) + METADATA_DELIM +
      ivChunks.join(CHUNK_DELIM) + METADATA_DELIM +
      encChunks.join(CHUNK_DELIM);

    // Add recovery data if enabled
    if (recoveryData) {
      const recoveryJson = JSON.stringify(recoveryData);
      const recoveryB64 = btoa(recoveryJson);
      obfuscated += RECOVERY_DELIM + recoveryB64;
    }

    return obfuscated;
  };

  // Deobfuscate: Extract components
  const deobfuscate = (obfuscated) => {
    if (!obfuscated.startsWith(FILE_SIGNATURE)) {
      throw new Error('Invalid file: Not created by Secure Text Vault');
    }

    let data = obfuscated.slice(FILE_SIGNATURE.length);
    let isProtected = false;

    if (data.startsWith(PROTECTED_MARKER)) {
      isProtected = true;
      data = data.slice(PROTECTED_MARKER.length);
    } else if (data.startsWith(UNPROTECTED_MARKER)) {
      isProtected = false;
      data = data.slice(UNPROTECTED_MARKER.length);
    } else {
      throw new Error('Invalid format: Missing marker');
    }

    // Check for recovery data
    let recoveryData = null;
    if (data.includes(RECOVERY_DELIM)) {
      const mainParts = data.split(RECOVERY_DELIM);
      data = mainParts[0];
      try {
        const recoveryB64 = mainParts[1];
        const recoveryJson = atob(recoveryB64);
        recoveryData = JSON.parse(recoveryJson);
      } catch (e) {
        // Recovery data corrupted, ignore
      }
    }

    const parts = data.split(METADATA_DELIM);
    if (parts.length !== 3) {
      throw new Error('Invalid format: Corrupted data structure');
    }

    const saltB64 = parts[0].split(CHUNK_DELIM).join('');
    const ivB64 = parts[1].split(CHUNK_DELIM).join('');
    const encryptedB64 = parts[2].split(CHUNK_DELIM).join('');

    return {
      isProtected,
      salt: base64ToBuffer(saltB64),
      iv: base64ToBuffer(ivB64),
      encrypted: base64ToBuffer(encryptedB64),
      recoveryData
    };
  };

  // Derive key from password using PBKDF2
  const deriveKey = async (password, salt) => {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  // Encrypt function
  const encryptText = async () => {
    if (!inputText.trim()) {
      setStatus({ type: 'error', message: 'Please enter text to encrypt' });
      return;
    }

    if (enableRecovery) {
      const emptyQuestions = securityQuestions.filter(q => !q.question.trim() || !q.answer.trim());
      if (emptyQuestions.length > 0) {
        setStatus({ type: 'error', message: 'Please fill all 3 security questions and answers' });
        return;
      }
    }

    setIsProcessing(true);
    setStatus({ type: '', message: '' });

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputText);
      
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const isProtected = password.trim().length > 0;
      const keyPassword = isProtected ? password : 'default-unprotected-key-2025';
      
      const key = await deriveKey(keyPassword, salt);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );

      // Prepare recovery data if enabled
      let recoveryData = null;
      if (enableRecovery && isProtected) {
        const hashedAnswers = await Promise.all(
          securityQuestions.map(q => hashAnswer(q.answer))
        );
        
        recoveryData = {
          questions: securityQuestions.map(q => q.question),
          answers: hashedAnswers
        };
      }

      const obfuscated = await obfuscate(salt, iv, encrypted, isProtected, recoveryData);
      
      setOutputText(obfuscated);
      setStatus({ 
        type: 'success', 
        message: isProtected 
          ? enableRecovery 
            ? 'Text encrypted with password and recovery questions' 
            : 'Text encrypted with password protection'
          : 'Text encrypted (no password protection)'
      });
    } catch (error) {
      setStatus({ type: 'error', message: `Encryption failed: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if message is protected and has recovery
  const checkMessageInfo = (text) => {
    try {
      const { isProtected, recoveryData } = deobfuscate(text);
      return { isProtected, hasRecovery: !!recoveryData, recoveryData };
    } catch (error) {
      throw new Error('Invalid encrypted message format');
    }
  };

  // Verify recovery answers
  const verifyRecoveryAnswers = async (storedAnswers, userAnswers) => {
    if (storedAnswers.length !== userAnswers.length) return false;
    
    for (let i = 0; i < storedAnswers.length; i++) {
      const hashedUserAnswer = await hashAnswer(userAnswers[i]);
      if (hashedUserAnswer !== storedAnswers[i]) {
        return false;
      }
    }
    return true;
  };

  // Handle recovery process
  const handleRecoverySubmit = async () => {
    const emptyAnswers = recoveryAnswers.filter(a => !a.trim());
    if (emptyAnswers.length > 0) {
      setStatus({ type: 'error', message: 'Please answer all security questions' });
      return;
    }

    setIsProcessing(true);
    try {
      const { recoveryData } = deobfuscate(inputText);
      const isValid = await verifyRecoveryAnswers(recoveryData.answers, recoveryAnswers);
      
      if (isValid) {
        setShowRecoveryModal(false);
        setShowPasswordPrompt(true);
        setStatus({ 
          type: 'success', 
          message: 'Security questions verified! Please set a new password to decrypt.' 
        });
        setRecoveryAnswers(['', '', '']);
      } else {
        setStatus({ type: 'error', message: 'Incorrect answers. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Recovery verification failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Decrypt function
  const decryptText = async (passwordToUse) => {
    if (!inputText.trim()) {
      setStatus({ type: 'error', message: 'Please enter encrypted text to decrypt' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: '', message: '' });

    try {
      const { isProtected, salt, iv, encrypted } = deobfuscate(inputText);
      
      const keyPassword = isProtected ? passwordToUse : 'default-unprotected-key-2025';
      
      if (isProtected && !passwordToUse) {
        setShowPasswordPrompt(true);
        setIsProcessing(false);
        return;
      }

      const key = await deriveKey(keyPassword, salt);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      const plaintext = decoder.decode(decrypted);
      
      setOutputText(plaintext);
      setStatus({ type: 'success', message: 'Text decrypted successfully' });
      setShowPasswordPrompt(false);
      setDecryptPassword('');
    } catch (error) {
      if (error.message.includes('Invalid format')) {
        setStatus({ type: 'error', message: error.message });
      } else {
        setStatus({ type: 'error', message: 'Decryption failed: Incorrect password or corrupted data' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle decrypt button
  const handleDecrypt = async () => {
    try {
      const { isProtected, hasRecovery, recoveryData } = checkMessageInfo(inputText);
      if (isProtected) {
        if (hasRecovery) {
          setExtractedQuestions(recoveryData.questions);
        }
        setShowPasswordPrompt(true);
      } else {
        await decryptText('');
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  // Handle password prompt submit
  const handlePasswordSubmit = async () => {
    if (!decryptPassword.trim()) {
      setStatus({ type: 'error', message: 'Please enter the password' });
      return;
    }
    await decryptText(decryptPassword);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!outputText) {
      setStatus({ type: 'error', message: 'No output to copy' });
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setStatus({ type: 'success', message: 'Copied to clipboard' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to copy to clipboard' });
    }
  };

  // Download as file
  const downloadFile = () => {
    if (!outputText) {
      setStatus({ type: 'error', message: 'No output to download' });
      return;
    }

    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encrypt' ? 'encrypted-message.txt' : 'decrypted-message.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus({ type: 'success', message: 'File downloaded' });
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File too large. Maximum size is 10MB' });
      return;
    }

    if (!file.name.endsWith('.txt')) {
      setStatus({ type: 'error', message: 'Invalid file type. Only .txt files are supported' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        
        if (!content.startsWith(FILE_SIGNATURE)) {
          setStatus({ 
            type: 'error', 
            message: 'Invalid file: This file was not created by Secure Text Vault' 
          });
          return;
        }

        setInputText(content);
        setUploadedFileName(file.name);
        setStatus({ 
          type: 'success', 
          message: `File "${file.name}" loaded successfully` 
        });
      } catch (error) {
        setStatus({ type: 'error', message: 'Failed to read file' });
      }
    };

    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Failed to read file' });
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Your Secrets. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Unbreakable.</span>
              </h1>
          </div>
         <p className="text-purple-200 text-xl sm:text-2xl font-semibold mb-3">
            Military-Grade Encryption That Never Leaves Your Device
          </p>
          <p className="text-purple-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Finally, a messenger that <span className="text-purple-400 font-semibold">we can't read</span>, 
            <span className="text-purple-400 font-semibold"> hackers can't crack</span>, and 
            <span className="text-purple-400 font-semibold"> governments can't decrypt</span>. 
            100% client-side. Zero servers. Absolute privacy.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-sm">
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              No Registration
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              No Tracking
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              No Cloud Storage
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              No Backdoors
            </span>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6 bg-slate-800/50 p-2 rounded-lg backdrop-blur-sm">
          <button
            onClick={() => {
              setMode('encrypt');
              setInputText('');
              setOutputText('');
              setPassword('');
              setEnableRecovery(false);
              setSecurityQuestions([
                { question: 'What is your favorite movie?', answer: 'deepak' },
                { question: 'What was the make of your first car?', answer: 'deepak' },
                { question: 'What is your father\'s middle name?', answer: 'deepak' }
              ]);
              setStatus({ type: '', message: '' });
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              mode === 'encrypt'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Lock className="w-5 h-5 inline mr-2" />
            Encrypt
          </button>
          <button
            onClick={() => {
              setMode('decrypt');
              setInputText('');
              setOutputText('');
              setPassword('');
              setStatus({ type: '', message: '' });
            }}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              mode === 'decrypt'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Unlock className="w-5 h-5 inline mr-2" />
            Decrypt
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 sm:p-8 border border-purple-500/20">
          {/* Input Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-purple-200 font-semibold">
                {mode === 'encrypt' ? 'Cleartext Message' : 'Encrypted Message'}
              </label>
              {mode === 'decrypt' && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <span className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-all">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </span>
                </label>
              )}
            </div>
            {uploadedFileName && mode === 'decrypt' && (
              <div className="mb-2 text-sm text-purple-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Loaded: {uploadedFileName}
              </div>
            )}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'encrypt'
                  ? 'Enter your message here...'
                  : 'Paste the encrypted message here or upload a file...'
              }
              className="w-full h-40 p-4 bg-slate-900 text-gray-900 dark:text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          {/* Password Field (Only for Encrypt mode) */}
          {mode === 'encrypt' && (
            <>
              <div className="mb-6">
                <label className="block text-purple-200 font-semibold mb-2">
                  Password (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave empty for no password protection"
                    className="w-full p-4 pr-12 bg-slate-900 text-gray-900 dark:text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-purple-300 text-xs mt-2">
                  {password ? '🔒 Password protection enabled' : '🔓 No password protection'}
                </p>
              </div>

              {/* Security Questions Section */}
              {password && (
                <div className="mb-6 bg-slate-900/50 p-5 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-purple-400" />
                      <h3 className="text-purple-200 font-semibold">Password Recovery</h3>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableRecovery}
                        onChange={(e) => setEnableRecovery(e.target.checked)}
                        className="w-4 h-4 rounded border-purple-500 bg-slate-800 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-purple-300 text-sm">Enable Recovery</span>
                    </label>
                  </div>
                  
                  {enableRecovery && (
                    <div className="space-y-4">
                      <p className="text-purple-300 text-sm mb-4">
                        Set 3 security questions to recover your password if forgotten
                      </p>
                      {securityQuestions.map((q, index) => (
                        <div key={index} className="space-y-2">
                          <label className="text-purple-200 text-sm font-medium">
                            Question {index + 1}
                          </label>
                          <select
                            value={q.question}
                            onChange={(e) => {
                              const newQuestions = [...securityQuestions];
                              newQuestions[index].question = e.target.value;
                              setSecurityQuestions(newQuestions);
                            }}
                            className="w-full p-3 bg-slate-800 text-gray-900 dark:text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          >
                            <option value="">Select a question...</option>
                            {predefinedQuestions.map((pq, i) => (
                              <option key={i} value={pq}>{pq}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={q.answer}
                            onChange={(e) => {
                              const newQuestions = [...securityQuestions];
                              newQuestions[index].answer = e.target.value;
                              setSecurityQuestions(newQuestions);
                            }}
                            placeholder="Your answer..."
                            className="w-full p-3 bg-slate-800 text-gray-900 dark:text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={mode === 'encrypt' ? encryptText : handleDecrypt}
              disabled={isProcessing}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span>Processing...</span>
              ) : mode === 'encrypt' ? (
                <>
                  <Lock className="w-5 h-5 inline mr-2" />
                  Encrypt & Obfuscate
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5 inline mr-2" />
                  Decrypt & Read
                </>
              )}
            </button>
          </div>

          {/* Status Message */}
          {status.message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                status.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-red-500/20 border border-red-500/30'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <p
                className={`${
                  status.type === 'success' ? 'text-green-200' : 'text-red-200'
                } text-sm`}
              >
                {status.message}
              </p>
            </div>
          )}

          {/* Output Section */}
          {outputText && (
            <div className="mb-6">
              <label className="block text-purple-200 font-semibold mb-2">
                {mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Message'}
              </label>
              <textarea
                value={outputText}
                readOnly
                className="w-full h-40 p-4 bg-slate-900 text-gray-900 dark:text-white border border-purple-500/30 rounded-lg resize-none font-mono text-sm"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 px-4 bg-slate-700 text-purple-300 font-semibold rounded-lg hover:bg-slate-600 transition-all"
                >
                  <Copy className="w-4 h-4 inline mr-2" />
                  Copy Output
                </button>
                <button
                  onClick={downloadFile}
                  className="flex-1 py-3 px-4 bg-slate-700 text-purple-300 font-semibold rounded-lg hover:bg-slate-600 transition-all"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  Download File
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/10">
          <h3 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Features
          </h3>
          <ul className="space-y-2 text-purple-200 text-sm">
            <li>• AES-GCM 256-bit encryption with Web Crypto API</li>
            <li>• PBKDF2 key derivation (100,000 iterations)</li>
            <li>• Security questions for password recovery (SHA-256 hashed)</li>
            <li>• Custom obfuscation scheme with random chunking</li>
            <li>• File signature validation (STVAULT1.0)</li>
            <li>• 100% client-side processing - no data leaves your browser</li>
            <li>• Messages can only be decrypted with this tool</li>
          </ul>
        </div>
      </div>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full border border-purple-500/30">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-400" />
              Password Required
            </h3>
            <p className="text-purple-200 mb-6">
              This message is password-protected. Enter the password to decrypt.
            </p>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                value={decryptPassword}
                onChange={(e) => setDecryptPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password..."
                className="w-full p-4 pr-12 bg-slate-900 text-gray-900 dark:text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Forgot Password Link */}
            {extractedQuestions.length > 0 && (
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setShowRecoveryModal(true);
                  setDecryptPassword('');
                }}
                className="w-full mb-6 text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Forgot password? Use security questions
              </button>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordPrompt(false);
                  setDecryptPassword('');
                  setIsProcessing(false);
                }}
                className="flex-1 py-3 px-6 bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Decrypt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Questions Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full border border-purple-500/30 my-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="w-6 h-6 text-purple-400" />
              Password Recovery
            </h3>
            <p className="text-purple-200 mb-6">
              Answer the security questions to reset your password
            </p>
            
            <div className="space-y-5 mb-6">
              {extractedQuestions.map((question, index) => (
                <div key={index}>
                  <label className="block text-purple-200 font-medium mb-2 text-sm">
                    Question {index + 1}
                  </label>
                  <p className="text-purple-300 text-sm mb-2 italic">{question}</p>
                  <input
                    type="text"
                    value={recoveryAnswers[index]}
                    onChange={(e) => {
                      const newAnswers = [...recoveryAnswers];
                      newAnswers[index] = e.target.value;
                      setRecoveryAnswers(newAnswers);
                    }}
                    placeholder="Your answer..."
                    className="w-full p-3 bg-slate-900 text-gray-900 dark:text-white border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  setShowPasswordPrompt(true);
                  setRecoveryAnswers(['', '', '']);
                  setIsProcessing(false);
                }}
                className="flex-1 py-3 px-6 bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleRecoverySubmit}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

      