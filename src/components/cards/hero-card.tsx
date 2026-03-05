import Link from "next/link";
import { EngravingPattern } from "@/components/ui/engraving-pattern";

interface HeroCardProps {
  headline: string;
  dek?: string;
  sectionName: string;
  sectionColor?: string;
  author: string;
  date: string;
  slug: string;
  imageUrl?: string;
}

export function HeroCard({
  headline,
  dek,
  sectionName,
  sectionColor = "#8b1a1a",
  author,
  date,
  slug,
  imageUrl,
}: HeroCardProps) {
  return (
    <Link href={`/article/${slug}`} className="group block">
      <article className="relative bg-graphite overflow-hidden aspect-[4/3] min-h-[280px] sm:aspect-[16/9] sm:min-h-[400px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <EngravingPattern />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-void" />
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 sm:p-6 sm:pb-8">
          <span
            className="font-barlow text-tag uppercase font-semibold inline-block mb-3"
            style={{ color: sectionColor }}
          >
            {sectionName}
          </span>
          <h2
            className="font-cinzel font-bold text-paper group-hover:text-parchment transition-colors duration-200 mb-3"
            style={{ fontSize: "clamp(22px, 3vw, 38px)" }}
          >
            {headline}
          </h2>
          {dek && (
            <p className="font-crimson text-parchment text-base line-clamp-2 mb-3 max-w-2xl">
              {dek}
            </p>
          )}
          <div className="font-barlow text-ash text-[10px] uppercase tracking-wide">
            {author} &middot; {date}
          </div>
        </div>
      </article>
    </Link>
  );
}
