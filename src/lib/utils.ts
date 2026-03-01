import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function calculateScore(results: {
  meta: { score: number };
  headings: { score: number };
  images: { score: number };
  links: { score: number };
  mobile: { score: number };
  ssl: { score: number };
}): number {
  const weights = {
    meta: 0.2,
    headings: 0.15,
    images: 0.15,
    links: 0.2,
    mobile: 0.15,
    ssl: 0.15,
  };

  const score =
    results.meta.score * weights.meta +
    results.headings.score * weights.headings +
    results.images.score * weights.images +
    results.links.score * weights.links +
    results.mobile.score * weights.mobile +
    results.ssl.score * weights.ssl;

  return Math.round(score);
}

export function getRankChange(history: Array<{ rank: number }>): "up" | "down" | "stable" {
  if (history.length < 2) return "stable";
  const last = history[history.length - 1].rank;
  const previous = history[history.length - 2].rank;
  
  if (last < previous) return "up";
  if (last > previous) return "down";
  return "stable";
}

export function getRankChangeNumber(history: Array<{ rank: number }>): number {
  if (history.length < 2) return 0;
  return history[history.length - 2].rank - history[history.length - 1].rank;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
