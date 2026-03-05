import Link from "next/link";

interface OpinionItem {
  id: string;
  author: string;
  bio: string;
  headline: string;
  slug: string;
  avatarUrl?: string;
}

interface OpinionStripProps {
  items: OpinionItem[];
}

export function OpinionStrip({ items }: OpinionStripProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x-0 md:divide-x divide-seam">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/opinion/${item.slug}`}
          className="group px-4 py-3"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-[38px] h-[38px] rounded-full bg-slate flex-shrink-0 overflow-hidden">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  viewBox="0 0 38 38"
                  className="w-full h-full text-ash"
                  fill="currentColor"
                >
                  <circle cx="19" cy="14" r="7" />
                  <ellipse cx="19" cy="34" rx="13" ry="11" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-barlow font-bold text-[10px] uppercase text-parchment">
                {item.author}
              </p>
              <p className="font-barlow text-ash text-[10px] truncate">
                {item.bio}
              </p>
            </div>
          </div>
          <h3 className="font-cinzel text-[14px] italic text-parchment group-hover:text-paper transition-colors leading-snug">
            {item.headline}
          </h3>
        </Link>
      ))}
    </div>
  );
}
