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
  'content-writing': (d) => `You are an elite, top-tier copywriter and content strategist. Your task is to write a highly engaging, masterclass-level ${d.contentType || 'blog post'} about "${d.topic}".

### TARGET AUDIENCE PROFILE
${d.audience || 'The general public. Adapt the reading level and terminology appropriately.'}

### TONE & VOICE
Adopt a ${d.tone || 'Professional'} tone. The writing must be authoritative yet accessible.
- Avoid generic filler, fluff, and robotic AI-sounding phrases.
- Use active voice, strong verbs, and compelling transitions.

### CONTENT PARAMETERS
- Target Word Count: ${d.wordCount || '800–1200 words'}
- Required Keywords: ${d.keywords ? d.keywords : 'Identify and naturally integrate semantic keywords.'}

### STRUCTURAL REQUIREMENTS
${d.structure?.length ? d.structure.map(s => `- ${s}`).join('\n') : `- Craft a magnetic headline that promises value.
- Hook the reader in the first 3 sentences using a surprising fact, question, or bold statement.
- Use clear H2 and H3 subheadings for scannability.
- Provide actionable, non-obvious insights.
- Conclude with a strong, definitive Call to Action (CTA).`}

### EXECUTION INSTRUCTIONS
1. Before writing, briefly outline the core narrative arc and value proposition.
2. Draft the content using formatting (bullet points, bold text, short paragraphs) to maximize readability.
3. Include at least two real-world analogies or examples to illustrate complex points.
4. Ensure the Flesch reading ease score aligns with an 8th-grade reading level.

Deliver the final content formatted in clean Markdown.`,

  'seo': (d) => `You are an advanced Technical SEO Architect and Entity-Based Content Strategist. Your objective is to engineer a piece of content that will definitively outrank the top 3 Google results for the keyword: "${d.primaryKeyword}".

### CORE SEO PARAMETERS
- Primary Keyword: ${d.primaryKeyword}
- Search Intent: ${d.searchIntent}
- Competition Level: ${d.competition || 'Medium'}
- Target Location: ${d.location || 'Global'}
${d.secondaryKeywords ? `- LSI / NLP Keywords to weave naturally: ${d.secondaryKeywords}` : ''}

### CONTENT TYPE
${d.contentType}

### OPTIMIZATION DIRECTIVES
1. **Title Tag & Meta Description:** Provide an optimized Title Tag (under 60 chars) and Meta Description (under 160 chars) designed to maximize CTR.
2. **Semantic HTML Structure:** Use strict H1, H2, and H3 hierarchy. The H1 must contain the exact primary keyword.
3. **Information Gain:** Do not just regurgitate existing web content. Introduce unique perspectives, data synthesis, or expert insights that satisfy the "${d.searchIntent}" intent better than current SERP leaders.
4. **Readability & UX:** Write in short paragraphs (max 3-4 sentences). Use bulleted lists, bolded text for emphasis, and tables if comparing data.
5. **Entity Connections:** Establish clear relationships between the primary topic and related sub-entities.
6. **FAQ Schema:** Generate 3-5 highly relevant FAQs based on "People Also Ask" queries, formatted in JSON-LD FAQPage Schema at the end.

Execute the content completely in Markdown. Prioritize user value over keyword stuffing.`,

  'social-media': (d) => {
    const guide = { LinkedIn: 'professional, narrative-driven, thought-provoking', 'Twitter/X': 'punchy, high-impact, thread-style', Facebook: 'community-focused, relatable, story-driven', Instagram: 'visually-descriptive, aesthetic, engaging', Reddit: 'highly authentic, jargon-fluent, strictly anti-marketing', YouTube: 'high-energy, educational, visually-cued', TikTok: 'trend-aware, fast-paced, highly engaging', Pinterest: 'inspiring, actionable, visually-oriented' };
    return `You are a viral Social Media Strategist and Growth Hacker. Your task is to craft a highly engaging, algorithm-optimized ${d.platform} post.

### CONTEXT & PARAMETERS
- Platform: ${d.platform} (Style: ${guide[d.platform] || 'Authentic and engaging'})
- Core Topic: ${d.topic}
- Post Type: ${d.postType}
- Length: ${d.length || 'Medium (one paragraph)'}
- Goal / Call-to-Action: ${d.cta || 'Drive deep engagement'}

### PSYCHOLOGICAL HOOK
Start with a "Scroll-Stopper." The first sentence must create an information gap, challenge a common belief, or trigger an immediate emotional response.

### BODY COPY STRUCTURE
- Use spacing and line breaks strategically to increase read time.
- Write in a conversational, human tone. Avoid corporate jargon.
- Deliver the value or story quickly and effectively.
${d.emoji ? '- Integrate emojis strategically to guide the eye, but do not overuse them.' : '- Do not use emojis. Keep it text-only.'}

### OPTIMIZATION
${d.hashtags ? `- Provide 5-7 highly targeted hashtags relevant to the ${d.platform} algorithm.` : ''}
- Include 3 variations of the hook so I can A/B test.

Deliver the exact post text ready to be copy-pasted.`;
  },

  'image-generation': (d) => `You are a Master Prompt Engineer for advanced diffusion models (Midjourney v6, DALL-E 3, Stable Diffusion). Construct a highly optimized, technically precise image generation prompt.

### SUBJECT & SCENE
Main Subject: ${d.subject}
${d.composition ? `Camera/Composition: ${d.composition}` : ''}

### ARTISTIC DIRECTION
Style/Medium: ${d.style}
${d.mood ? `Atmosphere/Mood: ${d.mood}` : ''}
${d.colors ? `Color Grading: ${d.colors}` : ''}

### TECHNICAL SPECIFICATIONS
${d.lighting ? `Lighting Setup: ${d.lighting}` : ''}
${d.quality?.length ? `Rendering/Quality Tags: ${d.quality.join(', ')}` : ''}

### OUTPUT REQUIREMENTS
Provide the response in the following format:

1. **Midjourney/Stable Diffusion Prompt:** A comma-separated, highly descriptive text block starting with the main subject, followed by environment, lighting, camera specs (e.g., 35mm lens, f/1.8, Unreal Engine 5 render, volumetric lighting), and styling.
2. **DALL-E 3 Prompt:** A natural language, paragraph-style description of the exact same scene.
3. **Negative Prompt:** A comprehensive list of elements to exclude (e.g., ugly, deformed, text, watermark, bad anatomy, bad proportions, CGI, plastic).

Ensure the vocabulary is highly specific to photography, art history, and 3D rendering.`,

  'code-generation': (d) => `You are a Distinguished Staff Engineer / Architect with deep expertise in ${d.language}. Your task is to write production-grade, highly optimized ${d.projectType || 'code'}.

### REQUIREMENTS & CONTEXT
- Language: ${d.language}
- Target Framework/Environment: ${d.framework || 'Standard / Vanilla'}
- Complexity Level: ${d.complexity || 'Intermediate'}
- Core Functionality: ${d.functionality}
${d.requirements ? `- Specific Constraints: ${d.requirements}` : ''}

### EXECUTION PROTOCOL (THINK STEP-BY-STEP)
1. **Architecture & Design:** Briefly outline your approach, the design patterns you are choosing, and why.
2. **Time & Space Complexity:** State the Big-O notation for your solution if applicable.
3. **Implementation:** Write the complete, robust code.
   - Use strict typing where the language supports it.
   - Implement comprehensive error handling and edge-case management.
   ${d.bestPractices ? '- Adhere strictly to SOLID principles and clean code heuristics.' : ''}
   ${d.comments ? '- Include descriptive JSDoc/docstrings and inline comments explaining the *why* (not just the *what*).' : ''}
4. **Testing & Usage:** Provide a clear, real-world example of how to instantiate and test this code.

Do not provide half-finished code or use placeholders like "// implement here". Provide fully functional, enterprise-ready code.`,

  'business': (d) => `You are a Tier-1 Management Consultant (ex-McKinsey/Bain/BCG) and elite business strategist. Your task is to develop a robust, data-informed ${(d.objective || 'strategy')} for a ${d.businessType} in the ${d.industry} sector.

### BUSINESS CONTEXT
- Target Market & ICP (Ideal Customer Profile): ${d.targetMarket}
- Available Budget: ${d.budget || 'To be determined'}
- Execution Timeline: ${d.timeline || 'Flexible'}

### DELIVERABLE REQUIREMENTS
Structure the ${d.objective} using the following advanced framework:

1. **Executive Summary:** The 30-second elevator pitch of the strategy.
2. **Market & Competitive Dynamics:** A brief Porter's Five Forces or SWOT analysis tailored to this specific scenario.
3. **Strategic Initiatives:** 3-5 high-impact, actionable steps to achieve the objective. For each, include:
   - Rationale
   - Required resources
   - Expected impact
4. **KPIs & Success Metrics:** Specific, measurable, and time-bound (SMART) metrics to track progress.
5. **Risk Mitigation:** Identify the 2 biggest potential points of failure and how to preemptively solve them.

Format the output professionally using Markdown headers, bullet points, and bold text for maximum scannability by executives. Adopt an authoritative, analytical, and highly pragmatic tone.`,

  'creative-writing': (d) => `You are an award-winning, critically acclaimed author known for your masterful prose and deep emotional resonance. Write a captivating ${(d.genre || 'story').toLowerCase()} exploring the theme of "${d.theme}".

### NARRATIVE PARAMETERS
- Genre: ${d.genre}
- Tone/Atmosphere: ${d.mood || 'Immersive and captivating'}
- Pacing/Style: ${d.style || 'Show, don\'t tell, with strong narrative drive'}
- Target Length: ${d.length || 'Medium (500–2000 words)'}
- Target Audience: ${d.audience || 'General audience'}

### WRITING DIRECTIVES
1. **The Hook:** Start *in media res* or with a highly unusual, striking detail. Do not begin with weather or waking up.
2. **Sensory Immersion:** Ground the reader heavily in the scene using specific, evocative sensory details (sight, sound, texture, smell).
3. **Character Depth:** Reveal character through micro-expressions, dialogue subtext, and action rather than explicit exposition.
4. **Prose Quality:** Vary sentence length to control rhythm. Use strong, specific verbs. Avoid adverbs where a stronger verb suffices.
5. **The Climax/Resolution:** Deliver a conclusion that feels inevitable yet surprising, leaving a lingering emotional impact.

Execute the piece flawlessly, focusing on subtext and masterful pacing.`,

  'video-generation': (d) => `You are an elite Video Producer and YouTube Strategist. Create a high-retention, algorithm-optimized production brief and script.

### VIDEO SPECIFICATIONS
- Format: ${d.videoType}
- Target Duration: ${d.duration}
- Target Platform: ${d.platform || 'General / Multi-platform'}
- Audience: ${d.audience}
- Core Message: ${d.message}

### THE SCRIPT & STORYBOARD
Provide a two-column formatted script (or structured Markdown equivalent) with "Visual/B-Roll" and "Audio/Dialogue".

**Structure the video using the AVD (Attention, Value, Destination) framework:**
1. **The Hook (0:00 - 0:05):** A highly kinetic, visually disruptive opening that immediately answers "Why should I watch this?"
2. **The Setup (0:05 - 0:15):** Validate the viewer's problem or curiosity.
3. **The Core Value (Body):** Deliver the content efficiently. Break it into clear, digestible chapters.
   - Include specific visual cues (e.g., "ZOOM IN", "TEXT ON SCREEN: [Text]", "SOUND EFFECT: Whoosh").
   - Maintain pacing; suggest a new camera angle or b-roll every 4-6 seconds to maintain audience retention.
4. **The Payoff & CTA (Ending):** A concise, high-conversion Call to Action pointing directly to the next step.

### PRODUCTION NOTES
Include a brief list of recommended visual assets, lighting mood, and pacing notes for the editor to ensure maximum viewer retention. Tone should be ${d.style || 'engaging and professional'}.`,
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