/**
 * Scan all tool pages for text visibility issues on light backgrounds.
 * Identifies pages where key text elements lack proper dark-color classes.
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

const issues = [];

toolDirs.forEach(slug => {
    const pagePath = path.join(TOOLS_DIR, slug, 'page.js');
    if (!fs.existsSync(pagePath)) return;

    const content = fs.readFileSync(pagePath, 'utf8');
    const pageIssues = [];

    // Check 1: Root div still has text-white without dark: prefix
    // Match text-white that is NOT preceded by dark:
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        // Skip lines where text-white is inside a bg-colored element (buttons, badges etc)
        const hasColoredBg = /bg-(blue|red|green|purple|indigo|primary|gradient|emerald|orange|amber|pink|cyan|teal|violet|fuchsia|rose|sky)-[456789]00/.test(line) || /bg-gradient/.test(line);

        // Find standalone text-white (not dark:text-white)  
        if (/(?<![dark:])text-white/.test(line) && !/dark:text-white/.test(line) && !hasColoredBg) {
            // This is a problematic text-white on a non-colored background
            pageIssues.push({
                line: i + 1,
                content: line.trim().substring(0, 120),
                type: 'standalone-text-white'
            });
        }
    });

    // Check 2: Does the page have a bg-gray-50 or bg-white root but text-white children?
    const haslightRoot = /bg-(gray-50|white|gray-100|slate-50)/.test(content);
    const hasStandaloneTextWhite = content.match(/[^:]text-white/g);

    // Check 3: Labels, descriptions, paragraphs with text-white on light bg
    const textWhiteOnLight = [];
    lines.forEach((line, i) => {
        if (/className=.*text-white/.test(line) && !/dark:/.test(line) && !/bg-/.test(line)) {
            // text-white without dark: variant and no bg color on same element
            textWhiteOnLight.push({ line: i + 1, content: line.trim().substring(0, 120) });
        }
    });

    if (textWhiteOnLight.length > 0) {
        issues.push({
            tool: slug,
            hasLightRoot: haslightRoot,
            problematicLines: textWhiteOnLight.length,
            examples: textWhiteOnLight.slice(0, 5)
        });
    }
});

console.log('=== PAGES WITH POTENTIAL TEXT VISIBILITY ISSUES ===\n');
issues.sort((a, b) => b.problematicLines - a.problematicLines);
issues.forEach(issue => {
    console.log(`${issue.tool} (${issue.problematicLines} issues, lightRoot: ${issue.hasLightRoot})`);
    issue.examples.forEach(ex => {
        console.log(`  L${ex.line}: ${ex.content}`);
    });
    console.log('');
});
console.log('Total tools with issues: ' + issues.length);
