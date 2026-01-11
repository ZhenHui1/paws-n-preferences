/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import { Heart, X } from 'lucide-react';

type Card = { id: string; url: string };

export default function CatCard({ card, onSwipe, zIndex, isTop }: {
   card: Card;
   onSwipe: (dir: "left" | "right") => void;
   zIndex?: number;
   isTop: boolean;
}) {
   const cardRef = useRef<HTMLDivElement | null>(null);   // Reference to the card element
   const startTouchPos = useRef<{ x: number; y: number } | null>(null);   // Track starting pointer position
   const [tx, setTx] = useState(0);    // tx: offset x, how far (left/right) the card has been dragged
   const [ty, setTy] = useState(0);    // ty: offset y, how far (up/down) the card has been dragged
   const [rot, setRot] = useState(0);  // rot: rotation angle (tilt) of the card during drag
   const [isImageReady, setIsImageReady] = useState(false); // Track image load state
   const [isTakingTooLong, setIsTakingTooLong] = useState(false); // Track if loading is slow
   const [isDragging, setIsDragging] = useState(false); // Track if the card is being actively dragged

   useEffect(() => {
      const el = cardRef.current;   // Current card element
      if (!el || !isTop) return;    // Only add listeners to the top card

      // If image isn't loaded in 5s, show the slow connection message
      const timer = setTimeout(() => {
         if (!isImageReady) setIsTakingTooLong(true);
      }, 5000)

      function handleTouchStart(e: PointerEvent) {
         e.preventDefault();
         
         // capture on the card element so moves are tracked even when pointer is over the image
         try {
            el!.setPointerCapture(e.pointerId);
         } catch { }

         setIsDragging(true);  // Mark as dragging
         startTouchPos.current = { x: e.clientX, y: e.clientY };  // Record where the finger/pointer touched
      }

      function handleTouchMove(e: PointerEvent) {
         if (!startTouchPos.current) return;

         // Calculate distance moved from starting point
         const dx = e.clientX - startTouchPos.current.x;   // dx: delta x - distance moved horizontally
         const dy = e.clientY - startTouchPos.current.y;   // dy: delta y - distance moved vertically

         // Update translation and rotation states
         setTx(dx);
         // setTy(dy);
         setTy(dy * 0.2);  // Add "stiffness" - resists vertical movement
         setRot(dx / 20);  // Rotate card based on horizontal movement
      }

      function handleTouchEnd(e: PointerEvent) {
         if (!startTouchPos.current) return; // No starting point means no drag occurred
         
         const finalDistanceX = e.clientX - startTouchPos.current.x; // Total horizontal distance moved
         const SWIPE_THRESHOLD = 120; // Minimum distance in px to consider a swipe
         
         if (Math.abs(finalDistanceX) > SWIPE_THRESHOLD) {
            const direction = finalDistanceX > 0 ? "right" : "left"; // It's a swipe!
            
            // Throw the card off-screen
            setTx(direction === "right" ? window.innerWidth : -window.innerWidth);
            setRot(direction === "right" ? 30 : -30);
            
            // Notify to change index after the animation with a slight delay
            setTimeout(() => onSwipe(direction), 300);
         } else {
            // Not a swipe! - reset position
            setTx(0);
            setTy(0);
            setRot(0);
         }

         setIsDragging(false); // Dragging ended
         startTouchPos.current = null; // Reset starting position
      }

      el.addEventListener("pointerdown", handleTouchStart);
      window.addEventListener("pointermove", handleTouchMove);
      window.addEventListener("pointerup", handleTouchEnd);
      window.addEventListener("pointercancel", handleTouchEnd);

      return () => {
         clearTimeout(timer); // Clear the timer if card is unmounted
         el.removeEventListener("pointerdown", handleTouchStart);
         window.removeEventListener("pointermove", handleTouchMove);
         window.removeEventListener("pointerup", handleTouchEnd);
         window.removeEventListener("pointercancel", handleTouchEnd);
      };
   }, [onSwipe, isTop, isImageReady]);

   // Calculate how visible the Heart/X icons (overlays) should be (0 to 1)
   const overlayVisibility = Math.min(Math.abs(tx) / 120, 1);

   return (
      <div
         ref={cardRef}
         style={{
            // Apply translation and rotation styles
            transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${isTop ? 1 : 0.96})`,
            opacity: isTop ? 1 : 0.5,
            zIndex,
            touchAction: "none",
            // If the card is being actively dragged, disable transitions for immediate response, else enable smooth transitions
            transition: isDragging ? "none" : "all 0.3s ease-out",
         }}
         className="absolute inset-0 select-none"
      >
         <div className="flex h-full w-full items-center justify-center p-4">
            <div className="relative h-auto w-auto max-h-full max-w-full overflow-hidden rounded-xl bg-white shadow-lg shadow-black/10">
               {/* Skeleton Loader */}
               {!isImageReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-200 p-6">
                     <div className="flex justify-center gap-2">
                        <span className="animate-bounce [animation-delay:-0.3s] text-4xl">🐾</span>
                        <span className="animate-bounce [animation-delay:-0.15s] text-4xl">🐾</span>
                        <span className="animate-bounce text-4xl">🐾</span>
                     </div>
                     <div className="mt-4 text-center">
                        {isTakingTooLong ? (
                           <p className="text-sm font-medium text-neutral-500 animate-pulse">
                              Almost there... 🐈‍⬛
                           </p>
                        ) : (
                           <p className="text-xs font-medium text-neutral-400">
                              Contacting Cat Distribution System...
                           </p>
                        )}
                     </div>
                  </div>
               )}

               <img
                  src={card.url}
                  alt={`cat-${card.id}`}
                  onLoad={() => setIsImageReady(true)} // Hide skeleton when ready
                  className={`block w-full h-auto min-h-87.5 max-h-[65vh] object-cover transition-opacity duration-500 ${isImageReady ? "opacity-100" : "opacity-0"
                     }`}
                  /* 1. w-full: Forces the small image to stretch to the width of the card.
                     2. min-h-[300px]: Ensures the card is never a tiny sliver.
                     3. object-cover: Makes sure the image fills that space without distortion.
                  */
                  style={{ imageRendering: 'auto' }}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
               />

               {/* --- OVERLAYS --- */}
               {/* These will now automatically center on the ACTUAL image area */}
               <div
                  style={{ opacity: tx < 0 ? overlayVisibility : 0 }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full w-[clamp(100px,50cqmin,200px)] h-[clamp(100px,50cqmin,200px)] bg-slate-100/90 backdrop-blur-md shadow-2xl transition-all duration-300"
               >
                  <X size={'clamp(50px,20cqw,100px)'} fill="#3f3f46" color="#3f3f46" />
               </div>

               <div
                  style={{ opacity: tx > 0 ? overlayVisibility : 0 }}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full w-[clamp(100px,50cqmin,200px)] h-[clamp(100px,50cqmin,200px)] bg-red-50/90 backdrop-blur-md shadow-2xl transition-all duration-300"
               >
                  <Heart size={'clamp(50px,20cqw,100px)'} fill="#e11d48" color="#e11d48" />
               </div>
            </div>
         </div>
      </div>
   );
}
