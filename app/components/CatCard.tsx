/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";

type Card = { id: string; url: string };

export default function CatCard({ card, onSwipe, zIndex, isTop }: {
   card: Card;
   onSwipe: (dir: "left" | "right") => void;
   zIndex?: number;
   isTop: boolean;
}) {
   const cardRef = useRef<HTMLDivElement | null>(null);
   const startTouchPos = useRef<{ x: number; y: number } | null>(null);
   
   // Core movement states
   const [tx, setTx] = useState(0);
   const [ty, setTy] = useState(0);
   const [rot, setRot] = useState(0);
   const [isDragging, setIsDragging] = useState(false);

   useEffect(() => {
      const el = cardRef.current;
      if (!el || !isTop) return;

      function handleTouchStart(e: PointerEvent) {
         setIsDragging(true);
         startTouchPos.current = { x: e.clientX, y: e.clientY };
      }

      function handleTouchMove(e: PointerEvent) {
         if (!startTouchPos.current) return;
         const dx = e.clientX - startTouchPos.current.x;
         const dy = e.clientY - startTouchPos.current.y;

         setTx(dx);
         setTy(dy * 0.2); // Vertical stiffness
         setRot(dx / 20); // Rotation tilt
      }

      function handleTouchEnd(e: PointerEvent) {
         if (!startTouchPos.current) return;
         
         const finalDistanceX = e.clientX - startTouchPos.current.x;
         const SWIPE_THRESHOLD = 120;
         
         if (Math.abs(finalDistanceX) > SWIPE_THRESHOLD) {
            const direction = finalDistanceX > 0 ? "right" : "left";
            // Animate card off-screen
            setTx(direction === "right" ? 1000 : -1000);
            setTimeout(() => onSwipe(direction), 300);
         } else {
            // Snap back to center
            setTx(0);
            setTy(0);
            setRot(0);
         }
         
         setIsDragging(false);
         startTouchPos.current = null;
      }

      el.addEventListener("pointerdown", handleTouchStart);
      window.addEventListener("pointermove", handleTouchMove);
      window.addEventListener("pointerup", handleTouchEnd);

      return () => {
         el.removeEventListener("pointerdown", handleTouchStart);
         window.removeEventListener("pointermove", handleTouchMove);
         window.removeEventListener("pointerup", handleTouchEnd);
      };
   }, [onSwipe, isTop]);

   return (
      <div
         ref={cardRef}
         style={{
            transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg)`,
            zIndex,
            touchAction: "none",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
         }}
         className="absolute inset-0 flex items-center justify-center p-4"
      >
         <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            <img 
               src={card.url} 
               alt="cat" 
               className="w-full h-auto max-h-[60vh] object-cover" 
               draggable={false} 
            />
         </div>
      </div>
   );
}
