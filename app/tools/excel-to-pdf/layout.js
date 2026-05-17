import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Excel to PDF Converter Free Online — Convert XLSX to PDF Instantly',
    description:
        'Convert Excel spreadsheets (XLS, XLSX) to PDF online for free. Preserve formulas, charts & formatting. Free Excel to PDF converter — no email, instant download.',
    keywords: [
        'excel to pdf converter online free',
        'convert xlsx to pdf',
        'convert csv to pdf online',
        'spreadsheet to pdf free',
        'xls to pdf converter',
        'excel to pdf without microsoft office',
        'online pdf converter free',
        'convert excel to pdf browser',
        'spreadsheet pdf download',
        'csv to pdf converter free',
    ],
    openGraph: {
        title: 'Free Excel to PDF Converter — .xlsx, .xls & CSV to PDF Online',
        description:
            'Convert Excel and CSV files to PDF in your browser. Supports multi-sheet workbooks, custom title, three table styles, five accent colours, font size control, and page numbers. Free, no upload.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/excel-to-pdf',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Excel to PDF Converter — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Excel to PDF Converter — xlsx, xls & CSV to PDF Online',
        description: 'Convert Excel and CSV files to PDF in your browser. Custom title, table styles, accent colours, font size. Free, no server upload.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/excel-to-pdf',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Excel to PDF Converter',
    description:
        'Free browser-based Excel to PDF converter. Supports .xlsx, .xls (via the xlsx library), and .csv files up to 20 MB. Multi-sheet workbooks: each sheet is placed on a separate PDF page. PDF customisation: custom document title, portrait/landscape orientation, three table styles (Grid, Striped, Plain), five header accent colours (Blue, Green, Violet, Slate, Rose), font size slider (6–12pt), page number toggle, and title toggle. Generated using jsPDF and jsPDF-AutoTable. Files are never uploaded to any server.',
    url: 'https://omniwebkit.com/tools/excel-to-pdf',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
        '@type': 'Organization',
        name: 'Lazydesigners',
        url: 'https://github.com/Dtshirt/omniwebkit',
        sameAs: 'https://github.com/Dtshirt/omniwebkit'
    },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Supports .xlsx, .xls, and .csv files',
        'File size up to 20 MB',
        'Multi-sheet workbook support (one sheet per PDF page)',
        'Scrollable data preview with configurable row count',
        'Sheet tab navigation for multi-sheet files',
        'Custom document title input',
        'Portrait and landscape page orientation',
        'Three table styles: Grid, Striped, Plain',
        'Five header accent colours: Blue, Green, Violet, Slate, Rose',
        'Font size slider (6–12pt)',
        'Optional page number footer',
        'Optional document title header',
        'Fully browser-based — no file upload to any server',
        'Drag-and-drop file upload support',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Excel to PDF Online for Free',
    description: 'Steps to convert an Excel spreadsheet or CSV file to a PDF document using the OmniWebKit Excel to PDF Converter.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload your file', text: 'Drag and drop your Excel (.xlsx, .xls) or CSV (.csv) file onto the upload area, or click to browse. Files up to 20 MB are supported.' },
        { '@type': 'HowToStep', position: 2, name: 'Preview your data', text: 'Check the data preview panel. If your workbook has multiple sheets, use the tabs to switch between them. Adjust how many rows are displayed with the row selector.' },
        { '@type': 'HowToStep', position: 3, name: 'Configure PDF settings', text: 'Enter a document title, choose portrait or landscape orientation, select a table style, pick a header colour, and set font size and page number preferences.' },
        { '@type': 'HowToStep', position: 4, name: 'Click Convert to PDF', text: 'The tool generates the PDF entirely in your browser. Multi-sheet workbooks produce one page per sheet.' },
        { '@type': 'HowToStep', position: 5, name: 'Download the PDF', text: 'The PDF downloads automatically with your chosen title as the filename. Click Convert Another to process a new file.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this Excel to PDF converter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account, no subscription, no usage limits.' } },
        { '@type': 'Question', name: 'Is my file uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. The conversion happens entirely in your browser. Your Excel or CSV file never leaves your device.' } },
        { '@type': 'Question', name: 'What file formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'The tool supports .xlsx, .xls (Excel formats), and .csv (comma-separated values). Maximum file size is 20 MB.' } },
        { '@type': 'Question', name: 'Can it handle workbooks with multiple sheets?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Each sheet in a multi-sheet workbook is placed on a separate page in the PDF. The document title and sheet name are printed at the top of each page.' } },
        { '@type': 'Question', name: 'What if my table is too wide for the page?', acceptedAnswer: { '@type': 'Answer', text: 'Switch to landscape orientation, reduce the font size using the slider, or remove unnecessary columns from the Excel file before converting. The table will auto-wrap long cell text to fit.' } },
        { '@type': 'Question', name: 'Are Excel formulas included in the PDF?', acceptedAnswer: { '@type': 'Answer', text: 'No — the PDF shows the calculated values, not the underlying formulas. This is the same as what you see displayed in the cells in Excel.' } },
        { '@type': 'Question', name: 'Can I change the PDF filename?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter a custom title in the Document Title field — the downloaded PDF will use that as its filename. Leave it blank to use the original filename.' } },
        { '@type': 'Question', name: 'What do the three table styles do?', acceptedAnswer: { '@type': 'Answer', text: 'Grid adds borders to all cell sides for a formal look. Striped alternates row colours for easy reading. Plain uses header formatting only, with no row borders, for a minimal modern appearance.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Excel to PDF Converter', item: 'https://omniwebkit.com/tools/excel-to-pdf' },
    ],
};

export default function ExcelToPdfLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="excel-to-pdf" category="file" />
        </>
    );
}
