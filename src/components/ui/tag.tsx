interface TagProps {
  variant?: "section" | "lead" | "exclusive";
  children: React.ReactNode;
  color?: string;
}

const VARIANT_CLASSES = {
  section: "border-stone text-graphite",
  lead: "border-garnet-bright text-garnet",
  exclusive: "border-pewter text-graphite",
} as const;

export function Tag({ variant = "section", children, color }: TagProps) {
  return (
    <span
      className={`inline-block font-barlow font-bold text-tag tracking-[0.18em] uppercase border px-[7px] py-[2px] rounded-sm ${VARIANT_CLASSES[variant]}`}
      style={color ? { borderColor: color } : undefined}
    >
      {children}
    </span>
  );
}
