import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: number;        // Size in pixels (default: 48)
  showText?: boolean;   // Show text next to logo (default: true)
}

export function Logo({ size = 48, showText = true }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image 
        src="/images/logo.svg"
        alt="My World Footprint Logo" 
        width={size} 
        height={size}
        className="w-auto h-auto"
      />
      
      {showText && (
        <div className="hidden sm:block">
          <div className="text-sm font-semibold text-vintage-brown">MY WORLD</div>
          <div className="text-xs text-vintage-brown">FOOTPRINT</div>
        </div>
      )}
    </Link>
  );
}