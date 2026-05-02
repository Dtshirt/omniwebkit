'use client';
import { useState, useMemo } from 'react';

export const BADGE_PRESETS = [
  { id:'stars',   label:'Stars',    url:(r)=>`https://img.shields.io/github/stars/${r}?style=for-the-badge` },
  { id:'forks',   label:'Forks',    url:(r)=>`https://img.shields.io/github/forks/${r}?style=for-the-badge` },
  { id:'issues',  label:'Issues',   url:(r)=>`https://img.shields.io/github/issues/${r}?style=for-the-badge` },
  { id:'license', label:'License',  url:(r)=>`https://img.shields.io/github/license/${r}?style=for-the-badge` },
  { id:'version', label:'Version',  url:(r)=>`https://img.shields.io/github/v/release/${r}?style=for-the-badge` },
  { id:'build',   label:'Build',    url:(_)=>`https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge` },
  { id:'coverage',label:'Coverage', url:(_)=>`https://img.shields.io/badge/coverage-90%25-green?style=for-the-badge` },
  { id:'npm',     label:'NPM',      url:(r)=>`https://img.shields.io/npm/v/${r.split('/')[1] || r}?style=for-the-badge` },
];

export const TECH_ICONS = [
  'JavaScript','TypeScript','Python','Rust','Go','Java','PHP','Ruby','C++','Swift','Kotlin',
  'React','Next.js','Vue','Angular','Svelte','Nuxt','Django','Laravel','Rails','Spring',
  'Node.js','Express','FastAPI','Flask','GraphQL','REST API',
  'PostgreSQL','MongoDB','MySQL','Redis','SQLite','Firebase',
  'Docker','Kubernetes','AWS','GCP','Azure','Vercel','Netlify',
  'Git','Linux','Nginx','Tailwind CSS','Bootstrap',
];

const ICON_BADGE = (t)=>{
  const map = {
    'JavaScript':'javascript','TypeScript':'typescript','Python':'python','Rust':'rust',
    'Go':'go','Java':'java','PHP':'php','Ruby':'ruby','C++':'cplusplus','Swift':'swift',
    'Kotlin':'kotlin','React':'react','Next.js':'nextdotjs','Vue':'vuedotjs','Angular':'angular',
    'Svelte':'svelte','Nuxt':'nuxt','Django':'django','Laravel':'laravel','Rails':'rubyonrails',
    'Node.js':'nodedotjs','Express':'express','FastAPI':'fastapi','Flask':'flask',
    'GraphQL':'graphql','PostgreSQL':'postgresql','MongoDB':'mongodb','MySQL':'mysql',
    'Redis':'redis','SQLite':'sqlite','Firebase':'firebase','Docker':'docker',
    'Kubernetes':'kubernetes','AWS':'amazonaws','GCP':'googlecloud','Azure':'microsoftazure',
    'Vercel':'vercel','Netlify':'netlify','Git':'git','Linux':'linux','Nginx':'nginx',
    'Tailwind CSS':'tailwindcss','Bootstrap':'bootstrap',
  };
  const slug = map[t] || t.toLowerCase().replace(/\s/g,'').replace(/\./g,'dot');
  const color = t==='JavaScript'?'F7DF1E':t==='TypeScript'?'3178C6':t==='Python'?'3776AB':
    t==='Rust'?'000000':t==='Go'?'00ADD8':t==='Java'?'007396':t==='PHP'?'777BB4':
    t==='Ruby'?'CC342D':t==='React'||t==='Next.js'?'61DAFB':t==='Vue'||t==='Nuxt'?'4FC08D':
    t==='Angular'?'DD0031':t==='Svelte'?'FF3E00':t==='Django'||t==='Python'?'092E20':
    t==='Node.js'||t==='Express'?'339933':t==='FastAPI'?'009688':t==='Flask'?'000000':
    t==='PostgreSQL'?'4169E1':t==='MongoDB'?'47A248':t==='MySQL'?'4479A1':
    t==='Redis'?'DC382D':t==='Firebase'?'FFCA28':t==='Docker'?'2496ED':
    t==='AWS'?'232F3E':t==='Vercel'?'000000':t==='Netlify'?'00C7B7':
    t==='Git'?'F05032':t==='Tailwind CSS'?'06B6D4':'555555';
  const logoColor = ['JavaScript','Firebase','Rust','Next.js','Express','Flask','AWS','Vercel'].includes(t)?'black':'white';
  return `https://img.shields.io/badge/${encodeURIComponent(t)}-${color}?style=for-the-badge&logo=${slug}&logoColor=${logoColor}`;
};

export function buildReadme(f) {
  const repo = f.githubUser && f.repoName ? `${f.githubUser}/${f.repoName}` : '';
  const lines = [];

  // Banner
  if (f.showBanner && f.projectName) {
    lines.push(`<div align="center">`);
    if (f.logoUrl) lines.push(`\n  <img src="${f.logoUrl}" alt="${f.projectName} logo" width="120" />\n`);
    lines.push(`\n  <h1>${f.projectName}</h1>`);
    if (f.tagline) lines.push(`  <p><em>${f.tagline}</em></p>`);
    lines.push(``);
    // Badges
    const activeBadges = BADGE_PRESETS.filter(b=>f.badges.includes(b.id));
    if (activeBadges.length && repo) {
      lines.push(activeBadges.map(b=>`  [![${b.label}](${b.url(repo)})](https://github.com/${repo})`).join('\n'));
    }
    lines.push(`\n</div>\n`);
  } else if (f.projectName) {
    lines.push(`# ${f.projectName}\n`);
    if (f.tagline) lines.push(`> ${f.tagline}\n`);
  }

  // About
  if (f.description) {
    lines.push(`## 📖 About\n\n${f.description}\n`);
  }

  // Demo
  if (f.demoUrl || f.screenshotUrl) {
    lines.push(`## 🚀 Demo\n`);
    if (f.demoUrl) lines.push(`🔗 **Live Demo:** [${f.demoUrl}](${f.demoUrl})\n`);
    if (f.screenshotUrl) lines.push(`![Screenshot](${f.screenshotUrl})\n`);
  }

  // Features
  if (f.features.filter(Boolean).length) {
    lines.push(`## ✨ Features\n`);
    f.features.filter(Boolean).forEach(ft=>lines.push(`- ${ft}`));
    lines.push('');
  }

  // Tech Stack
  if (f.techs.length) {
    lines.push(`## 🛠️ Tech Stack\n`);
    lines.push(f.techs.map(t=>`![${t}](${ICON_BADGE(t)})`).join(' '));
    lines.push('');
  }

  // Getting Started
  if (f.showGetStarted) {
    lines.push(`## ⚡ Getting Started\n`);
    if (f.prerequisites) {
      lines.push(`### Prerequisites\n\n\`\`\`\n${f.prerequisites}\n\`\`\`\n`);
    }
    if (f.installation) {
      lines.push(`### Installation\n\n\`\`\`bash\n${f.installation}\n\`\`\`\n`);
    }
    if (f.usage) {
      lines.push(`### Usage\n\n\`\`\`bash\n${f.usage}\n\`\`\`\n`);
    }
  }

  // Environment Variables
  if (f.envVars) {
    lines.push(`## 🔑 Environment Variables\n\nCreate a \`.env\` file:\n\n\`\`\`env\n${f.envVars}\n\`\`\`\n`);
  }

  // Contributing
  if (f.showContributing) {
    lines.push(`## 🤝 Contributing\n\nContributions are welcome! Please:\n\n1. Fork the repository\n2. Create your feature branch: \`git checkout -b feature/amazing-feature\`\n3. Commit your changes: \`git commit -m 'Add amazing feature'\`\n4. Push to the branch: \`git push origin feature/amazing-feature\`\n5. Open a Pull Request\n`);
  }

  // License
  if (f.license) {
    lines.push(`## 📝 License\n\nDistributed under the **${f.license}** License.${repo ? ` See [\`LICENSE\`](https://github.com/${repo}/blob/main/LICENSE).` : ''}\n`);
  }

  // Author / Contact
  if (f.authorName || f.authorGithub || f.authorEmail || f.twitterHandle) {
    lines.push(`## 👤 Author\n`);
    if (f.authorName) lines.push(`**${f.authorName}**\n`);
    if (f.authorGithub) lines.push(`- GitHub: [@${f.authorGithub}](https://github.com/${f.authorGithub})`);
    if (f.authorEmail) lines.push(`- Email: [${f.authorEmail}](mailto:${f.authorEmail})`);
    if (f.twitterHandle) lines.push(`- Twitter: [@${f.twitterHandle}](https://twitter.com/${f.twitterHandle})`);
    lines.push('');
  }

  // Acknowledgements
  if (f.acknowledgements) {
    lines.push(`## 🙏 Acknowledgements\n\n${f.acknowledgements}\n`);
  }

  // Footer
  if (repo) {
    lines.push(`---\n\n<div align="center">Made with ❤️ — ⭐ Star this repo if you found it helpful!</div>`);
  }

  return lines.join('\n');
}

const DEFAULT = {
  projectName:'', tagline:'', description:'', githubUser:'', repoName:'',
  logoUrl:'', demoUrl:'', screenshotUrl:'',
  badges:['stars','forks','license'],
  features:['','',''],
  techs:[],
  showBanner:true, showGetStarted:true, showContributing:true,
  prerequisites:'Node.js >= 18\nnpm >= 9',
  installation:'git clone https://github.com/username/repo.git\ncd repo\nnpm install\nnpm run dev',
  usage:'npm run dev',
  envVars:'', license:'MIT',
  authorName:'', authorGithub:'', authorEmail:'', twitterHandle:'',
  acknowledgements:'',
};

export function useReadme() {
  const [form, setForm] = useState(DEFAULT);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const markdown = useMemo(()=>buildReadme(form),[form]);
  return { form, set, markdown };
}
