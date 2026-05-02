export const metadata = {
    title: 'Excel to PDF Converter | Preserve Styling | OmniWebKit',
    description: 'Convert Excel spreadsheets (.xlsx, .xls) and CSV files to high-quality PDF documents. Hybrid engine: fast browser conversion or full-styled server conversion.',
    keywords: [
      'excel to pdf', 'convert excel to pdf', 'csv to pdf', 'spreadsheet to pdf',
      'preserve excel formatting', 'xlsx to pdf'
    ],
    openGraph: {
      title: 'Excel to PDF Converter | Preserve Styling | OmniWebKit',
      description: 'Convert Excel to PDF instantly. Process small files locally or use our secure servers to preserve perfect table formatting.',
      type: 'website',
      url: 'https://omniwebkit.com/tools/excel-to-pdf',
    },
  };
  
  import ExcelToPdfClient from './ExcelToPdfClient';
  
  export default function ExcelToPdfPage() {
    return <ExcelToPdfClient />;
  }
