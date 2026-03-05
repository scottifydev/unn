interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h2 className="font-cinzel text-paper text-lg mb-2">{title}</h2>
      {description && (
        <p className="font-crimson text-stone">{description}</p>
      )}
    </div>
  );
}
