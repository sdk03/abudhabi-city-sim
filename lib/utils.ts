import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(val: number): string {
  if (val >= 1_000_000) {
    return (val / 1_000_000).toFixed(1) + 'M';
  }
  if (val >= 1_000) {
    return (val / 1_000).toFixed(1) + 'k';
  }
  return Math.round(val).toLocaleString();
}

export function formatAddress(address: string | null): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
