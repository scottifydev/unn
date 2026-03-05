import Link from "next/link";

interface AdUnitProps {
  advertiser: string;
  headline: string;
  body: string;
  tagline?: string;
  ctaText: string;
  ctaUrl: string;
}

export function AdUnit({ advertiser, headline, body, tagline, ctaText, ctaUrl }: AdUnitProps) {
  return (
    <div className="bg-chamber border border-seam p-4">
      <p className="font-barlow text-[8px] uppercase tracking-[0.2em] text-ash text-center mb-3">
        ADVERTISEMENT
      </p>
      <p className="font-barlow text-[10px] uppercase tracking-wide text-ash mb-1">
        {advertiser}
      </p>
      <h3 className="font-cinzel text-paper mb-2">{headline}</h3>
      <p className="font-crimson text-parchment mb-2">{body}</p>
      {tagline && (
        <p className="font-crimson italic text-stone mb-3">{tagline}</p>
      )}
      <Link
        href={ctaUrl}
        className="block w-full bg-garnet text-paper font-barlow uppercase text-center text-tag py-2 px-3 hover:bg-garnet-bright transition-colors"
      >
        {ctaText}
      </Link>
    </div>
  );
}
