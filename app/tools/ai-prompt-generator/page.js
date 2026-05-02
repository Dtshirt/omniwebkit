'use client';

import { useState } from 'react';
import {
  Zap, Copy, Download, RefreshCw, Lightbulb,
  MessageSquare, Image, Code, PenTool, Megaphone,
  TrendingUp, Video, Briefcase, CheckCircle, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// ─── Shared style tokens ─────────────────────────────
const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition';

// ─── Toggle Switch ───────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-9 h-5 rounded-full bg-slate-200 dark:bg-slate-600 peer-checked:bg-primary-600 transition-colors" />
      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
}

// ─── Card wrapper ────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// ─── Category definitions ────────────────────────────
const CATEGORIES = {
  'content-writing': {
    name: 'Content Writing',
    icon: PenTool,
    desc: 'Blog posts, articles, and web content',
    accent: 'bg-blue-500',
    ring: 'border-blue-500',
    fields: [
      { name: 'topic', label: 'Topic / Subject', type: 'text', required: true, placeholder: 'e.g., Artificial Intelligence in Healthcare' },
      { name: 'contentType', label: 'Content Type', type: 'select', required: true, options: ['Blog Post', 'Article', 'Product Description', 'Newsletter', 'Landing Page', 'About Page', 'FAQ'] },
      { name: 'audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'e.g., Tech professionals, beginners, executives' },
      { name: 'tone', label: 'Tone of Voice', type: 'select', required: true, options: ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Conversational', 'Technical', 'Humorous'] },
      { name: 'wordCount', label: 'Word Count', type: 'select', options: ['500–800 words', '800–1200 words', '1200–2000 words', '2000+ words'] },
      { name: 'keywords', label: 'Keywords to Include', type: 'textarea', placeholder: 'Comma-separated keywords to weave in naturally' },
      { name: 'structure', label: 'Content Structure', type: 'multiselect', options: ['Introduction', 'Main Points', 'Examples', 'Statistics', 'Conclusion', 'Call to Action'] },
    ],
  },
  'seo': {
    name: 'SEO Content',
    icon: TrendingUp,
    desc: 'Search-engine-optimised content',
    accent: 'bg-emerald-500',
    ring: 'border-emerald-500',
    fields: [
      { name: 'primaryKeyword', label: 'Primary Keyword', type: 'text', required: true, placeholder: 'Main keyword to rank for' },
      { name: 'secondaryKeywords', label: 'Secondary Keywords', type: 'textarea', placeholder: 'Related / LSI keywords' },
      { name: 'contentType', label: 'Content Type', type: 'select', required: true, options: ['SEO Article', 'Product Page', 'Category Page', 'Meta Description', 'Title Tag', 'FAQ Schema'] },
      { name: 'searchIntent', label: 'Search Intent', type: 'select', required: true, options: ['Informational', 'Commercial', 'Transactional', 'Navigational'] },
      { name: 'competition', label: 'Competition Level', type: 'select', options: ['Low', 'Medium', 'High'] },
      { name: 'location', label: 'Target Location', type: 'text', placeholder: 'Geographic target (optional)' },
    ],
  },
  'social-media': {
    name: 'Social Media',
    icon: Megaphone,
    desc: 'Posts for every platform',
    accent: 'bg-violet-500',
    ring: 'border-violet-500',
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', required: true, options: ['LinkedIn', 'Twitter/X', 'Facebook', 'Instagram', 'Reddit', 'YouTube', 'TikTok', 'Pinterest'] },
      { name: 'postType', label: 'Post Type', type: 'select', required: true, options: ['Promotional', 'Educational', 'Entertaining', 'Inspirational', 'News/Update', 'Behind-the-scenes'] },
      { name: 'topic', label: 'Topic/Message', type: 'text', required: true, placeholder: 'What do you want to communicate?' },
      { name: 'cta', label: 'Call to Action', type: 'select', options: ['Like & Share', 'Comment', 'Visit Link', 'Buy Now', 'Sign Up', 'Download', 'Follow', 'None'] },
      { name: 'length', label: 'Post Length', type: 'select', options: ['Short (1–2 sentences)', 'Medium (one paragraph)', 'Long (multiple paragraphs)'] },
      { name: 'hashtags', label: 'Include Hashtags', type: 'boolean', default: true },
      { name: 'emoji', label: 'Use Emojis', type: 'boolean', default: true },
    ],
  },
  'image-generation': {
    name: 'Image Generation',
    icon: Image,
    desc: 'AI art & image creation prompts',
    accent: 'bg-pink-500',
    ring: 'border-pink-500',
    fields: [
      { name: 'subject', label: 'Main Subject', type: 'text', required: true, placeholder: 'e.g., Futuristic cityscape at sunset' },
      { name: 'style', label: 'Art Style', type: 'select', required: true, options: ['Photorealistic', 'Digital Art', 'Oil Painting', 'Watercolor', 'Sketch', 'Anime', 'Cartoon', 'Abstract', 'Minimalist', 'Vintage'] },
      { name: 'mood', label: 'Mood / Atmosphere', type: 'select', options: ['Bright & Cheerful', 'Dark & Moody', 'Calm & Peaceful', 'Energetic', 'Mysterious', 'Dramatic', 'Romantic', 'Professional'] },
      { name: 'lighting', label: 'Lighting', type: 'select', options: ['Natural sunlight', 'Golden hour', 'Studio lighting', 'Neon lighting', 'Candlelight', 'Dramatic shadows', 'Soft diffused'] },
      { name: 'composition', label: 'Composition', type: 'select', options: ['Close-up', 'Medium shot', 'Wide angle', "Bird's eye view", "Low angle", "Portrait", "Landscape"] },
      { name: 'colors', label: 'Color Palette', type: 'text', placeholder: 'e.g., Vibrant blues and oranges, pastel colors' },
      { name: 'quality', label: 'Quality Keywords', type: 'multiselect', options: ['8K resolution', 'Ultra detailed', 'High quality', 'Professional photography', 'Award winning', 'Trending on ArtStation'] },
    ],
  },
  'code-generation': {
    name: 'Code Generation',
    icon: Code,
    desc: 'Programming & development prompts',
    accent: 'bg-slate-600',
    ring: 'border-slate-600',
    fields: [
      { name: 'language', label: 'Language', type: 'select', required: true, options: ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript', 'Swift', 'Kotlin'] },
      { name: 'projectType', label: 'Project Type', type: 'select', required: true, options: ['Web Application', 'Mobile App', 'Desktop App', 'API', 'Database Schema', 'Algorithm', 'Script', 'Component'] },
      { name: 'functionality', label: 'Desired Functionality', type: 'textarea', required: true, placeholder: 'Describe what the code should do' },
      { name: 'framework', label: 'Framework / Library', type: 'text', placeholder: 'e.g., React, Django, Spring Boot' },
      { name: 'complexity', label: 'Complexity Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { name: 'requirements', label: 'Special Requirements', type: 'textarea', placeholder: 'Performance, security, constraints…' },
      { name: 'comments', label: 'Include Comments', type: 'boolean', default: true },
      { name: 'bestPractices', label: 'Follow Best Practices', type: 'boolean', default: true },
    ],
  },
  'business': {
    name: 'Business & Marketing',
    icon: Briefcase,
    desc: 'Business plans, strategies, pitch decks',
    accent: 'bg-indigo-500',
    ring: 'border-indigo-500',
    fields: [
      { name: 'businessType', label: 'Business Type', type: 'select', required: true, options: ['Startup', 'Small Business', 'Enterprise', 'E-commerce', 'SaaS', 'Consulting', 'Agency', 'Non-profit'] },
      { name: 'industry', label: 'Industry', type: 'text', required: true, placeholder: 'e.g., Technology, Healthcare, Finance' },
      { name: 'objective', label: 'Objective', type: 'select', required: true, options: ['Business Plan', 'Marketing Strategy', 'Sales Copy', 'Email Campaign', 'Pitch Deck', 'Market Analysis', 'Competitor Analysis'] },
      { name: 'targetMarket', label: 'Target Market', type: 'text', required: true, placeholder: 'Describe your ideal customers' },
      { name: 'budget', label: 'Budget Range', type: 'select', options: ['Under $1K', '$1K–$10K', '$10K–$50K', '$50K–$100K', '$100K+', 'Not specified'] },
      { name: 'timeline', label: 'Timeline', type: 'select', options: ['1 week', '1 month', '3 months', '6 months', '1 year', 'Ongoing'] },
    ],
  },
  'creative-writing': {
    name: 'Creative Writing',
    icon: MessageSquare,
    desc: 'Stories, scripts & creative content',
    accent: 'bg-amber-500',
    ring: 'border-amber-500',
    fields: [
      { name: 'genre', label: 'Genre', type: 'select', required: true, options: ['Fiction', 'Non-fiction', 'Poetry', 'Script', 'Song Lyrics', 'Short Story', 'Novel Chapter', 'Biography'] },
      { name: 'theme', label: 'Theme / Topic', type: 'text', required: true, placeholder: 'Main theme or subject' },
      { name: 'style', label: 'Writing Style', type: 'select', options: ['Narrative', 'Descriptive', 'Persuasive', 'Dialogue-heavy', 'Stream of consciousness'] },
      { name: 'mood', label: 'Mood / Tone', type: 'select', options: ['Happy', 'Sad', 'Mysterious', 'Suspenseful', 'Romantic', 'Humorous', 'Dramatic', 'Inspirational'] },
      { name: 'length', label: 'Target Length', type: 'select', options: ['Short (under 500 words)', 'Medium (500–2000 words)', 'Long (2000+ words)', 'Multiple chapters'] },
      { name: 'audience', label: 'Target Audience', type: 'select', options: ['Children', 'Young Adult', 'Adults', 'All ages'] },
    ],
  },
  'video-generation': {
    name: 'Video Generation',
    icon: Video,
    desc: 'Video scripts & production briefs',
    accent: 'bg-red-500',
    ring: 'border-red-500',
    fields: [
      { name: 'videoType', label: 'Video Type', type: 'select', required: true, options: ['Explainer Video', 'Product Demo', 'Tutorial', 'Advertisement', 'Social Media Video', 'Presentation', 'Animation'] },
      { name: 'duration', label: 'Duration', type: 'select', required: true, options: ['15–30 seconds', '30–60 seconds', '1–2 minutes', '2–5 minutes', '5+ minutes'] },
      { name: 'audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'Who will watch this video?' },
      { name: 'message', label: 'Key Message', type: 'textarea', required: true, placeholder: "What's the main message or goal?" },
      { name: 'style', label: 'Video Style', type: 'select', options: ['Corporate', 'Casual', 'Animated', 'Live Action', 'Screen Recording', 'Talking Head', 'Motion Graphics'] },
      { name: 'platform', label: 'Platform', type: 'select', options: ['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Website'] },
    ],
  },
};

// ─── Prompt generators ───────────────────────────────
const generators = {
  'content-writing': (d) => `Act as an expert content writer and SEO specialist. Create a comprehensive ${d.contentType || 'blog post'} about "${d.topic}" for ${d.audience || 'the target audience'}.

REQUIREMENTS:
- Tone: ${d.tone || 'Professional'}
- Word count: ${d.wordCount || '800–1200 words'}
- Target audience: ${d.audience}
${d.keywords ? `- Keywords to include naturally: ${d.keywords}` : ''}

STRUCTURE:
${d.structure?.length ? d.structure.map(s => `- ${s}`).join('\n') : `- Engaging hook in the introduction
- Clear main points with H2/H3 subheadings
- Supporting examples and evidence
- Actionable conclusion with call-to-action`}

GUIDELINES:
- Write in a ${(d.tone || 'professional').toLowerCase()} tone
- Use clear, easy-to-read language (Grade 8 readability)
- Include relevant statistics and examples
- Optimise for readability with short paragraphs and bullet points
- End with a compelling call-to-action

Produce high-quality, original content that genuinely helps readers while being well-optimised for search engines.`,

  'seo': (d) => `Act as an SEO expert and content strategist. Create fully SEO-optimised content targeting the primary keyword "${d.primaryKeyword}".

SEO REQUIREMENTS:
- Primary keyword: ${d.primaryKeyword}
- Search intent: ${d.searchIntent}
- Competition level: ${d.competition || 'Medium'}
${d.secondaryKeywords ? `- Secondary / LSI keywords: ${d.secondaryKeywords}` : ''}
${d.location ? `- Geographic target: ${d.location}` : ''}

CONTENT TYPE: ${d.contentType}

SEO CHECKLIST:
- Use primary keyword in title, first 100 words, and naturally throughout
- Include semantic and LSI keywords
- Write compelling meta title (50–60 characters)
- Write engaging meta description (150–160 characters)
- Use proper heading hierarchy (H1 → H2 → H3)
- Add FAQ section if relevant
- Suggest internal and external link opportunities
- Optimise for featured snippets and People Also Ask

Create content that ranks well while providing genuine value to users searching for "${d.primaryKeyword}".`,

  'social-media': (d) => {
    const guide = { LinkedIn: 'professional, thought leadership, industry insights', 'Twitter/X': 'concise, punchy, hashtag-driven', Facebook: 'community, storytelling, visual', Instagram: 'visual-first, aesthetic, hashtag-rich', Reddit: 'authentic, community-specific, value-first', YouTube: 'educational, clear value proposition', TikTok: 'trendy, creative, viral-potential', Pinterest: 'inspirational, DIY, seasonal' };
    return `Create an engaging ${d.platform} post about "${d.topic}" with a ${(d.postType || '').toLowerCase()} approach.

PLATFORM: ${d.platform}
STYLE: ${guide[d.platform] || 'Authentic and engaging'}
POST TYPE: ${d.postType}
TOPIC: ${d.topic}
LENGTH: ${d.length || 'Medium (one paragraph)'}
CALL-TO-ACTION: ${d.cta || 'Engage with audience'}
${d.hashtags ? '- Include 5–10 relevant hashtags' : ''}
${d.emoji ? '- Use appropriate emojis to boost engagement' : ''}

ENGAGEMENT TIPS:
- Hook readers in the very first line
- Provide clear value or entertainment
- Ask a question to spark comments
- Match platform best practices

Create a post that stops the scroll and drives real engagement.`;
  },

  'image-generation': (d) => `Generate a detailed AI image prompt:

SUBJECT: ${d.subject}
ART STYLE: ${d.style}
${d.mood ? `MOOD: ${d.mood}` : ''}
${d.lighting ? `LIGHTING: ${d.lighting}` : ''}
${d.composition ? `COMPOSITION: ${d.composition}` : ''}
${d.colors ? `COLORS: ${d.colors}` : ''}
${d.quality?.length ? `QUALITY: ${d.quality.join(', ')}` : ''}

OPTIMISED PROMPT:
"${d.subject}, ${(d.style || 'digital art').toLowerCase()}, ${(d.mood || 'beautiful').toLowerCase()} atmosphere, ${(d.lighting || 'professional lighting').toLowerCase()}, ${(d.composition || 'well composed').toLowerCase()}${d.colors ? ', ' + d.colors.toLowerCase() : ''}, ${d.quality?.join(', ').toLowerCase() || 'highly detailed, high quality'}"

NEGATIVE PROMPT:
"blurry, low quality, distorted, deformed, bad anatomy, poorly drawn, watermark, text, signature"

TIPS:
- Add specific artistic references for stronger style guidance
- For photorealistic results, include camera model and lens specs
- Be specific about textures, materials, and background details`,

  'code-generation': (d) => `Act as a senior ${d.language} developer. Create ${(d.projectType || 'application code').toLowerCase()} that meets these requirements:

LANGUAGE: ${d.language}
PROJECT TYPE: ${d.projectType}
COMPLEXITY: ${d.complexity || 'Intermediate'}
${d.framework ? `FRAMEWORK / LIBRARIES: ${d.framework}` : ''}

FUNCTIONALITY:
${d.functionality}

${d.requirements ? `SPECIAL REQUIREMENTS:\n${d.requirements}` : ''}

CODE STANDARDS:
- Write clean, readable, well-structured code
- Follow ${d.language} naming conventions
- Include proper error handling and input validation
${d.comments ? '- Add inline comments explaining non-obvious logic' : ''}
${d.bestPractices ? '- Apply SOLID principles and appropriate design patterns' : ''}
- Consider performance and security implications
- Make code modular and easy to extend

OUTPUT:
- Complete, working code ready to run
- Setup / installation instructions
- Usage examples with sample input/output
- Brief explanation of key design decisions
- Suggestions for future improvements`,

  'business': (d) => `Act as a seasoned business consultant. Create a comprehensive ${(d.objective || 'business strategy').toLowerCase()} for a ${(d.businessType || '').toLowerCase()} in the ${d.industry} industry.

CONTEXT:
- Business type: ${d.businessType}
- Industry: ${d.industry}
- Target market: ${d.targetMarket}
- Budget: ${d.budget || 'To be determined'}
- Timeline: ${d.timeline || 'Flexible'}
- Objective: ${d.objective}

DELIVERABLES:
1. Executive Summary
2. Market Analysis (industry overview, target segments, competitive landscape)
3. Strategic Recommendations (goals, initiatives, roadmap, KPIs)
4. Financial Considerations (budget allocation, ROI projections, risk assessment)
5. Action Plan (priorities, milestones, resource requirements)

Base all recommendations on current market trends. Include actionable, data-informed insights. Address potential challenges and mitigation strategies. Deliver professional, implementable advice.`,

  'creative-writing': (d) => `Act as a creative writing expert. Create an engaging ${(d.genre || 'story').toLowerCase()} about "${d.theme}".

CREATIVE BRIEF:
- Genre: ${d.genre}
- Theme: ${d.theme}
- Writing style: ${d.style || 'Engaging narrative'}
- Mood / tone: ${d.mood || 'Captivating'}
- Length: ${d.length || 'Medium (500–2000 words)'}
- Audience: ${d.audience || 'General audience'}

GUIDELINES:
- Open with a strong hook that grabs attention immediately
- Develop compelling, believable characters
- Use vivid, sensory descriptions (sight, sound, smell, touch, taste)
- Show don't tell — let actions and dialogue reveal character
- Build tension and maintain momentum throughout
- Create emotional resonance with the reader
- End with an impactful, memorable conclusion

Demonstrate mastery of the ${(d.genre || 'genre').toLowerCase()} form while telling a story that stays with the reader long after they finish.`,

  'video-generation': (d) => `Create a complete video production brief:

VIDEO TYPE: ${d.videoType}
DURATION: ${d.duration}
AUDIENCE: ${d.audience}
PLATFORM: ${d.platform || 'General / Multi-platform'}
STYLE: ${d.style || 'Professional'}

KEY MESSAGE:
${d.message}

SCRIPT STRUCTURE:
1. Hook (first 3–5 sec): Grab attention immediately — start with a question, bold statement, or striking visual
2. Problem / Context: Establish why this matters to the viewer
3. Solution / Value: Deliver the main message and supporting points
4. Call-to-Action: One clear next step for viewers

PRODUCTION NOTES:
- Optimise aspect ratio and format for ${d.platform || 'target platform'}
- Use brand-consistent colours, fonts, and motion style
- Include subtitles for accessibility and muted viewing
- Resolution: 1080p minimum; 4K preferred for YouTube
- Thumbnail: Design for click-through with bold text overlay

ENGAGEMENT:
- Front-load the most compelling content
- Include a clear, unmissable CTA at the end
- Optimise title, description, and tags for platform SEO`,
};

export default function AIPromptGenerator() {
  const [selectedCategory, setSelectedCategory] = useState('content-writing');
  const [formData, setFormData] = useState({});
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const cat = CATEGORIES[selectedCategory];
  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleCategorySwitch = (key) => {
    setSelectedCategory(key);
    setFormData({});
    setGeneratedPrompt('');
  };

  const generate = () => {
    const required = cat.fields.filter(f => f.required && !formData[f.name]);
    if (required.length > 0) {
      toast.error(`Please fill in: ${required.map(f => f.label).join(', ')}`);
      return;
    }
    const gen = generators[selectedCategory];
    if (!gen) { toast.error('Category not supported'); return; }
    const prompt = gen(formData);
    setGeneratedPrompt(prompt);
    setPromptHistory(prev => [{
      id: Date.now(),
      category: cat.name,
      preview: prompt.substring(0, 90) + '…',
      fullPrompt: prompt,
      time: new Date().toLocaleTimeString(),
    }, ...prev.slice(0, 9)]);
    toast.success('Prompt generated!');
  };

  const copyPrompt = async () => {
    if (!generatedPrompt) return;
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPrompt = () => {
    if (!generatedPrompt) return;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([generatedPrompt], { type: 'text/plain' })),
      download: `prompt-${selectedCategory}-${Date.now()}.txt`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Downloaded!');
  };

  const renderField = (field) => {
    const val = formData[field.name] ?? (field.default ?? '');
    switch (field.type) {
      case 'text':
        return <input type="text" value={val} onChange={e => set(field.name, e.target.value)} placeholder={field.placeholder} className={inputCls} />;
      case 'textarea':
        return <textarea rows={3} value={val} onChange={e => set(field.name, e.target.value)} placeholder={field.placeholder} className={`${inputCls} resize-y`} />;
      case 'select':
        return (
          <select value={val} onChange={e => set(field.name, e.target.value)} className={inputCls}>
            <option value="">Select {field.label}…</option>
            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'boolean':
        return (
          <div className="flex items-center gap-3 pt-1">
            <Toggle checked={!!val} onChange={e => set(field.name, e.target.checked)} />
            <span className="text-sm text-slate-600 dark:text-slate-400">{val ? 'Yes' : 'No'}</span>
          </div>
        );
      case 'multiselect':
        return (
          <div className="grid grid-cols-2 gap-2">
            {field.options.map(o => {
              const checked = (Array.isArray(val) ? val : []).includes(o);
              return (
                <label key={o} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-primary-300'}`}>
                  <input type="checkbox" checked={checked} onChange={e => {
                    const cur = Array.isArray(val) ? val : [];
                    set(field.name, e.target.checked ? [...cur, o] : cur.filter(v => v !== o));
                  }} className="sr-only" />
                  <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${checked ? 'bg-primary-600 border-primary-600' : 'border-slate-400'}`}>
                    {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300">{o}</span>
                </label>
              );
            })}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Breadcrumbs items={[{ name: 'AI Prompt Generator', href: '/tools/ai-prompt-generator' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-2xl mb-5">
            <Lightbulb className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">AI Prompt Generator</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Build professional AI prompts for ChatGPT, Claude, Gemini, Midjourney, and more.
            Pick a category, fill in the details, and get a ready-to-use prompt in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar: category + history ── */}
          <div className="lg:col-span-1">
            <Card className="p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Category</h2>
              <div className="space-y-1.5">
                {Object.entries(CATEGORIES).map(([key, c]) => {
                  const active = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleCategorySwitch(key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${active
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-700'
                          : 'border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                    >
                      <div className={`w-8 h-8 ${c.accent} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <c.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${active ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-slate-200'}`}>{c.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {promptHistory.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Recent</h3>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {promptHistory.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setGeneratedPrompt(item.fullPrompt)}
                        className="w-full text-left p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-0.5">{item.category}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.preview}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{item.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* ── Main: form + output ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Form card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 ${cat.accent} rounded-xl flex items-center justify-center`}>
                    <cat.icon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{cat.name} Prompt</h2>
                </div>
                <button
                  onClick={() => { setFormData({}); setGeneratedPrompt(''); }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Clear
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {cat.fields.map(field => (
                  <div
                    key={field.name}
                    className={field.type === 'textarea' || field.type === 'multiselect' ? 'md:col-span-2' : ''}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>

              <button
                onClick={generate}
                className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition"
              >
                <Zap className="h-4 w-4" />
                Generate Prompt
              </button>
            </Card>

            {/* Output card */}
            {generatedPrompt && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generated Prompt</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyPrompt}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={downloadPrompt}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-5 overflow-x-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-200 font-mono leading-relaxed">{generatedPrompt}</pre>
                </div>

                <div className="mt-4 flex items-start gap-2.5 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
                  <Lightbulb className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-primary-800 dark:text-primary-300 leading-relaxed">
                    <strong>Pro tip:</strong> Use this prompt with ChatGPT, Claude, Gemini, or any AI tool. The more specific your inputs, the better your output will be.
                  </p>
                </div>
              </Card>
            )}

            {/* How-to card */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">How to Get the Best Results</h3>
              <div className="space-y-4">
                {[
                  { n: '1', t: 'Choose a category', d: 'Pick the category that best matches your goal — content writing, SEO, social media, code, and more.' },
                  { n: '2', t: 'Fill in the details', d: 'Complete all required fields. The more specific you are, the more targeted and useful your prompt will be.' },
                  { n: '3', t: 'Click Generate', d: 'Hit the Generate Prompt button. Your professional, structured prompt appears instantly.' },
                  { n: '4', t: 'Copy or download', d: 'Grab your prompt with one click. Use it directly in ChatGPT, Claude, Gemini, Midjourney, or any AI.' },
                  { n: '5', t: 'Refine as needed', d: 'Tweak fields and regenerate to get exactly the prompt you need. Prompts are saved in your recent history.' },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold flex items-center justify-center">{n}</span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{t}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-16 space-y-6">

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What Is an AI Prompt Generator?</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              An AI prompt generator is a tool that helps you craft clear, detailed instructions for AI tools like ChatGPT, Claude, and Gemini. Instead of spending time writing prompts from scratch, you fill in a simple form and the tool builds a structured, professional prompt that gets you much better results from any AI.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Good prompts are the difference between a vague, generic AI response and a precise, high-quality output. This free AI prompt generator covers eight categories — content writing, SEO, social media, image generation, code, business, creative writing, and video — so you always have the right prompt structure, no matter what you're working on.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Prompt Categories Explained</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(CATEGORIES).map(c => (
                <div key={c.name} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className={`flex-shrink-0 w-10 h-10 ${c.accent} rounded-xl flex items-center justify-center`}>
                    <c.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{c.name}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Good Prompts Matter</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              AI models like ChatGPT, Claude, and Gemini are only as good as the instructions you give them. A vague prompt like "write a blog post about SEO" will produce a generic result. A structured prompt with a clear topic, target audience, tone, desired word count, and keywords will produce a focused, useful piece of content you can actually use.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Professional prompt engineers spend hours crafting prompt templates for different use cases. This tool gives you those same templates for free. It handles content writing, SEO, social media, image generation with Midjourney or DALL·E, code with ChatGPT or GitHub Copilot, and more.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'What AI tools can I use these prompts with?', a: 'All of them. The prompts work with ChatGPT (GPT-3.5 and GPT-4), Claude by Anthropic, Gemini by Google, Llama, and any text-based AI. Image prompts work with Midjourney, DALL·E 3, Stable Diffusion, and Adobe Firefly.' },
                { q: 'Is this AI prompt generator free?', a: 'Yes, 100% free. No signup, no usage limits, no hidden fees. Generate as many prompts as you need.' },
                { q: 'What makes a good AI prompt?', a: 'A good prompt has three things: a clear role (e.g., "Act as an SEO expert"), a specific task, and precise parameters (audience, tone, length, format). Vague prompts produce vague results. Our generator adds all three layers automatically.' },
                { q: 'Can I use these prompts for ChatGPT?', a: 'Yes. Every prompt is formatted to work well with ChatGPT. Paste the generated prompt directly into the ChatGPT message box and hit enter. For best results, use GPT-4 rather than GPT-3.5.' },
                { q: 'What is a ChatGPT prompt generator?', a: 'A ChatGPT prompt generator is a tool that builds structured prompts designed to get the best responses from ChatGPT. It typically includes a role, context, specific instructions, and formatting guidelines — all of which this tool provides automatically.' },
                { q: 'How do I write a prompt for Midjourney?', a: 'Use the Image Generation category. Fill in the subject, art style, mood, lighting, and composition. The tool generates both an optimised positive prompt and negative prompt suggestions ready to paste into Midjourney.' },
                { q: 'What is prompt engineering?', a: 'Prompt engineering is the skill of writing clear, structured instructions to get the best results from AI models. It involves understanding how AI interprets language, what parameters to specify, and how to guide the model toward a useful output. Our tool automates this process.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                    <span>{q}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}