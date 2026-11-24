export default function InputLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="h-8 w-64 rounded-[8px] bg-border animate-pulse" />
        <div className="h-4 w-72 rounded-[6px] bg-border animate-pulse mt-3" />
      </div>

      <div className="bg-surface border border-border rounded-[10px] px-6 sm:px-8 py-7 space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 rounded-[4px] bg-border animate-pulse" />
            <div className="h-10 w-full rounded-[8px] bg-surface-hover animate-pulse" />
          </div>
        ))}
        <div className="border-t border-border" />
        <div className="h-10 w-48 rounded-[8px] bg-surface-hover animate-pulse" />
        <div className="h-10 w-52 rounded-[8px] bg-accent/10 animate-pulse" />
      </div>
    </div>
  );
}
