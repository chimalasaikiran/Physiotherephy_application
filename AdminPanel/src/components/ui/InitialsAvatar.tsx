import React from 'react';

/**
 * Dynamically extracts initials from a full name.
 * Examples:
 * - "Rahul Sharma" -> "RS"
 * - "Priya" -> "P"
 * - "Dr. Sarah Chen" -> "SC"
 */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return '?';

  // Remove common honorifics/prefixes if present
  const cleaned = name
    .replace(/^(Dr\.|Dr|Mr\.|Mr|Mrs\.|Mrs|Ms\.|Ms|Prof\.|Prof)\s+/i, '')
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Hash string to pick a consistent background color palette for each name
 */
function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const GRADIENTS = [
  'bg-gradient-to-br from-blue-500 to-indigo-700 text-white',
  'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
  'bg-gradient-to-br from-emerald-500 to-teal-700 text-white',
  'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
  'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  'bg-gradient-to-br from-violet-500 to-purple-700 text-white',
  'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
  'bg-gradient-to-br from-sky-500 to-indigo-700 text-white',
];

interface InitialsAvatarProps {
  name?: string;
  className?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name = 'User',
  className = 'w-10 h-10 text-sm font-bold',
}) => {
  const initials = getInitials(name);
  const colorIndex = getColorIndex(name || 'User') % GRADIENTS.length;
  const gradientClass = GRADIENTS[colorIndex];

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 font-bold select-none shadow-xs border border-white/20 ${gradientClass} ${className}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
};
