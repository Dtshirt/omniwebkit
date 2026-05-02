const fs = require('fs');
const path = require('path');

const files = [
    'app/layout.js',
    'app/page.js',
    'app/not-found.js',
    'app/tools/layout.js',
    'app/about/page.js',
    'app/privacy/page.js',
    'app/terms/page.js',
    'app/contact/page.js',
    'app/offline/page.js',
    'app/tools/qr-generator/page.js',
    'app/tools/word-to-pdf/page.js',
    'app/tools/pdf-merger/page.js',
    'app/tools/image-watermark/page.js',
    'app/tools/image-cropper/page.js',
    'app/tools/certificate-generator/page.js',
    'app/tools/background-remover/page.js',
    'components/layout/Header.js',
    'components/layout/Footer.js',
    'components/ui/LoadingSpinner.js',
    'components/ui/DonateModal.js',
    'public/manifest.json',
];

let count = 0;
files.forEach(f => {
    const p = path.join(process.cwd(), f);
    try {
        let data = fs.readFileSync(p, 'utf8');
        const original = data;
        data = data.replace(/https:\/\/multitools\.com/g, 'https://omniwebkit.com');
        data = data.replace(/MultiTools/g, 'OmniWebKit');
        if (data !== original) {
            fs.writeFileSync(p, data, 'utf8');
            count++;
            console.log('Fixed: ' + f);
        } else {
            console.log('No changes: ' + f);
        }
    } catch (e) {
        console.log('Skip: ' + f + ' (' + e.code + ')');
    }
});

console.log('\nDone! Fixed ' + count + ' files.');
