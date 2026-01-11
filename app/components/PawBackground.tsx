'use client';
import { PawPrint } from 'lucide-react';

export default function PawBackground() {
  // Array to create enough icons to cover the screen width
  const pawRow = Array.from({ length: 10 });
  // Array to create enough rows to cover the screen height
  const rows = Array.from({ length: 8 });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      {/* The Wrapper: Rotated to create the diagonal look */}
      <div className="absolute -inset-[50%] rotate-[-25deg] flex flex-col justify-center gap-16 opacity-[50] pointer-events-none">
        
        {rows.map((_, rowIndex) => (
          <div 
            key={rowIndex}
            /* Stagger movement: even rows go left, odd rows go right */
            className={`flex gap-16 whitespace-nowrap ${
              rowIndex % 2 === 0 ? 'animate-marquee' : 'animate-marquee-reverse'
            }`}
          >
            {/* We render the set twice for a seamless loop */}
            {[...pawRow, ...pawRow].map((_, i) => (
              <div key={i} className={i % 2 === 0 ? "mt-8" : ""}>
                <PawPrint size={64} fill="#ededed" color="#ededed"/>
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}
