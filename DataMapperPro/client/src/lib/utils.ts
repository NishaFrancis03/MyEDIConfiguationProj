import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

// Simplified function to pretty print JSON
export function formatJSON(json: any): string {
  return JSON.stringify(json, null, 2);
}

// Simple formatter to highlight JSON syntax
export function highlightJSON(json: string): string {
  // This is a simple version, in a real app you would use a proper syntax highlighter
  return json
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/"([^"]+)"/g, '<span class="json-string">"$1"</span>')
    .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
    .replace(/\b(null)\b/g, '<span class="json-null">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');
}

// Function to check if a string is valid JSON
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

// Converts paths like 'parent.child[0].name' to structured object
export function pathToField(path: string): { name: string; path: string } {
  const lastSegment = path.split('.').pop() || '';
  const name = lastSegment.split('[')[0];
  return { name, path };
}
