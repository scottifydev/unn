interface EngravingPatternProps {
  className?: string;
}

export function EngravingPattern({ className = "" }: EngravingPatternProps) {
  return (
    <div
      className={`absolute inset-0 opacity-[0.08] ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 4px,
          currentColor 4px,
          currentColor 5px
        ),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 4px,
          currentColor 4px,
          currentColor 5px
        )`,
      }}
    />
  );
}
