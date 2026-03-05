interface CouncilAdvisoryProps {
  level: 1 | 2 | 3;
  title: string;
  body: string;
  issuedAt: string;
}

const LEVEL_CONFIG = {
  1: {
    label: "ROUTINE",
    badgeClass: "bg-graphite text-stone",
  },
  2: {
    label: "ELEVATED",
    badgeClass: "bg-transparent text-pewter",
  },
  3: {
    label: "CRITICAL",
    badgeClass: "bg-garnet text-paper",
  },
} as const;

export function CouncilAdvisory({ level, title, body, issuedAt }: CouncilAdvisoryProps) {
  const config = LEVEL_CONFIG[level];
  const borderClass = level === 3 ? "border-l-2 border-garnet" : "border-l-2 border-seam";

  return (
    <div className={`bg-chamber p-4 ${borderClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-barlow uppercase text-eyebrow text-garnet-bright">
          VAMPIRE COUNCIL ADVISORY
        </span>
      </div>
      <span
        className={`inline-block font-barlow text-tag uppercase font-bold px-2 py-0.5 mb-2 ${config.badgeClass}`}
      >
        LEVEL {level} &mdash; {config.label}
      </span>
      <h3 className="font-cinzel text-paper mb-2">{title}</h3>
      <p className="font-crimson text-parchment mb-2">{body}</p>
      <time className="font-barlow text-ash text-[10px] uppercase tracking-wide">
        {issuedAt}
      </time>
    </div>
  );
}
