
// 3. app/components/TemplateSelector.js - Template Selection Component
'use client';
import { templates } from '@/app/data/templates';

export default function TemplateSelector({ onSelect }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Deployment Templates</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(templates).map(([key, template]) => (
          <div
            key={key}
            className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-soft transition-shadow cursor-pointer bg-white dark:bg-slate-800"
            onClick={() => onSelect(template.content)}
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">{template.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {template.name}
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              {template.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}