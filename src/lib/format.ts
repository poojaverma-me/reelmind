export function usd(n: number) {
  if (n === 0) return "$0";
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 1000) return `$${n.toFixed(2)}`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function ms(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${Math.round(n)} ms`;
}

export function pct(p: number, digits = 0) {
  return `${(p * 100).toFixed(digits)}%`;
}

export function runtime(min?: number) {
  if (!min) return "";
  const h = Math.floor(min / 60);
  return h ? `${h}h ${min % 60}m` : `${min}m`;
}
