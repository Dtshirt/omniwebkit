import {
  Image,
  FileText,
  Clock,
  Type,
  Calculator,
  Code,
  Settings,
  Zap,
  Palette,
  QrCode,
  Hash,
  Globe,
  Scissors,
  RotateCw,
  Download,
  Upload,
  Compress,
  Eye,
  Lock,
  Unlock,
  FileSignature,
  Repeat,      // .htaccess Generator
  FileSpreadsheet, // Invoice Generator
  Receipt,         // Receipt Generator
  Network,          // YouTube Thumbnail Downloader
  Contact,
  Square,
  Grid,
  Shield,
  Link,
  Search,
  Keyboard,
  FileCode,
  Volume2,
  Dices,
  Target,
  EyeOff,
  PenTool,
  PanelsTopLeft,
  PlayCircle,
  FileArchive,
  Divide,
  Grid3x3,
  DollarSign,
  RefreshCw,
  Sigma,
  Video,
  MapPin,
  Fingerprint,
  Send,
  Database,
  SplitSquareHorizontal,
  FileImage,
  Mail,
  Link2,
  Bot,
  Ratio,
  Code2,
  TerminalSquare,
  KeyRound,
  Laptop,
  ShieldAlert,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const categories = [
  {
    id: 'all',
    name: 'All Tools',
    icon: Zap,
    description: 'Browse all available tools',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    seoContent: 'Explore our complete collection of free online tools. From image converters and PDF editors to developer utilities and math calculators, OmniWebKit offers everything you need to boost your productivity without registration or software installation. Our tools are designed to be fast, secure, and easy to use directly in your browser.'
  },
  {
    id: 'image',
    name: 'Image Tools',
    icon: Image,
    description: 'Edit, convert, and optimize images',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    seoContent: 'Discover our comprehensive suite of free online image tools. Easily convert image formats, compress file sizes without losing quality, resize, crop, and remove backgrounds with our fast, browser-based utilities. Optimized for WebP, JPG, PNG, and HEIC, our tools help you manage your visual content effortlessly.'
  },
  {
    id: 'file',
    name: 'File & Document',
    icon: FileText,
    description: 'Convert and manage documents',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    seoContent: 'Manage your documents securely with our free online file tools. Convert Word documents to PDF, merge multiple PDFs into one, compress large documents for email, and generate professional invoices or certificates directly in your browser without any data leaving your device.'
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    icon: Clock,
    description: 'Time zones, calculators, and timers',
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
    seoContent: 'Stay on top of time with our free online date and time tools. Calculate exact ages in years, months, and days, convert seamlessly between global time zones like EST, PST, and IST, and manage your schedules precisely with our collection of time utilities.'
  },
  {
    id: 'text',
    name: 'Text & Writing',
    icon: Type,
    description: 'Format, analyze, and generate text',
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    seoContent: 'Enhance your writing and formatting with our free online text tools. Count words and characters for SEO, change text case effortlessly, generate highly secure random passwords, and format your strings seamlessly using our secure, client-side text utilities.'
  },
  {
    id: 'math',
    name: 'Math & Calculator',
    icon: Calculator,
    description: 'Calculators and mathematical tools',
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    seoContent: 'Solve complex mathematical problems with our free online calculators. Whether you need to calculate percentages, solve quadratic equations, project compound interest for investments, or perform advanced matrix operations, our math tools provide instant and accurate results.'
  },
  {
    id: 'web',
    name: 'Web & Development',
    icon: Code,
    description: 'Developer tools and utilities',
    color: 'bg-gradient-to-r from-teal-500 to-blue-500',
    seoContent: 'Streamline your web development workflow with our free online web tools. Minify HTML for faster load times, format and validate JSON data, generate complex CSS grids and shadows visually, and extract structured website content securely and efficiently.'
  },
  {
    id: 'misc',
    name: 'Miscellaneous',
    icon: Settings,
    description: 'QR codes, converters, and more',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    seoContent: 'Explore our versatile collection of miscellaneous online utilities. Generate custom QR codes for links and text, convert between various measurement units, test your keyboard for ghosting, and create optimized AI prompts with our diverse set of free tools.'
  },
  {
    id: 'games',
    name: 'Games & Fun Tools',
    icon: Dices,
    description: 'Randomizers, decision makers, and fun utilities',
    color: 'bg-gradient-to-r from-violet-500 to-purple-500',
    seoContent: 'Take a break with our fun online tools and decision makers. Whether you need to roll virtual dice for a game, flip coins to settle a bet, or use our decision maker to make random choices instantly, our interactive utilities are ready to assist.'
  },
  {
    id: 'media',
    name: 'Media Tools',
    icon: Video,
    description: 'Video, audio, and image processing utilities',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    seoContent: 'Process your digital media files effortlessly with our free media tools. Download high-quality YouTube thumbnails, compress videos for social media sharing, and manipulate visual content directly in your browser without any expensive software.'
  },
  {
    id: 'seo',
    name: 'SEO Tools',
    icon: Globe,
    description: 'Optimize your website for search engines',
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    seoContent: 'Improve your website rankings with our free online SEO tools. Generate comprehensive XML sitemaps, audit your backlinks, extract valuable meta tags from competitors, and optimize your digital presence effectively for search engines like Google and Bing.'
  },
  {
    id: 'network',
    name: 'Network Tools',
    icon: Network,
    description: 'Network diagnostics and lookup utilities',
    color: 'bg-gradient-to-r from-slate-600 to-slate-800',
    seoContent: 'Diagnose connection issues and gather network intelligence with our free online network tools. Instantly check your public IP address, perform domain lookups, and analyze network configurations quickly and securely from any device.'
  },
  {
    id: 'dev',
    name: 'Developer Tools',
    icon: TerminalSquare,
    description: 'Utilities for software development and debugging',
    color: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    seoContent: 'Accelerate your coding and debugging with our suite of free online developer tools. Validate complex YAML configurations, test regular expression patterns safely, format raw SQL queries, and decode JSON Web Tokens (JWT) using our comprehensive programming utilities.'
  }
];

export const tools = [
  // Image Tools (25 tools)
  {
    id: 'image-converter',
    name: 'Image Converter',
    category: 'image',
    description: 'Convert between JPG, PNG, WebP, GIF, and more formats',
    icon: Repeat,
    popular: true,
    features: ['Batch conversion', 'Quality control', 'Watermark support'],
    path: '/tools/image-converter',
    tags: ['convert', 'format', 'jpg', 'png', 'webp']
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    category: 'image',
    description: 'Reduce image file size while maintaining quality',
    icon: Upload,
    popular: true,
    features: ['Lossless compression', 'Batch processing', 'Size preview'],
    path: '/tools/image-compressor',
    tags: ['compress', 'optimize', 'size', 'quality']
  },
  {
    id: 'compress-image-to-50kb',
    name: 'Compress to 50KB',
    category: 'image',
    description: 'Compress images precisely under 50KB for applications and forms',
    icon: Target,
    features: ['Exact size targeting', 'Quality balance', 'Auto-resizing'],
    path: '/tools/image-compressor/compress-image-to-50kb',
    tags: ['compress', '50kb', 'size', 'limit', 'forms']
  },
  {
    id: 'compress-image-for-whatsapp',
    name: 'WhatsApp Optimizer',
    category: 'image',
    description: 'Optimize photos to prevent WhatsApp from ruining image quality',
    icon: Send,
    features: ['HD resolution lock', 'Exif removal', 'No-blur guarantee'],
    path: '/tools/image-compressor/compress-image-for-whatsapp',
    tags: ['compress', 'whatsapp', 'optimize', 'social']
  },
  {
    id: 'bulk-image-compressor-online',
    name: 'Bulk Image Compressor',
    category: 'image',
    description: 'Batch process up to 500 images at once in your browser',
    icon: FileArchive,
    features: ['Mass upload', 'Global settings', 'Concurrent processing'],
    path: '/tools/image-compressor/bulk-image-compressor-online',
    tags: ['compress', 'bulk', 'batch', 'mass']
  },
  {
    id: 'compress-image-for-website-fast',
    name: 'Web Vitals Compressor',
    category: 'image',
    description: 'Convert and optimize images to Next-Gen WebP for faster load times',
    icon: Globe,
    features: ['WebP output', 'PageSpeed boost', 'SEO optimized'],
    path: '/tools/image-compressor/compress-image-for-website-fast',
    tags: ['compress', 'webp', 'seo', 'pagespeed', 'core web vitals']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    category: 'image',
    description: 'Resize images to specific dimensions or percentages',
    icon: RotateCw,
    features: ['Custom dimensions', 'Aspect ratio lock', 'Batch resize'],
    path: '/tools/image-resizer',
    tags: ['resize', 'dimensions', 'scale']
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    category: 'image',
    description: 'Remove background from images automatically using AI',
    icon: Scissors,
    popular: true,
    features: ['AI-powered', 'Transparent PNG', 'Batch processing'],
    path: '/tools/background-remover',
    tags: ['background', 'remove', 'transparent', 'ai']
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    category: 'image',
    description: 'Crop images to desired size and aspect ratio',
    icon: Scissors,
    features: ['Free crop', 'Preset ratios', 'Round crop'],
    path: '/tools/image-cropper',
    tags: ['crop', 'cut', 'trim']
  },
  // File & Document Tools (20 tools)
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    category: 'file',
    description: 'Compress PDF files to reduce size without losing quality',
    icon: Upload,
    popular: true,
    features: ['High compression', 'Quality levels', 'Batch processing'],
    path: '/tools/pdf-compressor',
    tags: ['pdf', 'compress', 'reduce', 'size']
  },
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    category: 'file',
    description: 'Combine multiple PDF files into one document',
    icon: FileText,
    features: ['Drag & drop order', 'Page range selection', 'Bookmarks'],
    path: '/tools/pdf-merger',
    tags: ['pdf', 'merge', 'combine', 'join']
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    category: 'file',
    description: 'Convert Word documents to PDF format',
    icon: FileText,
    popular: true,
    features: ['Preserve formatting', 'Batch conversion', 'Password protection'],
    path: '/tools/word-to-pdf',
    tags: ['word', 'pdf', 'convert', 'docx']
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    category: 'datetime',
    description: 'Calculate exact age in years, months, days, and more',
    icon: Calculator,
    features: ['Precise calculation', 'Multiple formats', 'Next birthday'],
    path: '/tools/age-calculator',
    tags: ['age', 'birthday', 'calculate', 'years']
  },
  // Text & Writing Tools (25 tools)
  {
    id: 'case-converter',
    name: 'Case Converter',
    category: 'text',
    description: 'Convert text between UPPERCASE, lowercase, Title Case, and more',
    icon: Type,
    popular: true,
    features: ['Multiple cases', 'Bulk text', 'Custom formats'],
    path: '/tools/case-converter',
    tags: ['case', 'uppercase', 'lowercase', 'title']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: 'text',
    description: 'Generate secure, random passwords with custom options',
    icon: Lock,
    popular: true,
    features: ['Custom length', 'Character sets', 'Strength meter'],
    path: '/tools/password-generator',
    tags: ['password', 'generate', 'secure', 'random']
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    category: 'text',
    description: 'Count words, characters, paragraphs, and reading time',
    icon: Hash,
    features: ['Real-time counting', 'Reading time', 'Statistics'],
    path: '/tools/word-counter',
    tags: ['word', 'count', 'characters', 'text']
  },
  // Math & Calculator Tools (20 tools)
  {
    id: 'basic-calculator',
    name: 'Basic Calculator',
    category: 'math',
    description: 'Standard calculator for basic arithmetic operations',
    icon: Calculator,
    popular: true,
    features: ['Memory functions', 'History', 'Keyboard support'],
    path: '/tools/basic-calculator',
    tags: ['calculator', 'math', 'arithmetic', 'basic']
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    category: 'math',
    description: 'Calculate percentages, ratios, and percentage changes',
    icon: Calculator,
    features: ['Multiple calculations', 'Increase/decrease', 'Ratio finder'],
    path: '/tools/percentage-calculator',
    tags: ['percentage', 'ratio', 'calculate', 'percent']
  },
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest',
    category: 'math',
    description: 'Calculate wealth growth over time with compound interest and visualizations',
    icon: TrendingUp,
    popular: true,
    features: ['Interactive charts', 'Rule of 72', 'Monthly contributions'],
    path: '/tools/compound-interest-calculator',
    tags: ['compound', 'interest', 'finance', 'calculator', 'investment']
  },
  {
    id: 'debt-payoff-calculator',
    name: 'Debt Payoff Calculator',
    category: 'math',
    description: 'Compare Avalanche vs Snowball methods with interactive payoff charts',
    icon: TrendingDown,
    popular: true,
    features: ['Avalanche method', 'Snowball method', 'Amortization schedules'],
    path: '/tools/debt-payoff-calculator',
    tags: ['debt', 'payoff', 'finance', 'calculator', 'loans']
  },
  // Web & Development Tools (30 tools)
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: 'web',
    description: 'Format, validate, and minify JSON data',
    icon: Code,
    popular: true,
    features: ['Syntax highlighting', 'Validation', 'Minify/Beautify'],
    path: '/tools/json-formatter',
    tags: ['json', 'format', 'validate', 'beautify']
  },
  {
    id: 'html-minifier',
    name: 'HTML Minifier',
    category: 'web',
    description: 'Minify HTML code for better performance',
    icon: Code,
    features: ['Remove whitespace', 'Compress', 'Preserve structure'],
    path: '/tools/html-minifier',
    tags: ['html', 'minify', 'compress', 'optimize']
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    category: 'web',
    description: 'Pick colors and generate beautiful color palettes',
    icon: Palette,
    popular: true,
    features: ['HEX, RGB, HSL', 'Palette generator', 'Gradient maker'],
    path: '/tools/color-picker',
    tags: ['color', 'picker', 'palette', 'hex', 'rgb']
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    category: 'misc',
    description: 'Generate QR codes for text, URLs, WiFi, and more',
    icon: QrCode,
    popular: true,
    features: ['Multiple types', 'Customizable', 'High resolution'],
    path: '/tools/qr-generator',
    tags: ['qr', 'code', 'generate', 'url', 'text']
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    category: 'misc',
    description: 'Convert between different units of measurement',
    icon: Repeat,
    features: ['Length, weight, temp', 'Currency', 'Multiple units'],
    path: '/tools/unit-converter',
    tags: ['unit', 'convert', 'measurement', 'length', 'weight']
  },
  {
    id: 'timezone-converter',
    name: 'World Time Zone Converter',
    category: 'datetime',
    description: 'Convert time between different time zones including EST, PST, IST, UTC and more',
    icon: Clock,
    popular: true,
    features: ['EST to PST conversion', 'IST support', 'World clock', 'Popular conversions'],
    path: '/tools/timezone-converter',
    tags: ['time', 'timezone', 'est', 'pst', 'ist', 'utc', 'convert', 'world clock']
  },
  {
    id: 'ai-prompt-generator',
    name: 'AI Prompt Generator',
    category: 'misc',
    description: 'Generate professional AI prompts for ChatGPT, Claude, content writing, SEO, social media and more',
    icon: Globe,
    popular: true,
    features: ['8+ categories', 'Professional prompts', 'Form-based input', 'Copy & download'],
    path: '/tools/ai-prompt-generator',
    tags: ['ai', 'prompt', 'chatgpt', 'claude', 'content', 'seo', 'social media', 'generator']
  },
  {
    id: 'image-watermark',
    name: 'Image Watermark Tool',
    category: 'image',
    description: 'Add text, image, or tiled watermarks to your images with full customization',
    icon: Image,
    popular: true,
    features: ['Text watermarks', 'Image watermarks', 'Tiled patterns', 'Position control'],
    path: '/tools/image-watermark',
    tags: ['watermark', 'image', 'text', 'protection', 'branding']
  },
  {
    id: 'website-content-extractor',
    name: 'Website Content Extractor',
    category: 'web',
    description: 'Extract structured content, meta tags, and SEO data from any website',
    icon: Globe,
    popular: true,
    features: ['Meta tag extraction', 'SEO analysis', 'Content structure', 'Export options'],
    path: '/tools/website-content-extractor',
    tags: ['seo', 'meta', 'scraping', 'analysis', 'website']
  },
  {
    id: 'google-dorking-tool',
    name: 'Google Dorking Tool',
    category: 'web',
    description: 'Generate advanced Google Dorks for SEO, bug bounty, and dev research',
    icon: Search,
    popular: true,
    features: ['SEO & Dev queries', 'Security Dorks', 'One-click copy', 'Direct execution'],
    path: '/tools/google-dorking-tool',
    tags: ['google', 'dorks', 'seo', 'security', 'search', 'dev']
  },
  {
    id: 'website-image-downloader',
    name: 'Website Image Downloader',
    category: 'web',
    description: 'Extract and download all images from any website URL instantly',
    icon: Image,
    popular: true,
    features: ['Extract all images', 'Bulk ZIP download', 'Lazy loading support', 'Format filtering'],
    path: '/tools/website-image-downloader',
    tags: ['images', 'download', 'bulk', 'website', 'extractor']
  },
  {
    id: 'yaml-creator-validator',
    name: 'YAML Creator & Validator',
    category: 'dev',
    description: 'Create, validate, and generate YAML files with predefined templates for deployment configurations',
    icon: FileText, // or you could use Code, Settings, or File
    popular: true,
    features: ['YAML validation', 'Template library', 'Real-time editing', 'Export options', 'Deployment configs'],
    path: '/tools/yaml-creator-validator',
    tags: ['yaml', 'validation', 'deployment', 'docker', 'kubernetes', 'ci/cd', 'templates', 'config']
  },
  {
    id: 'certificate-generator',
    name: 'Certificate Generator',
    category: 'file',
    description: 'Create custom certificates online with ease',
    icon: FileText,
    features: ['Customizable templates', 'Download as PDF/PNG', 'Easy to edit'],
    path: '/tools/certificate-generator',
    tags: ['certificate', 'document', 'create', 'generate']
  },
  {
    id: 'htaccess-generator',
    name: '.htaccess Generator',
    category: 'web',
    description: 'Generate .htaccess rules for redirects, security, and SEO',
    icon: Code,
    features: ['Redirect rules', 'Security settings', 'SEO friendly'],
    path: '/tools/htaccess-generator',
    tags: ['htaccess', 'apache', 'redirect', 'seo']
  },
  {
    id: 'invoice-generator',
    name: 'Invoice Generator',
    category: 'file',
    description: 'Generate professional invoices instantly',
    icon: FileSpreadsheet,
    features: ['Custom branding', 'Multiple currencies', 'Download as PDF'],
    path: '/tools/invoice-generator',
    tags: ['invoice', 'billing', 'finance', 'pdf']
  },
  {
    id: 'receipt-generator',
    name: 'Receipt Generator',
    category: 'file',
    description: 'Create receipts quickly for transactions',
    icon: Receipt,
    features: ['Customizable fields', 'Printable format', 'Multiple templates'],
    path: '/tools/receipt-generator',
    tags: ['receipt', 'billing', 'finance', 'proof']
  },
  {
    id: 'sitemap-url-extractor',
    name: 'Sitemap URL Extractor',
    category: 'web',
    description: 'Extract and analyze URLs from existing XML sitemaps',
    icon: FileText,
    features: ['Parse XML sitemaps', 'Export URLs', 'Sitemap analysis'],
    path: '/tools/sitemap-url-extractor',
    tags: ['sitemap', 'seo', 'xml', 'url extractor']
  },
  {
    id: 'sitemap-generator',
    name: 'Sitemap Generator',
    category: 'web',
    description: 'Generate professional XML & HTML sitemaps for your website',
    icon: FileText,
    features: ['XML sitemaps', 'HTML sitemaps', 'Priority & frequency', 'Bulk URL import'],
    path: '/tools/sitemap-generator',
    tags: ['sitemap generator', 'xml sitemap', 'html sitemap', 'seo']
  },
  {
    id: 'vcard-generator',
    name: 'vCard Generator',
    category: 'file',
    description: 'Create vCard files for sharing contacts easily',
    icon: Contact,
    features: ['Customizable fields', 'Download as VCF', 'Easy sharing'],
    path: '/tools/vcard-generator',
    tags: ['vcard', 'contact', 'vcf', 'business card']
  },
  {
    id: 'whats-my-ip',
    name: 'What\'s My IP',
    category: 'web',
    description: 'Check your public IP address instantly',
    icon: Network,
    features: ['Shows IPv4 & IPv6', 'Location details', 'Copy easily'],
    path: '/tools/whats-my-ip',
    tags: ['ip', 'address', 'network', 'public ip']
  },
  {
    id: 'youtube-thumbnail-downloader',
    name: 'YouTube Thumbnail Downloader',
    category: 'image',
    description: 'Download YouTube video thumbnails in HD quality',
    icon: Image,
    features: ['HD & SD quality', 'Fast download', 'Works with any video'],
    path: '/tools/youtube-thumbnail-downloader',
    tags: ['youtube', 'thumbnail', 'download', 'image']
  },
  {
    id: 'base64-data-uri-converter',
    name: 'Base64 Data URI Converter',
    category: 'text',
    description: 'Convert Base64 strings to Data URI format and vice versa',
    icon: FileText,
    features: ['Base64 to URI', 'URI to Base64', 'Copy with one click'],
    path: '/tools/base64-data-uri-converter',
    tags: ['base64', 'data uri', 'converter', 'encode', 'decode']
  },
  {
    id: 'json-to-csv-converter',
    name: 'JSON to CSV Converter',
    category: 'file',
    description: 'Easily convert JSON data into CSV format',
    icon: FileSpreadsheet,
    features: ['Upload & convert', 'Supports nested JSON', 'Download CSV'],
    path: '/tools/json-to-csv-converter',
    tags: ['json', 'csv', 'data', 'convert', 'export']
  },
  {
    id: 'css-shadow-generator',
    name: 'CSS Shadow Generator',
    category: 'web',
    description: 'Generate CSS box shadows with live preview',
    icon: Square,
    features: ['Custom shadow styles', 'Copy CSS code', 'Live preview'],
    path: '/tools/css-shadow-generator',
    tags: ['css', 'shadow', 'box shadow', 'generator']
  },
  {
    id: 'css-grid-generator',
    name: 'CSS Grid Generator',
    category: 'web',
    description: 'Generate CSS grid layouts visually',
    icon: Grid,
    features: ['Drag & resize', 'Export CSS code', 'Responsive support'],
    path: '/tools/css-grid-generator',
    tags: ['css', 'grid', 'layout', 'generator']
  },
  {
    id: 'secure-text-vault',
    name: 'Secure Text Vault',
    category: 'misc',
    description: 'Encrypt and store sensitive text securely',
    icon: Shield,
    features: ['AES encryption', 'Password protected', 'Copy safely', 'Secret Keeping', 'Privacy'],
    path: '/tools/secure-text-vault',
    tags: ['secure', 'text', 'vault', 'encrypt', 'safe']
  },
  {
    id: 'backlink-auditor',
    name: 'Backlink Auditor',
    category: 'web',
    description: 'Analyze and audit backlinks for better SEO performance',
    icon: Link,
    features: ['Backlink checker', 'SEO metrics', 'Export reports'],
    path: '/tools/backlink-auditor',
    tags: ['backlink', 'seo', 'links', 'audit']
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    category: 'text',
    description: 'Test and validate regular expressions with live preview',
    icon: Search,
    features: ['Live regex testing', 'Match highlighting', 'Error detection'],
    path: '/tools/regex-tester',
    tags: ['regex', 'regular expression', 'test', 'pattern']
  },
  {
    id: 'code-highlighter',
    name: 'Code Highlighter',
    category: 'web',
    description: 'Highlight code syntax in multiple programming languages',
    icon: Code,
    features: ['Multiple languages', 'Copy highlighted code', 'Custom themes'],
    path: '/tools/code-highlighter',
    tags: ['code', 'highlight', 'syntax', 'developer']
  },
  {
    id: 'keyboard-tester',
    name: 'Keyboard Tester',
    category: 'misc',
    description: 'Test all keys on your keyboard to check functionality',
    icon: Keyboard,
    features: ['Real-time key press detection', 'Visual keyboard display', 'Identify faulty keys'],
    path: '/tools/keyboard-tester',
    tags: ['keyboard', 'test', 'keys', 'hardware']
  },
  {
    id: 'format-converter',
    name: 'Format Converter',
    category: 'file',
    description: 'Convert between multiple text and file formats',
    icon: FileCode,
    features: ['Supports multiple formats', 'Fast conversion', 'Download output'],
    path: '/tools/format-converter',
    tags: ['convert', 'file', 'format', 'text']
  },
  {
    id: 'text-to-speech-converter',
    name: 'Text to Speech Converter',
    category: 'misc',
    description: 'Convert written text into natural-sounding speech',
    icon: Volume2,
    features: ['Multiple voices', 'Adjust speed & pitch', 'Download audio'],
    path: '/tools/text-to-speech-converter',
    tags: ['tts', 'speech', 'voice', 'audio', 'convert']
  },
  {
    id: 'decision-maker',
    name: 'Decision Maker',
    category: 'games',
    description: 'Wheels, coins, dice, and random choices',
    icon: Target,
    features: ['Decision Maker', 'Make Options', 'Roll Dice', 'Flip Coin'],
    path: '/tools/decision-maker',
    tags: ['decisions', 'fun', 'choice']
  },
  {
    id: 'exif-viewer-cleaner',
    name: 'Exif Viewer Cleaner',
    category: 'misc',
    description: 'Clear browser traces, sessions, and cached views easily',
    icon: EyeOff,
    features: ['Clear cache & history', 'Session cleanup', 'One-click reset'],
    path: '/tools/exif-viewer-cleaner',
    tags: ['cleaner', 'exif', 'viewer', 'cache', 'session']
  },
  {
    id: 'digital-signature-pad',
    name: 'Digital Signature Pad',
    category: 'image',
    description: 'Create and save digital signatures online with ease',
    icon: PenTool,
    features: ['Freehand drawing', 'Download as PNG/SVG', 'Clear & redraw'],
    path: '/tools/digital-signature-pad',
    tags: ['signature', 'digital', 'pad', 'draw', 'esign']
  },
  {
    id: 'glassmorphism-generator',
    name: 'Glassmorphism Generator',
    category: 'web',
    description: 'Create beautiful glassmorphism UI effects with CSS',
    icon: PanelsTopLeft,
    features: ['Custom blur & opacity', 'Color presets', 'Copy CSS instantly'],
    path: '/tools/glassmorphism-generator',
    tags: ['glassmorphism', 'css', 'ui design', 'generator', 'style']
  },
  {
    id: 'neumorphism-generator',
    name: 'Neumorphism Generator',
    category: 'web',
    description: 'Design neumorphism-style UI elements with live preview',
    icon: Square,
    features: ['Custom depth & shadows', 'Copy CSS code', 'Live preview'],
    path: '/tools/neumorphism-generator',
    tags: ['neumorphism', 'css', 'ui', 'design', 'generator']
  },
  {
    id: 'animation-generator',
    name: 'Animation Generator',
    category: 'web',
    description: 'Generate CSS animations with real-time preview',
    icon: PlayCircle,
    features: ['Custom duration & easing', 'Copy CSS code', 'Live preview'],
    path: '/tools/animation-generator',
    tags: ['css', 'animation', 'motion', 'generator']
  },
  {
    id: 'zip-file-creator',
    name: 'Zip File Creator',
    category: 'file',
    description: 'Create ZIP archives from multiple files online',
    icon: FileArchive,
    features: ['Upload multiple files', 'Compress to ZIP', 'Download instantly'],
    path: '/tools/zip-file-creator',
    tags: ['zip', 'compress', 'archive', 'file']
  },
  {
    id: 'quadratic-equation-solver',
    name: 'Quadratic Equation Solver',
    category: 'math',
    description: 'Solve quadratic equations and find roots instantly',
    icon: Divide,
    features: ['Step-by-step solution', 'Real & complex roots', 'Graph preview'],
    path: '/tools/quadratic-equation-solver',
    tags: ['quadratic', 'equation', 'solver', 'math']
  },
  {
    id: 'matrix-calculator',
    name: 'Matrix Calculator',
    category: 'math',
    description: 'Perform matrix operations like addition, multiplication, and inverse',
    icon: Grid3x3,
    features: ['Matrix addition & multiplication', 'Determinant & inverse', 'Supports large matrices'],
    path: '/tools/matrix-calculator',
    tags: ['matrix', 'calculator', 'math', 'algebra']
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    category: 'misc',
    description: 'Convert between different world currencies with real-time rates',
    icon: DollarSign,
    features: ['Real-time exchange rates', 'Multiple currencies', 'Fast conversion'],
    path: '/tools/currency-converter',
    tags: ['currency', 'converter', 'exchange', 'money']
  },
  {
    id: 'text-reverser',
    name: 'Text Reverser',
    category: 'text',
    description: 'Reverse any text or string instantly',
    icon: RefreshCw,
    features: ['Reverse words or letters', 'Copy with one click', 'Simple & fast'],
    path: '/tools/text-reverser',
    tags: ['text', 'reverse', 'string', 'tool']
  },
  {
    id: 'equation-solver',
    name: 'Equation Solver',
    category: 'math',
    description: 'Solve linear, quadratic, and higher-order equations instantly',
    icon: Sigma,
    features: ['Supports multiple equation types', 'Step-by-step solutions', 'Handles real & complex numbers'],
    path: '/tools/equation-solver',
    tags: ['equation', 'solver', 'math', 'algebra']
  },
  {
    id: 'video-compressor',
    name: 'Video Compressor',
    category: 'file',
    description: 'Compress videos online without losing quality - works entirely in your browser',
    icon: Video,
    features: ['Client-side processing', 'Multiple quality presets', 'MP4 & WebM support', 'Real-time progress tracking'],
    path: '/tools/video-compressor',
    tags: ['video', 'compress', 'media', 'optimization', 'file-size', 'mp4', 'webm', 'ffmpeg']
  },
  {
    id: 'pdf-editor',
    name: 'PDF Editor',
    category: 'file',
    description: 'Edit PDF files online — add text, draw, highlight, insert images, and more',
    icon: FileText,
    features: ['Add & edit text', 'Freehand drawing', 'Shapes & highlights', 'Insert images', 'Page management'],
    path: '/tools/pdf-editor',
    tags: ['pdf', 'editor', 'annotate', 'text', 'draw', 'highlight']
  },
  {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    category: 'math',
    description: 'Calculate Body Mass Index with health insights, body fat estimate, and BMR',
    icon: Calculator,
    popular: true,
    features: ['Metric & Imperial', 'Body fat estimate', 'BMR calculation', 'Health classification'],
    path: '/tools/bmi-calculator',
    tags: ['bmi', 'body mass index', 'health', 'weight', 'fitness', 'calculator']
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    category: 'dev',
    description: 'Decode and inspect JSON Web Tokens — view header, payload, and expiration',
    icon: Code,
    features: ['Color-coded parts', 'Claims table', 'Expiration check', 'Sample tokens'],
    path: '/tools/jwt-decoder',
    tags: ['jwt', 'token', 'decode', 'json', 'auth', 'developer']
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    category: 'file',
    description: 'Convert PDF pages to PNG, JPG, or WebP images with quality control',
    icon: Image,
    popular: true,
    features: ['PNG, JPG, WebP', 'Resolution control', 'Page selection', 'Batch download'],
    path: '/tools/pdf-to-image',
    tags: ['pdf', 'image', 'convert', 'png', 'jpg', 'webp']
  },
  {
    id: 'typing-speed-test',
    name: 'Typing Speed Test',
    category: 'games',
    description: 'Test your typing speed and accuracy with real-time WPM tracking',
    icon: Keyboard,
    popular: true,
    features: ['WPM & accuracy', 'Difficulty levels', 'Character highlighting', 'Session history'],
    path: '/tools/typing-speed-test',
    tags: ['typing', 'speed', 'test', 'wpm', 'keyboard', 'practice']
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    category: 'dev',
    description: 'Write and preview Markdown with live rendering, toolbar, and export options',
    icon: FileCode,
    features: ['Live preview', 'Split view', 'Formatting toolbar', 'Export HTML & MD'],
    path: '/tools/markdown-editor',
    tags: ['markdown', 'editor', 'preview', 'html', 'writing', 'developer']
  },
  {
    id: 'ip-lookup',
    name: 'IP Lookup',
    category: 'dev',
    description: 'Look up IP address geolocation, ISP, timezone, and network details',
    icon: MapPin,
    features: ['Auto-detect IP', 'Geolocation map', 'ISP & timezone info', 'Copy details'],
    path: '/tools/ip-lookup',
    tags: ['ip', 'lookup', 'geolocation', 'network', 'location', 'isp']
  },
  {
    id: 'text-encrypt-decrypt',
    name: 'Text Encrypt & Decrypt',
    category: 'dev',
    description: 'Encrypt and decrypt text using AES, Caesar, ROT13, Base64, Hex, and Morse',
    icon: Lock,
    features: ['7 cipher methods', 'Encrypt & decrypt', 'Secret key support', 'Swap & copy'],
    path: '/tools/text-encrypt-decrypt',
    tags: ['encrypt', 'decrypt', 'cipher', 'aes', 'caesar', 'rot13', 'base64', 'security']
  },
  {
    id: 'utm-link-builder',
    name: 'UTM Link Builder',
    category: 'seo',
    description: 'Build UTM-tagged URLs for campaign tracking with quick presets',
    icon: Link,
    features: ['Quick presets', 'URL validation', 'Copy link', 'History tracking'],
    path: '/tools/utm-link-builder',
    tags: ['utm', 'campaign', 'tracking', 'url', 'marketing', 'analytics']
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: 'dev',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text and files',
    icon: Fingerprint,
    features: ['5 hash algorithms', 'File hashing', 'Checksum verification', 'Copy hashes'],
    path: '/tools/hash-generator',
    tags: ['hash', 'md5', 'sha', 'sha256', 'checksum', 'security', 'crypto']
  },
  {
    id: 'loan-emi-calculator',
    name: 'Loan/EMI Calculator',
    category: 'math',
    description: 'Calculate monthly EMI, total interest, and view amortization schedule',
    icon: DollarSign,
    features: ['EMI calculation', 'Amortization schedule', 'Visual breakdown', 'Multi-currency'],
    path: '/tools/loan-emi-calculator',
    tags: ['loan', 'emi', 'mortgage', 'interest', 'calculator', 'finance']
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    category: 'dev',
    description: 'Convert images to Base64 strings and decode Base64 back to images',
    icon: Image,
    features: ['Multiple output formats', 'Base64 to image', 'Drag & drop', 'Copy outputs'],
    path: '/tools/image-to-base64',
    tags: ['image', 'base64', 'encode', 'decode', 'data-url', 'developer']
  },
  {
    id: 'cron-expression-generator',
    name: 'Cron Expression Generator',
    category: 'dev',
    description: 'Build and understand cron expressions with visual editor and next run predictions',
    icon: Clock,
    features: ['Visual editor', 'Common presets', 'Human-readable description', 'Next 5 runs'],
    path: '/tools/cron-expression-generator',
    tags: ['cron', 'schedule', 'expression', 'job', 'timer', 'automation']
  },
  {
    id: 'schema-markup-generator',
    name: 'Schema Markup Generator',
    category: 'seo',
    description: 'Generate JSON-LD structured data for Organization, Product, Article, FAQ & more',
    icon: Code,
    features: ['7 schema types', 'JSON-LD output', 'Copy script tag', 'Google Rich Results link'],
    path: '/tools/schema-markup-generator',
    tags: ['schema', 'json-ld', 'structured-data', 'seo', 'markup', 'rich-results']
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    category: 'dev',
    description: 'Format, beautify, and minify SQL queries with syntax highlighting',
    icon: Database,
    features: ['Format & minify', 'Syntax highlighting', 'Sample queries', 'Copy output'],
    path: '/tools/sql-formatter',
    tags: ['sql', 'format', 'beautify', 'minify', 'query', 'database']
  },
  {
    id: 'api-tester',
    name: 'API Tester',
    category: 'dev',
    description: 'Test HTTP APIs directly from your browser with custom headers and body',
    icon: Send,
    features: ['All HTTP methods', 'Custom headers', 'Request body', 'Response viewer'],
    path: '/tools/api-tester',
    tags: ['api', 'http', 'rest', 'request', 'test', 'developer', 'postman']
  },
  {
    id: 'svg-editor',
    name: 'SVG Editor',
    category: 'image',
    description: 'Edit, preview, optimize, and export SVG graphics with live rendering',
    icon: PenTool,
    features: ['Code editor', 'Live preview', 'Shape insertion', 'Export SVG/PNG/JPG'],
    path: '/tools/svg-editor',
    tags: ['svg', 'editor', 'vector', 'graphics', 'design', 'export']
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'file',
    description: 'Convert multiple images into a single PDF document with page settings',
    icon: FileImage,
    features: ['Multiple images', 'Page size options', 'Image reordering', 'Quality control'],
    path: '/tools/image-to-pdf',
    tags: ['image', 'pdf', 'convert', 'document', 'photo']
  },
  {
    id: 'pdf-password-protector',
    name: 'PDF Password Protector',
    category: 'file',
    description: 'Add password protection to your PDF files with permission controls',
    icon: Shield,
    features: ['Password protection', 'Strength meter', 'Permission controls', 'Client-side'],
    path: '/tools/pdf-password-protector',
    tags: ['pdf', 'password', 'protect', 'encrypt', 'security']
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    category: 'file',
    description: 'Remove PDF password protection and restrictions — print, copy, and edit freely',
    icon: Unlock,
    features: ['Remove passwords', 'Unlock restrictions', 'Browser & server hybrid', 'Handles any encryption'],
    path: '/tools/unlock-pdf',
    tags: ['pdf', 'unlock', 'password', 'remove', 'decrypt', 'restrictions']
  },
  {
    id: 'pdf-sign',
    name: 'Sign Document',
    category: 'file',
    description: 'Sign PDFs and images digitally — draw, type, or upload your signature and place it anywhere',
    icon: FileSignature,
    popular: true,
    features: ['Draw signature', 'Type signature', 'Upload signature', 'Drag-to-place', 'PDF & image support'],
    path: '/tools/pdf-sign',
    tags: ['sign', 'pdf', 'esign', 'digital signature', 'electronic signature', 'document']
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    category: 'file',
    description: 'Extract text from PDF and convert to Word (.doc) document',
    icon: FileText,
    features: ['Text extraction', 'Word .doc output', 'Plain text export', 'Page-by-page view'],
    path: '/tools/pdf-to-word',
    tags: ['pdf', 'word', 'convert', 'document', 'text', 'extract']
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    category: 'file',
    description: 'Convert Excel spreadsheets and CSV files to styled PDF documents',
    icon: FileSpreadsheet,
    features: ['XLSX & CSV support', 'Multi-sheet', 'Data preview', 'Styled tables'],
    path: '/tools/excel-to-pdf',
    tags: ['excel', 'pdf', 'csv', 'spreadsheet', 'convert', 'document']
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    category: 'file',
    description: 'Convert PDF tables and documents to fully editable Excel spreadsheets',
    icon: FileSpreadsheet,
    popular: true,
    features: ['Smart Table Extraction', 'Editable XLSX Output', 'Secure Server Processing'],
    path: '/tools/pdf-to-excel',
    tags: ['pdf', 'excel', 'convert', 'spreadsheet', 'extract', 'xlsx', 'table']
  },
  {
    id: 'email-validator',
    name: 'Email Validator',
    category: 'misc',
    description: 'Validate email addresses for format, domain, disposable detection, and more',
    icon: Mail,
    features: ['Format check', 'Bulk validation', 'Disposable detection', 'Score rating'],
    path: '/tools/email-validator',
    tags: ['email', 'validate', 'verify', 'check', 'bulk', 'format']
  },
  {
    id: 'broken-link-checker',
    name: 'Broken Link Checker',
    category: 'seo',
    description: 'Find broken links on any webpage to improve SEO and user experience',
    icon: Link2,
    features: ['Page crawling', 'Status codes', 'Progress tracking', 'Export report'],
    path: '/tools/broken-link-checker',
    tags: ['broken', 'link', 'check', 'seo', 'dead', 'crawl']
  },
  {
    id: 'robots-txt-generator',
    name: 'robots.txt Generator',
    category: 'seo',
    description: 'Build a robots.txt file with presets for WordPress, Next.js, and more',
    icon: Bot,
    features: ['Quick presets', 'Multiple rules', 'Sitemap support', 'Download file'],
    path: '/tools/robots-txt-generator',
    tags: ['robots', 'txt', 'seo', 'crawl', 'search', 'engine']
  },
  {
    id: 'aspect-ratio-calculator',
    name: 'Aspect Ratio Calculator',
    category: 'math',
    description: 'Calculate and convert aspect ratios for images, video, and screens',
    icon: Ratio,
    features: ['Common ratios', 'Device presets', 'Live preview', 'Lock dimensions'],
    path: '/tools/aspect-ratio-calculator',
    tags: ['aspect', 'ratio', 'resolution', 'screen', 'video', 'image', 'calculate']
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    category: 'web',
    description: 'Create short, shareable links with custom aliases',
    icon: Link2,
    popular: true,
    features: ['Custom aliases', 'Link history', 'Copy on create', 'Local storage'],
    path: '/tools/url-shortener',
    tags: ['url', 'shortener', 'link', 'short', 'custom', 'alias']
  },
  {
    id: 'pastebin',
    name: 'Pastebin',
    category: 'dev',
    description: 'Share code snippets and text with syntax highlighting and expiry',
    icon: Code2,
    features: ['20+ languages', 'Expiry settings', 'Line numbers', 'Paste history'],
    path: '/tools/pastebin',
    tags: ['paste', 'code', 'share', 'snippet', 'text', 'syntax']
  },
  {
    id: 'public-api-directory',
    name: 'Public API Directory',
    category: 'dev',
    description: 'Discover 30+ free public APIs for your next project',
    icon: Globe,
    features: ['30+ APIs', 'Category filters', 'Auth info', 'Favorites'],
    path: '/tools/public-api-directory',
    tags: ['api', 'public', 'free', 'directory', 'rest', 'developer']
  },
  {
    id: 'youtube-downloader',
    name: 'YouTube Video Downloader',
    category: 'media',
    description: 'Get YouTube video info, download thumbnails in all sizes, and copy embed codes',
    icon: Video,
    popular: true,
    features: ['Video info extraction', 'Thumbnail downloads', 'Embed code generator', 'Third-party download links'],
    path: '/tools/youtube-downloader',
    tags: ['youtube', 'video', 'download', 'thumbnail', 'embed', 'mp4']
  },
  {
    id: 'social-media-downloader',
    name: 'Social Media Downloader',
    category: 'media',
    description: 'Download videos from Instagram, Twitter/X, and TikTok using popular services',
    icon: Download,
    popular: true,
    features: ['Instagram Reels & Posts', 'Twitter/X videos', 'TikTok without watermark', 'Auto platform detection'],
    path: '/tools/social-media-downloader',
    tags: ['instagram', 'twitter', 'tiktok', 'video', 'download', 'social media', 'reels']
  },
  {
    id: 'text-compare',
    name: 'Text Compare / Diff Viewer',
    category: 'text',
    description: 'Compare two text snippets side-by-side or inline to highlight exactly what changed',
    icon: SplitSquareHorizontal,
    popular: true,
    features: ['Side-by-side or Inline View', 'Word, Character, or Line level diff', 'Code highlighting', 'Privacy-first processing'],
    path: '/tools/text-compare',
    tags: ['text', 'diff', 'compare', 'code', 'changes', 'developer']
  },
  {
    id: 'svg-to-jsx',
    name: 'SVG to JSX Converter',
    category: 'dev',
    description: 'Instantly convert raw SVG code into fully functional React / JSX components with camelCase attributes',
    icon: Code2,
    popular: true,
    features: ['kebab-case to camelCase conversion', 'Function wrapper generation', 'TypeScript interfaces', 'Remove hardcoded sizes'],
    path: '/tools/svg-to-jsx',
    tags: ['svg', 'jsx', 'react', 'component', 'convert', 'developer', 'frontend']
  },
  {
    id: 'curl-converter',
    name: 'cURL to Fetch/Axios Converter',
    category: 'dev',
    description: 'Transform raw cURL terminal commands into executable Fetch, Axios, or Python request snippets instantly.',
    icon: TerminalSquare,
    popular: true,
    features: ['Client-side Regex Parsing', 'Fetch API generation', 'Axios code generation', 'Python Requests API'],
    path: '/tools/curl-converter',
    tags: ['curl', 'fetch', 'axios', 'python', 'requests', 'http', 'api', 'developer']
  },
  {
    id: 'video-to-gif',
    name: 'Video to GIF Converter',
    category: 'image',
    description: 'Convert MP4 or WebM videos locally into highly optimized animated GIFs directly inside your browser.',
    icon: Video,
    popular: true,
    features: ['No Server Uploads', 'Custom Resolution Scaling', 'Framerate Tuning', 'Client-side Canvas Encoding'],
    path: '/tools/video-to-gif',
    tags: ['video', 'gif', 'convert', 'animation', 'mp4', 'webm', 'resize', 'framerate', 'image']
  },
  {
    id: 'color-palette-extractor',
    name: 'Image Color Palette Extractor',
    category: 'image',
    description: 'Instantly extract dominant colors and massive UI visual palettes mathematically from uploaded images entirely offline.',
    icon: Palette,
    popular: true,
    features: ['Median Cut Algorithm', 'Tailwind CSS Export', 'CSS Variable Support', 'HEX & RGB Swatches'],
    path: '/tools/color-palette-extractor',
    tags: ['color', 'palette', 'extract', 'hex', 'rgb', 'tailwind', 'css', 'image', 'designer', 'ui']
  },
  {
    id: 'svg-to-png',
    name: 'SVG to PNG Converter',
    category: 'image',
    description: 'Instantly convert mathematical SVG vector code into perfectly scaled high-resolution PNG or WebP images purely offline.',
    icon: FileImage,
    popular: true,
    features: ['Infinite Upscaling', 'Raw XML Parsing', 'Transparent Backgrounds', 'Client-side Hardware Acceleration'],
    path: '/tools/svg-to-png',
    tags: ['svg', 'png', 'convert', 'vector', 'image', 'raster', 'webp', 'html5', 'resize', 'scale']
  },
  {
    id: 'video-metadata-extractor',
    name: 'Video Metadata Extractor',
    category: 'media',
    description: 'Instantly inspect highly advanced hidden codec properties, framerates, and exact EXIF tags natively completely mathematically inside massive physical .mp4 video matrices accurately securely offline.',
    icon: Video,
    popular: true,
    features: ['Client-Side WebAssembly Parsing', 'Unlimited File Size Chunker', 'Hidden MKV/MP4 Property Viewer', 'Total Browser Privacy Constraints'],
    path: '/tools/video-metadata-extractor',
    tags: ['video', 'metadata', 'exif', 'codec', 'framerate', 'bitrate', 'mp4', 'mkv', 'extract', 'media', 'offline']
  },
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    category: 'media',
    description: 'Convert between MP3, WAV, AAC, FLAC, OGG, and M4A formats',
    icon: Repeat,
    popular: true,
    features: ['High quality conversion', 'Multiple formats', 'Privacy-first processing'],
    path: '/tools/audio-converter',
    tags: ['audio', 'convert', 'mp3', 'wav', 'flac']
  },
  {
    id: 'audio-extractor',
    name: 'Audio Extractor',
    category: 'media',
    description: 'Extract audio tracks from video files (MP4, MKV, AVI, etc.)',
    icon: Volume2,
    features: ['Video to MP3', 'High quality extraction', 'Supports major formats'],
    path: '/tools/audio-extractor',
    tags: ['audio', 'extract', 'video', 'mp3', 'wav']
  },
  {
    id: 'audio-merger',
    name: 'Audio Merger',
    category: 'media',
    description: 'Combine multiple audio files into one with optional crossfade',
    icon: FileText,
    features: ['Combine MP3/WAV', 'Crossfade transitions', 'Drag & drop order'],
    path: '/tools/audio-merger',
    tags: ['audio', 'merge', 'combine', 'join']
  },
  {
    id: 'audio-trimmer-online',
    name: 'Audio Trimmer',
    category: 'media',
    description: 'Trim audio files online with precise start and end times',
    icon: Scissors,
    features: ['Precise cutting', 'Fast processing', 'Multiple formats'],
    path: '/tools/audio-trimmer-online',
    tags: ['audio', 'trim', 'cut', 'mp3']
  },
  {
    id: 'barcode-generator',
    name: 'Barcode Generator',
    category: 'misc',
    description: 'Generate professional barcodes in Code128, UPC, EAN, and more',
    icon: QrCode,
    features: ['Multiple formats', 'Bulk generation', 'Export as SVG/PNG'],
    path: '/tools/barcode-generator',
    tags: ['barcode', 'generate', 'upc', 'code128']
  },
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    category: 'network',
    description: 'Query A, AAAA, MX, TXT, and NS records for any domain',
    icon: Globe,
    popular: true,
    features: ['All record types', 'Bulk lookup', 'Fast response'],
    path: '/tools/dns-lookup',
    tags: ['dns', 'lookup', 'records', 'network']
  },
  {
    id: 'ping-tool',
    name: 'Ping Tool',
    category: 'network',
    description: 'Test server response time and packet loss globally',
    icon: Network,
    features: ['Real-time ping', 'Packet loss stats', 'Bulk testing'],
    path: '/tools/ping-tool',
    tags: ['ping', 'network', 'server', 'test']
  },
  {
    id: 'port-scanner',
    name: 'Port Scanner',
    category: 'network',
    description: 'Check for open ports on any domain or IP address',
    icon: Shield,
    features: ['Common ports scan', 'Custom ranges', 'Bulk scanning'],
    path: '/tools/port-scanner',
    tags: ['port', 'scanner', 'network', 'security']
  },
  {
    id: 'whois-lookup',
    name: 'WHOIS Lookup',
    category: 'network',
    description: 'Check domain registration data, owner, and expiry info',
    icon: Search,
    features: ['Domain info', 'Expiry dates', 'Bulk WHOIS'],
    path: '/tools/whois-lookup',
    tags: ['whois', 'domain', 'lookup', 'registrar']
  },
  {
    id: 'webhook-tester',
    name: 'Webhook Tester',
    category: 'dev',
    description: 'Inspect incoming HTTP webhook requests in real time',
    icon: Send,
    features: ['Unique URLs', 'Real-time inspection', 'Headers & Body view'],
    path: '/tools/webhook-tester',
    tags: ['webhook', 'test', 'http', 'debug']
  },
  {
    id: 'pdf-ocr',
    name: 'PDF OCR',
    category: 'file',
    description: 'Extract text from scanned PDFs and images using OCR',
    icon: Eye,
    popular: true,
    features: ['Text extraction', '50+ languages', 'Privacy-first'],
    path: '/tools/pdf-ocr',
    tags: ['pdf', 'ocr', 'extract', 'text']
  },
  {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    category: 'file',
    description: 'Convert PDF documents to the ISO-standardized PDF/A format for long-term archiving',
    icon: FileArchive,
    popular: false,
    features: ['ISO Compliance', 'Secure Server Processing', 'Auto-cleanup', 'Supports large files'],
    path: '/tools/pdf-to-pdfa',
    tags: ['pdf', 'pdfa', 'convert', 'archive', 'iso']
  },
  {
    id: 'pdf-splitter',
    name: 'PDF Splitter',
    category: 'file',
    description: 'Split PDF files by page range, every N pages, or extract specific pages',
    icon: Scissors,
    features: ['Range splitting', 'Extract pages', 'Fast processing'],
    path: '/tools/pdf-splitter',
    tags: ['pdf', 'split', 'divide', 'extract']
  },
  {
    id: 'pdf-watermark',
    name: 'PDF Watermark',
    category: 'file',
    description: 'Add text or image watermarks to every page of a PDF',
    icon: Image,
    features: ['Custom opacity', 'Position control', 'Batch processing'],
    path: '/tools/pdf-watermark',
    tags: ['pdf', 'watermark', 'protect', 'stamp']
  },
  {
    id: 'css-gradient-generator',
    name: 'CSS Gradient Generator',
    category: 'web',
    description: 'Build beautiful linear, radial, and conic CSS gradients',
    icon: Palette,
    popular: true,
    features: ['Smooth scales', 'Live preview', 'Copy CSS code'],
    path: '/tools/css-gradient-generator',
    tags: ['css', 'gradient', 'design', 'ui']
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    category: 'image',
    description: 'Create professional favicon packages for all browsers and devices',
    icon: Image,
    features: ['Multi-size export', 'All device support', 'Fast generation'],
    path: '/tools/favicon-generator',
    tags: ['favicon', 'icon', 'generate', 'website']
  },
  {
    id: 'fake-content-generator',
    name: 'Fake Content Generator',
    category: 'text',
    description: 'Generate placeholder text, paragraphs, and lists with HTML wrapping',
    icon: FileText,
    features: ['HTML wrapping', 'Headings & Lists', 'Words/Sentences/Paragraphs'],
    path: '/tools/fake-content-generator',
    tags: ['lorem', 'ipsum', 'fake', 'content', 'placeholder']
  },
  {
    id: 'image-to-text',
    name: 'Image to Text (OCR)',
    category: 'image',
    description: 'Instantly extract text from photos and images with AI',
    icon: Type,
    features: ['AI-powered OCR', 'Multiple languages', 'High accuracy'],
    path: '/tools/image-to-text',
    tags: ['image', 'text', 'ocr', 'extract']
  },
  {
    id: 'keyword-density',
    name: 'Keyword Density Checker',
    category: 'seo',
    description: 'Analyze keyword frequency and density percentage for SEO',
    icon: Hash,
    features: ['TF-IDF analysis', 'Phrase extraction', 'URL analysis'],
    path: '/tools/keyword-density',
    tags: ['seo', 'keyword', 'density', 'analysis']
  },
  {
    id: 'page-speed',
    name: 'Page Speed Analyzer',
    category: 'seo',
    description: 'Measure TTFB, payload size, and website performance metrics',
    icon: Clock,
    features: ['Performance stats', 'Bulk testing', 'Resource counts'],
    path: '/tools/page-speed',
    tags: ['performance', 'speed', 'seo', 'ttfb']
  },
  {
    id: 'redirect-checker',
    name: 'Redirect Checker',
    category: 'seo',
    description: 'Trace 301 and 302 redirect chains to their final destination',
    icon: Link,
    features: ['Trace chains', 'Status codes', 'Bulk checking'],
    path: '/tools/redirect-checker',
    tags: ['redirect', 'seo', '301', '302', 'trace']
  },
  {
    id: 'seo-analyzer',
    name: 'Website SEO Analyzer',
    category: 'seo',
    description: 'Perform complete on-page SEO audits for any webpage, including JS-heavy sites',
    icon: Globe,
    popular: true,
    features: ['Meta & Header audit', 'Backlink Audit', 'Schema Validation', 'JS-rendered Page Support'],
    path: '/tools/seo-analyzer',
    tags: ['seo', 'audit', 'analyzer', 'on-page', 'backlinks', 'schema']
  },
  {
    id: 'text-to-handwriting',
    name: 'Text to Handwriting Converter',
    category: 'misc',
    description: 'Convert typed text into realistic handwritten PDF documents',
    icon: PenTool,
    features: ['Realistic fonts', 'Ink colors', 'Paper types'],
    path: '/tools/text-to-handwriting',
    tags: ['handwriting', 'convert', 'pdf', 'realistic']
  },
  {
    id: 'uuid-generator',
    name: 'UUID & ULID Generator',
    category: 'dev',
    description: 'Generate bulk UUIDs (v1, v4, v5) or sortable ULIDs',
    icon: KeyRound,
    popular: true,
    features: ['v1/v4/v5 support', 'Sortable ULIDs', 'Bulk generation'],
    path: '/tools/uuid-generator',
    tags: ['uuid', 'ulid', 'generate', 'random']
  },
  {
    id: 'video-thumbnail',
    name: 'Video Thumbnail Extractor',
    category: 'media',
    description: 'Extract high-quality frames from any video at specific timestamps',
    icon: Image,
    features: ['Time-based extraction', 'High resolution', 'Multi-format support'],
    path: '/tools/video-thumbnail',
    tags: ['video', 'thumbnail', 'extract', 'frame']
  },
  {
    id: 'video-to-audio',
    name: 'Video to Audio Converter',
    category: 'media',
    description: 'Convert video files directly into high-quality MP3 or WAV audio',
    icon: Volume2,
    features: ['Fast conversion', 'High bitrate', 'Supports all video types'],
    path: '/tools/video-to-audio',
    tags: ['video', 'audio', 'convert', 'mp3']
  },
  {
    id: 'website-screenshot',
    name: 'Website Screenshot Generator',
    category: 'web',
    description: 'Capture high-quality full-page screenshots as PNG or PDF',
    icon: Laptop,
    popular: true,
    features: ['Full-page capture', 'PNG/PDF export', 'High resolution'],
    path: '/tools/website-screenshot',
    tags: ['screenshot', 'website', 'capture', 'png', 'pdf']
  },
  {
    id: 'aa-messanger',
    name: 'Secure Messenger Vault',
    category: 'misc',
    description: 'Military-grade end-to-end encrypted messenger with recovery',
    icon: Lock,
    features: ['AES-GCM encryption', 'Recovery questions', '100% private'],
    path: '/tools/aa-messanger',
    tags: ['secure', 'messenger', 'vault', 'encrypt']
  },
  {
    id: 'photo-collage',
    name: 'Photo Collage Maker',
    category: 'image',
    description: 'Arrange multiple images in a flexible grid and export as PNG',
    icon: Grid,
    features: ['Grid layouts', 'High resolution', 'Easy arrangement'],
    path: '/tools/photo-collage',
    tags: ['collage', 'grid', 'image', 'arrange']
  },
  {
    id: 'game-2048',
    name: '2048 Game',
    category: 'games',
    description: 'The classic addictive 2048 puzzle game. Slide tiles and reach the 2048 tile!',
    icon: Grid3x3,
    popular: true,
    features: ['High score tracking', 'Mobile responsive', 'Smooth animations', 'Game persistence'],
    path: '/tools/game-2048',
    tags: ['game', 'puzzle', '2048', 'addictive', 'fun']
  },
  {
    id: 'qr-scanner',
    name: 'QR Code Scanner',
    category: 'misc',
    description: 'Scan and decode QR codes instantly using your camera or image upload',
    icon: QrCode,
    features: ['Camera scanning', 'Image upload', 'Fast decoding'],
    path: '/tools/qr-scanner',
    tags: ['qr', 'scan', 'decode', 'barcode']
  },
  {
    id: 'cors-tester',
    name: 'CORS Tester',
    category: 'dev',
    description: 'Test cross-origin resource sharing headers and preflight responses',
    icon: Globe,
    features: ['Header inspection', 'Preflight test', 'Origin testing'],
    path: '/tools/cors-tester',
    tags: ['cors', 'test', 'api', 'headers']
  },
  {
    id: 'cron-tester',
    name: 'Cron Tester',
    category: 'dev',
    description: 'Validate and parse cron expressions into human-readable schedules',
    icon: Clock,
    features: ['Expression parsing', 'Schedule preview', 'Validation'],
    path: '/tools/cron-tester',
    tags: ['cron', 'test', 'schedule', 'parser']
  },
  {
    id: 'http-headers',
    name: 'HTTP Headers Inspector',
    category: 'dev',
    description: 'Inspect raw HTTP response headers and security settings of any URL',
    icon: TerminalSquare,
    features: ['Header audit', 'Security check', 'Bulk inspection'],
    path: '/tools/http-headers',
    tags: ['http', 'headers', 'inspect', 'security']
  },
  {
    id: 'gitignore-generator',
    name: 'Gitignore Generator',
    category: 'dev',
    description: 'Generate a clean .gitignore file for any tech stack — Node, Python, React, Flutter, and 20+ more',
    icon: FileCode,
    popular: true,
    features: ['24 templates', 'Quick stack presets', 'Auto-deduplication', 'One-click download'],
    path: '/tools/gitignore-generator',
    tags: ['gitignore', 'git', 'ignore', 'node', 'python', 'react', 'developer', 'template']
  },
  {
    id: 'tech-detector',
    name: 'Website Technology Detector',
    category: 'dev',
    description: 'Detect CMS, framework, analytics tools, CDN, and server type used by any website instantly',
    icon: Laptop,
    popular: true,
    features: ['60+ technologies', 'CMS & Framework detection', 'CDN & Analytics', 'Security headers'],
    path: '/tools/tech-detector',
    tags: ['technology', 'detector', 'cms', 'framework', 'wordpress', 'shopify', 'nextjs', 'cdn', 'stack', 'analyzer']
  },
  {
    id: 'github-readme-generator',
    name: 'GitHub README Generator',
    category: 'dev',
    description: 'Visual form builder for perfect GitHub README.md — badges, tech stack, sections and live preview',
    icon: FileCode,
    popular: true,
    features: ['Live MD preview', 'Badge generator', '40+ tech icons', 'One-click download'],
    path: '/tools/github-readme-generator',
    tags: ['github', 'readme', 'markdown', 'generator', 'badges', 'open source', 'developer']
  },
  {
    id: 'pdf-redaction',
    name: 'PDF Redaction Tool',
    category: 'pdf',
    description: 'Permanently black out and remove sensitive text from PDF files. True content removal, not just an overlay.',
    icon: ShieldAlert,
    popular: true,
    features: ['True content destruction', 'Search & redact', 'Secure server processing'],
    path: '/tools/pdf-redaction',
    tags: ['pdf', 'redaction', 'black out', 'secure', 'privacy', 'remove text']
  },
  {
    id: 'meta-tag-generator',
    name: 'Meta Tag Generator',
    category: 'seo',
    description: 'Generate SEO-optimized meta titles and descriptions with a live Google SERP preview.',
    icon: Search,
    popular: true,
    features: ['Live SERP preview', 'Character limits', '1-click copy code', 'OpenGraph tags'],
    path: '/tools/meta-tag-generator',
    tags: ['seo', 'meta tags', 'title generator', 'description generator', 'google snippet']
  },
  {
    id: 'email-deliverability',
    name: 'Email Deliverability Analyzer',
    category: 'network',
    description: 'Check SPF, DMARC, DKIM, blacklists, PTR and more — real-time streaming report with fix suggestions',
    icon: Mail,
    popular: true,
    features: ['SPF & DMARC analysis', 'DKIM multi-selector scan', '50+ blacklist check', 'Copy-paste fix suggestions'],
    path: '/tools/email-deliverability',
    tags: ['email', 'deliverability', 'spf', 'dmarc', 'dkim', 'blacklist', 'spam', 'mx', 'dns', 'ptr']
  },
];

// Filter tools by category
export const getToolsByCategory = (categoryId) => {
  if (categoryId === 'all') return tools;
  return tools.filter(tool => tool.category === categoryId);
};

// Get popular tools
export const getPopularTools = () => {
  return tools.filter(tool => tool.popular);
};

// Search tools
export const searchTools = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return tools.filter(tool =>
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery) ||
    tool.tags.some(tag => tag.includes(lowercaseQuery))
  );
};

// Get tool by ID
export const getToolById = (toolId) => {
  return tools.find(tool => tool.id === toolId);
};