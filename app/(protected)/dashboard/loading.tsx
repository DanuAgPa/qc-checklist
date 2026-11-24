export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="h-8 w-56 rounded-[8px] bg-[#E2E5EA] animate-pulse" />
        <div className="h-4 w-80 rounded-[6px] bg-[#E2E5EA] animate-pulse mt-3" />
      </div>

      <div className="h-10 w-full max-w-xl rounded-[8px] bg-[#E2E5EA] animate-pulse mb-6" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E5EA] rounded-[10px] overflow-hidden border border-[#E2E5EA] mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] px-5 py-4">
            <div className="h-3 w-20 rounded-[4px] bg-[#E2E5EA] animate-pulse mb-3" />
            <div className="h-8 w-16 rounded-[6px] bg-[#E2E5EA] animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E2E5EA] rounded-[10px] p-6">
            <div className="h-4 w-44 rounded-[4px] bg-[#E2E5EA] animate-pulse mb-5" />
            <div className="space-y-4">
              <div className="h-2.5 w-full rounded-full bg-[#E2E5EA] animate-pulse" />
              <div className="h-2.5 w-full rounded-full bg-[#E2E5EA] animate-pulse" />
              <div className="h-2.5 w-3/4 rounded-full bg-[#E2E5EA] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
