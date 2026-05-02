export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
          <div className="w-8 h-8 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Loading OmniWebKit...
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Preparing your tools
        </p>
      </div>
    </div>
  );
}
