export function formatPopulation(n) {
  return n.toLocaleString('en-IN');
}

export function formatTemp(t) {
  if (t === null || t === undefined || Number.isNaN(t)) return '—';
  return `${t.toFixed(1)}°`;
}

export function formatClock(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

export function formatHour(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}
