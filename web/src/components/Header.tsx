export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            P
          </div>
          <div>
            <div className="text-base font-bold leading-tight text-ink-900">PayFair</div>
            <div className="text-xs leading-tight text-ink-500">Payment-terms advisor</div>
          </div>
        </div>
        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-ink-500 sm:inline-block">
          No login · Nothing is ever sent
        </span>
      </div>
    </header>
  );
}
