interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="font-barlow uppercase text-eyebrow text-garnet-bright border-b border-seam pb-2 mb-3">
      {title}
    </h2>
  );
}
