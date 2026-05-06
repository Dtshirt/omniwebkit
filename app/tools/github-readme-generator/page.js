import ReadmeGeneratorClient from './ReadmeGeneratorClient';

export const metadata = {
  title: 'GitHub README Generator Online Free — Create Stunning README Files',
  description:
    'Create beautiful GitHub README.md files online for free. Add badges, shields, stats & sections with a visual editor. Generate professional README for your repo instantly.',
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
