export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16">
      <Icon className="mx-auto h-8 w-8 text-fg-muted" />
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
    </div>
  );
}
