import ReadmeGeneratorClient from './ReadmeGeneratorClient';

export const metadata = {
  title: 'GitHub README Generator — Build a Perfect README.md | OmniWebKit',
  description:
    'Create a professional GitHub README.md in seconds. Visual form with live Markdown preview, badges, sections for About, Tech Stack, Installation, Screenshots, Contributing, License, and more.',
  keywords: [
    'github readme generator',
    'readme.md generator',
    'github profile readme',
    'readme badges',
    'markdown readme builder',
    'open source readme template',
  ],
  openGraph: {
    title: 'GitHub README Generator — Build a Perfect README.md',
    description:
      'Visual form builder for GitHub README.md files — badges, sections, live Markdown preview, and instant download.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/github-readme-generator',
  },
};

export default function ReadmeGeneratorPage() {
  return <ReadmeGeneratorClient />;
}
