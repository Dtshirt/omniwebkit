/**
 * Fix text visibility across all tool pages.
 * Replaces standalone `text-white` with `text-gray-900 dark:text-white`
 * where text is on light backgrounds (not inside colored containers like buttons).
 * 
 * Run: node scripts/fix-text-visibility.js
 */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', 'app', 'tools');

const toolDirs = fs.readdirSync(TOOLS_DIR).filter(name => {
    const fullPath = path.join(TOOLS_DIR, name);
    return fs.statSync(fullPath).isDirectory()
        && name !== '[category]'
        && name !== 'popular'
        && name !== 'node_modules';
});

let totalFixed = 0;
let filesFixed = 0;

toolDirs.forEach(slug => {
    const pagePath = path.join(TOOLS_DIR, slug, 'page.js');
    if (!fs.existsSync(pagePath)) return;

    let content = fs.readFileSync(pagePath, 'utf8');
    const original = content;

    // Pattern: Elements with text-white that are NOT on colored backgrounds
    // We need to be careful to only fix text on light backgrounds
    // 
    // Safe to fix: headings (h1-h6), paragraphs (p), spans, divs with text content
    // that use text-white without a bg-color on the same element
    //
    // Do NOT fix: buttons, badges, labels with bg-color, icons inside colored circles

    const lines = content.split('\n');
    const fixedLines = lines.map((line, i) => {
        // Skip if line already has dark:text-white (already properly handled)
        if (/dark:text-white/.test(line)) return line;

        // Skip if line has a colored background class on same element
        const hasColoredBg = /bg-(blue|red|green|purple|indigo|primary|gradient|emerald|orange|amber|pink|cyan|teal|violet|fuchsia|rose|sky|yellow)-[3456789]00/.test(line)
            || /bg-gradient/.test(line)
            || /from-(blue|red|green|purple|indigo|primary|emerald|orange|amber|pink|cyan|teal|violet|fuchsia|rose|sky|yellow)-/.test(line);

        if (hasColoredBg) return line;

        // Skip if it's an icon class (w-5 h-5, w-6 h-6 etc within same className)
        const isIcon = /className=.*[wh]-[456789]\s.*text-white/.test(line) && /<[A-Z]/.test(line);

        // Fix: Replace standalone text-white with text-gray-900 dark:text-white
        // Only for text elements: h1-h6, p, span, div, label
        if (/text-white/.test(line) && !isIcon) {
            // Handle text-white/90, text-white/80 etc (opacity variants)
            let fixed = line.replace(/text-white\/(\d+)/g, 'text-gray-700 dark:text-white/$1');
            // Handle plain text-white
            fixed = fixed.replace(/(?<![dark:])text-white(?![\/\d])/g, 'text-gray-900 dark:text-white');
            // Clean up any double dark:text-white
            fixed = fixed.replace(/dark:text-white dark:text-white/g, 'dark:text-white');

            if (fixed !== line) {
                totalFixed++;
                return fixed;
            }
        }

        return line;
    });

    const newContent = fixedLines.join('\n');
    if (newContent !== original) {
        fs.writeFileSync(pagePath, newContent, 'utf8');
        filesFixed++;
        console.log('Fixed: ' + slug + '/page.js');
    }
});

console.log('\nDone! Fixed ' + totalFixed + ' text instances across ' + filesFixed + ' files.');
