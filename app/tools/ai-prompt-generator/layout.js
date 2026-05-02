import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'AI Prompt Generator — Free ChatGPT, Claude & Midjourney Prompt Builder',
  description:
    'Generate professional AI prompts for ChatGPT, Claude, Gemini, Midjourney and more. Choose from 8 categories — content writing, SEO, social media, image generation, code, business, creative writing, and video. Free, instant, no login.',
  keywords: [
    'AI prompt generator',
    'ChatGPT prompt generator',
    'prompt generator free',
    'Midjourney prompt generator',
    'AI prompt builder',
    'ChatGPT prompts',
    'prompt engineering tool',
    'generate AI prompts online',
    'best AI prompt generator',
    'Claude prompt generator',
  ],
  openGraph: {
    title: 'AI Prompt Generator — Build Perfect Prompts for Any AI Tool',
    description:
      'Free online AI prompt generator for ChatGPT, Claude, Gemini, Midjourney and more. 8 categories, instant results, no login required.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/ai-prompt-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'AI Prompt Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Prompt Generator — Free for ChatGPT, Claude & Midjourney',
    description:
      'Build professional AI prompts in seconds. 8 categories: content writing, SEO, social media, image generation, code, and more.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/ai-prompt-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Prompt Generator',
  description:
    'Free online AI prompt generator that builds professional, structured prompts for ChatGPT, Claude, Gemini, Midjourney, DALL·E, Stable Diffusion, and any other AI tool. Covers 8 categories: content writing, SEO, social media, image generation, code generation, business & marketing, creative writing, and video production.',
  url: 'https://omniwebkit.com/tools/ai-prompt-generator',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Content Writing prompts (blog posts, articles, newsletters)',
    'SEO Content prompts with keyword and search intent fields',
    'Social Media prompts for LinkedIn, Twitter, Instagram, TikTok and more',
    'Image Generation prompts for Midjourney, DALL·E, Stable Diffusion',
    'Code Generation prompts for 12 programming languages',
    'Business & Marketing prompts (business plans, pitch decks, sales copy)',
    'Creative Writing prompts (stories, scripts, poetry, song lyrics)',
    'Video Production prompts (explainers, tutorials, ads)',
    'Prompt history — last 10 prompts saved in session',
    'One-click copy to clipboard',
    'One-click TXT file download',
    'No login or account required',
    '100% free with no usage limits',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate AI Prompts with the Free AI Prompt Generator',
  description: 'Step-by-step guide to building professional AI prompts for ChatGPT, Claude, Gemini, and Midjourney using the OmniWebKit AI Prompt Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a category', text: 'Select the category that matches your goal: content writing, SEO, social media, image generation, code, business, creative writing, or video.' },
    { '@type': 'HowToStep', position: 2, name: 'Fill in the fields', text: 'Complete the required and optional fields with specific details about your topic, audience, tone, and other parameters.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Generate', text: 'Click the Generate Prompt button to instantly create a professional, structured prompt.' },
    { '@type': 'HowToStep', position: 4, name: 'Copy or download', text: 'Copy the prompt to your clipboard with one click, or download it as a TXT file.' },
    { '@type': 'HowToStep', position: 5, name: 'Use in your AI tool', text: 'Paste the prompt directly into ChatGPT, Claude, Gemini, Midjourney, or any other AI tool for better results.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What AI tools can I use these prompts with?',
      acceptedAnswer: { '@type': 'Answer', text: 'All of them. The prompts work with ChatGPT (GPT-3.5 and GPT-4), Claude by Anthropic, Gemini by Google, Llama, and any text-based AI. Image prompts work with Midjourney, DALL·E 3, Stable Diffusion, and Adobe Firefly.' },
    },
    {
      '@type': 'Question',
      name: 'Is this AI prompt generator free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% free. No signup, no usage limits, no hidden fees. Generate as many prompts as you need.' },
    },
    {
      '@type': 'Question',
      name: 'What makes a good AI prompt?',
      acceptedAnswer: { '@type': 'Answer', text: 'A good prompt has a clear role (e.g., "Act as an SEO expert"), a specific task, and precise parameters like audience, tone, length, and format. Our generator adds all three layers automatically.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use these for ChatGPT prompts?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Every prompt is formatted to work well with ChatGPT. Paste the generated prompt directly into the ChatGPT message box. For best results, use GPT-4 rather than GPT-3.5.' },
    },
    {
      '@type': 'Question',
      name: 'How do I write a Midjourney prompt?',
      acceptedAnswer: { '@type': 'Answer', text: 'Use the Image Generation category. Fill in the subject, art style, mood, lighting, and composition. The tool generates an optimised positive prompt and negative prompt suggestions ready to paste into Midjourney.' },
    },
    {
      '@type': 'Question',
      name: 'What is prompt engineering?',
      acceptedAnswer: { '@type': 'Answer', text: 'Prompt engineering is the skill of writing clear, structured instructions to get the best results from AI models. It involves understanding how AI interprets language, specifying relevant parameters, and guiding the model toward a useful output. Our tool automates this process.' },
    },
    {
      '@type': 'Question',
      name: 'Does this tool store my prompts or data?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens in your browser. Your inputs and generated prompts are never sent to or stored on any server.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'AI Prompt Generator', item: 'https://omniwebkit.com/tools/ai-prompt-generator' },
  ],
};

export default function AIPromptGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="ai-prompt-generator" category="misc" />
    </>
  );
}
