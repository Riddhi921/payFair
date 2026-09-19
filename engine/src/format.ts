/** Minimal, Node- and browser-safe formatting helpers shared across the engine, server, and UI. */

export function money(n: number, digits = 0): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function pctLabel(n: number, digits = 2): string {
  return `${(n * 100).toFixed(digits)}%`;
}
