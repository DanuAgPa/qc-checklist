export default function RiwayatLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="h-8 w-48 rounded-[8px] bg-[#E2E5EA] animate-pulse" />
        <div className="h-4 w-72 rounded-[6px] bg-[#E2E5EA] animate-pulse mt-3" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="h-9 w-64 rounded-[8px] bg-[#E2E5EA] animate-pulse" />
        <div className="h-9 w-36 rounded-[8px] bg-[#E2E5EA] animate-pulse" />
      </div>

      <div className="border border-[#E2E5EA] rounded-[10px] overflow-hidden bg-[#FFFFFF]">
        <div className="bg-[#F7F8FA] border-b border-[#E2E5EA] px-3.5 py-3 flex gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 flex-1 rounded-[4px] bg-[#E2E5EA] animate-pulse" />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b border-[#E2E5EA] px-3.5 py-4 flex gap-4 items-center">
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} className="h-4 flex-1 rounded-[4px] bg-[#F1F2F4] animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
