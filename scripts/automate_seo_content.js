const fs = require('fs');
const path = require('path');
const https = require('https');

// ==========================================
// CONFIGURATION
// ==========================================
// IMPORTANT: Get a free API key from Google AI Studio (https://aistudio.google.com/)
// Run this script like so: GEMINI_API_KEY="your-key-here" node scripts/automate_seo_content.js
const API_KEY = process.env.GEMINI_API_KEY;

const TOOLS_DIR = path.join(__dirname, '../app/tools');
const DELAY_BETWEEN_CALLS_MS = 5000; // 5 seconds delay to prevent rate-limiting

// Tools that have already been updated manually (Gold Standard)
const SKIP_TOOLS = [
  'password-generator',
  'image-converter',
  'image-compressor',
  'pdf-merger',
  'pdf-compressor',
  'popular', // not a tool
  'layout.js', // not a tool
];

if (!API_KEY) {
  console.error('\\x1b[31m[ERROR]\\x1b[0m GEMINI_API_KEY environment variable is missing.');
  console.log('\\x1b[33mHow to run:\\x1b[0m');
  console.log('Windows (Command Prompt):');
  console.log('  set GEMINI_API_KEY="your-key-here" && node scripts/automate_seo_content.js');
  console.log('Windows (PowerShell):');
  console.log('  $env:GEMINI_API_KEY="your-key-here"; node scripts/automate_seo_content.js');
  console.log('Mac/Linux:');
  console.log('  GEMINI_API_KEY="your-key-here" node scripts/automate_seo_content.js');
  process.exit(1);
}

// ==========================================
// SYSTEM PROMPT
// ==========================================
const SYSTEM_PROMPT = `You are an expert, 35-year veteran SEO content strategist. 
Your task is to take the provided short SEO description of a web tool and expand it into a "Gold Standard", highly authoritative, 1,500+ word SEO content block written in React JSX.

Follow this exact structure:
1. Return ONLY valid React JSX code (wrap the entire output in <div className="mt-16 space-y-12">...</div>). Do NOT wrap your response in markdown \`\`\`jsx blocks, just output raw JSX text.
2. Use this exact design aesthetic:
   - Use Tailwind CSS classes.
   - Backgrounds should use subtle gradient colors depending on the tool (e.g., bg-emerald-50/50 dark:bg-emerald-900/10).
   - Use Lucide icons if appropriate, but assume they aren't imported. Use raw SVG or text icons if needed, or stick to clean layout without external icons.
3. Include the following sections:
   - Introduction / Problem Statement (H2 text-3xl font-extrabold)
   - Step-by-Step Guide (Use numbered circles or cards)
   - Key Features & Technical Advantages (Grid layout)
   - Detailed Use Cases
   - Frequently Asked Questions (Use <details> and <summary> tags for an accordion effect)
4. Critical Context: OmniWebKit tools run 100% locally in the browser. Emphasize privacy, zero server uploads, and lightning-fast speed via HTML5/Canvas/WebAssembly.

Make the content incredibly detailed, professional, and optimized for "how to" long-tail search queries.\`;

// ==========================================
// HELPERS
// ==========================================

async function callGeminiAPI(toolName, currentSeoContent) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: \`Tool Name: \${toolName}\\n\\nHere is the current short SEO content:\\n\${currentSeoContent}\\n\\nPlease rewrite and expand this into the massive Gold Standard JSX format.\`
        }]
      }],
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.7,
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: \`/v1beta/models/gemini-2.5-pro:generateContent?key=\${API_KEY}\`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(\`API Error (\${res.statusCode}): \${responseBody}\`));
          return;
        }
        try {
          const parsed = JSON.parse(responseBody);
          let generatedText = parsed.candidates[0].content.parts[0].text;
          
          // Strip markdown wrapping if the model ignored instructions
          if (generatedText.startsWith('\`\`\`jsx')) {
            generatedText = generatedText.replace(/^\`\`\`jsx\\n/, '');
            generatedText = generatedText.replace(/\\n\`\`\`$/, '');
          }
          if (generatedText.startsWith('\`\`\`html')) {
            generatedText = generatedText.replace(/^\`\`\`html\\n/, '');
            generatedText = generatedText.replace(/\\n\`\`\`$/, '');
          }
          
          resolve(generatedText);
        } catch (e) {
          reject(new Error(\`Failed to parse response: \${e.message}\`));
        }
      });
    });

    req.on('error', (e) => { reject(e); });
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// MAIN SCRIPT
// ==========================================
async function main() {
  console.log('\\x1b[36m[OmniWebKit Content Automation]\x1b[0m Starting expansion script...');
  
  if (!fs.existsSync(TOOLS_DIR)) {
    console.error(\`\\x1b[31m[ERROR]\\x1b[0m Tools directory not found at: \${TOOLS_DIR}\`);
    return;
  }

  const items = fs.readdirSync(TOOLS_DIR);
  let processedCount = 0;

  for (const item of items) {
    const itemPath = path.join(TOOLS_DIR, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();

    if (!isDirectory || SKIP_TOOLS.includes(item)) {
      continue;
    }

    // Find page.js or page.jsx
    let pageFile = path.join(itemPath, 'page.js');
    if (!fs.existsSync(pageFile)) {
      pageFile = path.join(itemPath, 'page.jsx');
    }

    if (!fs.existsSync(pageFile)) {
      console.log(\`\\x1b[33m[SKIP]\\x1b[0m No page file found for: \${item}\`);
      continue;
    }

    const content = fs.readFileSync(pageFile, 'utf8');

    // Attempt to locate the SEO Content block
    const seoMatch1 = content.split('{/* ── SEO Content ── */}');
    const seoMatch2 = content.split('{/* SEO Content */}');
    const seoMatch3 = content.split('<!-- SEO Content -->');

    let preContent = '';
    let currentSeoContent = '';
    let splitMarker = '';

    if (seoMatch1.length > 1) {
      preContent = seoMatch1[0];
      currentSeoContent = seoMatch1[1];
      splitMarker = '{/* ── SEO Content ── */}';
    } else if (seoMatch2.length > 1) {
      preContent = seoMatch2[0];
      currentSeoContent = seoMatch2[1];
      splitMarker = '{/* SEO Content */}';
    } else if (seoMatch3.length > 1) {
      preContent = seoMatch3[0];
      currentSeoContent = seoMatch3[1];
      splitMarker = '<!-- SEO Content -->';
    } else {
      console.log(\`\\x1b[33m[SKIP]\\x1b[0m Could not find SEO marker in: \${item}\`);
      continue;
    }

    console.log(\`\\x1b[34m[PROCESSING]\\x1b[0m Generating content for: \${item}...\`);

    try {
      // 1. Call Gemini
      const newSeoContent = await callGeminiAPI(item, currentSeoContent);
      
      // 2. Reconstruct File
      // The currentSeoContent contains the closing tags of the component. We need to preserve them.
      // Easiest hack: just append the closing tags standard to your layout.
      const finalFileContent = preContent + splitMarker + '\\n' + newSeoContent + '\\n      </div>\\n    </div>\\n  );\\n}\\n';

      // 3. Write to disk
      fs.writeFileSync(pageFile, finalFileContent, 'utf8');
      console.log(\`\\x1b[32m[SUCCESS]\\x1b[0m Expanded and saved: \${item}\`);
      processedCount++;

      // Rate limiting
      console.log(\`Waiting \${DELAY_BETWEEN_CALLS_MS/1000}s to avoid rate limits...\`);
      await sleep(DELAY_BETWEEN_CALLS_MS);

    } catch (err) {
      console.error(\`\\x1b[31m[FAILED]\\x1b[0m Error generating \${item}:\`, err.message);
    }
  }

  console.log(\`\\n\\x1b[32m[COMPLETE]\\x1b[0m Successfully expanded \${processedCount} tools.\`);
}

main();
