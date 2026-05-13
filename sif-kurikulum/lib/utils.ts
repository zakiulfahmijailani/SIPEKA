import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  }).format(new Date(date))
}

export function formatSKS(teori: number, praktik: number): string {
  return `${teori + praktik} SKS (T:${teori}, P:${praktik})`
}
