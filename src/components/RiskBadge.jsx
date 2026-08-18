export default function RiskBadge({ risk, size = 'md' }) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-display font-semibold tracking-wide uppercase border ${sizes[size]}`}
      style={{
        color: risk.color,
        borderColor: `${risk.color}55`,
        backgroundColor: `${risk.color}14`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: risk.color }} />
      {risk.label}
    </span>
  );
}
