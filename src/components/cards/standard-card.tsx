import Link from "next/link";
import { EngravingPattern } from "@/components/ui/engraving-pattern";

interface StandardCardProps {
  headline: string;
  dek?: string;
  sectionName: string;
  sectionColor?: string;
  author: string;
  date: string;
  slug: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function StandardCard({
  headline,
  dek,
  sectionName,
  sectionColor = "#8b1a1a",
  author,
  date,
  slug,
  imageUrl,
  imageAlt,
}: StandardCardProps) {
  return (
    <Link href={`/article/${slug}`} className="group block">
      <article className="bg-chamber hover:bg-slate transition-colors duration-200">
        <div className="aspect-video bg-graphite relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt ?? headline}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <EngravingPattern />
          )}
        </div>
        <div className="p-4">
          <span
            className="font-barlow text-tag uppercase font-semibold inline-block mb-2"
            style={{ color: sectionColor }}
          >
            {sectionName}
          </span>
          <h3
            className="font-cinzel font-bold text-paper group-hover:text-parchment transition-colors duration-200 mb-2"
            style={{ fontSize: "clamp(18px, 2vw, 22px)" }}
          >
            {headline}
          </h3>
          {dek && (
            <p className="font-crimson text-stone line-clamp-2 text-sm mb-3">
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
