'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useCommandStore } from '@/hooks/useCommandStore';
import { tools } from '@/lib/tools-data';
import { Search } from 'lucide-react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export default function CommandPalette() {
  const { isOpen, setOpen, toggleOpen } = useCommandStore();
  const router = useRouter();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleOpen();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleOpen]);

  // A tiny custom style block to handle cmdk's aria-selected styles 
  // without needing global CSS setups.
  useEffect(() => {
    if (!document.getElementById('cmdk-styles')) {
      const style = document.createElement('style');
      style.id = 'cmdk-styles';
      style.innerHTML = `
        [cmdk-overlay] {
          position: fixed;
          inset: 0;
          z-index: 99;
          background-color: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
        }
        .dark [cmdk-overlay] {
          background-color: rgba(2, 6, 23, 0.8);
        }
        [cmdk-item][aria-selected="true"] {
          background-color: var(--color-primary-50, #eff6ff);
          color: var(--color-primary-700, #1d4ed8);
        }
        .dark [cmdk-item][aria-selected="true"] {
          background-color: rgba(30, 58, 138, 0.4);
          color: var(--color-primary-400, #60a5fa);
        }
        [cmdk-item][aria-selected="true"] .icon-wrapper {
          background-color: white;
        }
        .dark [cmdk-item][aria-selected="true"] .icon-wrapper {
          background-color: #0f172a;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed z-[100] top-[15vh] sm:top-[20vh] left-[50%] translate-x-[-50%] w-[calc(100%-2rem)] max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
    >
      <VisuallyHidden>
        <DialogTitle>Search OmniWebKit Tools</DialogTitle>
      </VisuallyHidden>

      <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <Command.Input
            placeholder="Search all 100+ tools... (Try 'pdf' or 'regex')"
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-lg sm:text-base p-0"
          />
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <Command.Empty className="py-10 text-center text-sm text-slate-500">
            No tools found matching your search.
          </Command.Empty>
          
          <Command.Group heading="All Tools" className="text-xs font-semibold text-slate-500 dark:text-slate-500 mb-2 px-2 pt-2 uppercase tracking-wider">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Command.Item
                  key={tool.id}
                  value={tool.name}
                  onSelect={(value) => {
                    setOpen(false);
                    router.push(tool.path);
                  }}
                  className="flex items-center space-x-3 px-3 py-3 mt-1 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none"
                >
                  <div className="icon-wrapper flex items-center justify-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 group-aria-selected:text-primary-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      {tool.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {tool.description}
                    </span>
                  </div>
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm font-mono font-medium">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm font-mono font-medium">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm font-mono font-medium">Enter</kbd>
            <span>to open</span>
          </div>
        </div>
    </Command.Dialog>
  );
}
