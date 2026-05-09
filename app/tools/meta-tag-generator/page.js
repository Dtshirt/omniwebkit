import Breadcrumbs from '@/components/seo/Breadcrumbs';
import MetaTagGeneratorClient from './MetaTagGeneratorClient';
import { seoData } from '@/lib/seoData';

export default function MetaTagGeneratorPage() {
    const tool = seoData['meta-tag-generator'];

    return (
        <div className="w-full font-sans">
            <div className="mb-8">
                <Breadcrumbs 
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Tools', href: '/tools' },
                        { label: 'Meta Tag Generator', href: '/tools/meta-tag-generator' },
                    ]} 
                />
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
                    {tool.title}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    {tool.description}
                </p>
            </div>

            <MetaTagGeneratorClient />
        </div>
    );
}
