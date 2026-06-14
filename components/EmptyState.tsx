export default function EmptyState({
  icon = "✦",
  title,
  children,
  badge,
}: {
  icon?: string;
  title: string;
  children?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="glass-card text-center py-14 px-6">
      <div className="text-4xl mb-3 opacity-80">{icon}</div>
      <h2 className="text-lg font-semibold mb-1.5">{title}</h2>
      {children && <p className="text-white/45 text-sm max-w-md mx-auto leading-relaxed">{children}</p>}
      {badge && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-warn/15 px-3 py-1 text-xs text-warn">
          <span className="w-1.5 h-1.5 rounded-full bg-warn animate-beat" />
          {badge}
        </div>
      )}
    </div>
  );
}
