"use client";

interface TickerItem {
  id: string;
  text: string;
}

interface BreakingTickerProps {
  items: TickerItem[];
}

export function BreakingTicker({ items }: BreakingTickerProps) {
  return (
    <>
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="h-[30px] bg-chamber border-y border-seam flex items-stretch overflow-hidden">
        <div className="flex-shrink-0 bg-garnet px-3 flex items-center z-10">
          <span className="font-barlow text-[12px] font-bold uppercase text-paper leading-none">
            Breaking
          </span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div
            className="flex items-center h-full whitespace-nowrap"
            style={{ animation: "ticker-scroll 60s linear infinite" }}
          >
            {[...items, ...items].map((item, i) => (
              <span key={`${item.id}-${i}`} className="flex items-center">
                <span className="text-seam mx-3 text-[12px]">&#9670;</span>
                <span className="font-barlow text-[12px] text-stone">{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
