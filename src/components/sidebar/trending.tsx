import Link from "next/link";
import { SectionHeader } from "./section-header";

interface TrendingItem {
  id: string;
  headline: string;
  href?: string;
}

interface TrendingProps {
  items: TrendingItem[];
}

export function Trending({ items }: TrendingProps) {
  return (
    <div>
      <SectionHeader title="TRENDING" />
      <ol className="space-y-3">
        {items.map((item, index) => {
          const content = (
            <div className="flex items-start gap-3">
              <span className="font-cinzel text-[1.5rem] leading-none text-seam select-none">
                {index + 1}
              </span>
              <span className="font-crimson text-parchment group-hover:text-paper transition-colors leading-snug">
                {item.headline}
              </span>
            </div>
          );

          return (
            <li key={item.id}>
              {item.href ? (
                <Link href={item.href} className="group block">
                  {content}
                </Link>
              ) : (
                <div className="group">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
