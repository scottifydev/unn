interface EyebrowProps {
  children: React.ReactNode;
}

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <span className="font-barlow font-semibold text-eyebrow tracking-[0.2em] uppercase text-garnet-bright">
      {children}
    </span>
  );
}
