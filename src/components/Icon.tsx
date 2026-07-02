import React from 'react';
import * as Icons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function Icon({ name, className, size = 18, style }: IconProps) {
  // Gracefully fallback to Link icon if requested icon name doesn't match
  const LucideIcon = (Icons as any)[name];
  if (!LucideIcon) {
    // Attempt lowercase fallback or common replacements
    const matchedKey = Object.keys(Icons).find(
      (k) => k.toLowerCase() === name.toLowerCase()
    );
    if (matchedKey) {
      const FallbackIcon = (Icons as any)[matchedKey];
      return <FallbackIcon className={className} size={size} style={style} />;
    }
    // Default to Link
    return <Icons.Link className={className} size={size} style={style} />;
  }

  return <LucideIcon className={className} size={size} style={style} />;
}
