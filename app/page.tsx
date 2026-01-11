/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import CatCard from "./components/CatCard";
import { getCats, type Cat } from "@/lib/cat-api";
import PawBackground from "./components/PawBackground";

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);  // List of cats to swipe through
  const [likedCats, setLikedCats] = useState<Cat[]>([]); // Cats the user liked
  const [cardIndex, setCardIndex] = useState(0);  // Current position in the cat deck
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch new batch of cats
  const fetchNewCats = async () => {
    setLoading(true);
    try {
      const data = await getCats(10);
      setCats(data);    // Update cat list
      setCardIndex(0);  // Reset position
      setLikedCats([]); // Clear liked cats
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  // CALL API: Instant Load Server Component - Fetch cats on mount
  useEffect(() => {
    fetchNewCats();
  }, []);

  // Handle swipe action
  function handleSwipe(direction: "left" | "right", cat: Cat) {
    // If swiped right, add to "favourites" list
    if (direction === "right") setLikedCats((prevList) => [...prevList, cat]);
    // Move to the next card
    setCardIndex((i) => i + 1);
  }

  // Check if all cards have been swiped
  const finished = cardIndex >= cats.length && !loading;

  // Loading state
  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-3xl font-bold tracking-wide">
        Fetching cats... 🐈
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-8 justify-center items-center flex">
      <PawBackground />
      <main className="mx-auto w-full portrait:mt-12 portrait:mb-12">
        <header className="mb-6 justify-between">
          <h1 className="flex flex-col flex-1 items-center text-3xl font-bold text-neutral-500">
            Paws & Preferences
          </h1>
          <h1 className="flex flex-col flex-1 items-center text-xl font-semibold tracking-tight text-neutral-500">
            Find Your Favourite Kitty!
          </h1>

          {!finished && (
            <div className="flex flex-col flex-1 items-center text-sm text-neutral-600">
              <span className="bg-neutral-400/20 px-5 py-2 rounded-full mt-2">
                {cardIndex + 1} / {cats.length}
              </span>
            </div>
          )}
        </header>

        {!finished ? (
          <div className="relative h-[clamp(400px,65vh,800px)] w-full">
            {/* Loop through the cat deck */}
            {cats.map((cat, currentIndex) => {
              // Safety check: Ignore cats without IDs
              if (!cat?.id) return null;

              /**
               * Only put a few cards in the DOM at a time for performance
               * - Active Card: The one the user sees, cardIndex (1ST)
               * - Next Card: Peeking out from underneath, cardIndex + 1 (2ND)
               * - Preload: Hidden cards loading images in the background (3RD 4TH 5TH)
               */
              const isVisible = currentIndex >= cardIndex && currentIndex <= cardIndex + 1;
              const isPreloading = currentIndex > cardIndex + 1 && currentIndex <= cardIndex + 4;
              // If NOT ACTIVE (isVisible) or NOT PRELOADING (isPreloading), skip rendering
              if (!isVisible && !isPreloading) return null;

              return (
                <div
                  key={cat.id}
                  className={
                    isPreloading ? "invisible pointer-events-none" : "block"
                  }
                  aria-hidden={isPreloading}
                >
                  <CatCard
                    card={cat}
                    isTop={currentIndex === cardIndex}  // The very top card is the only one swipeable
                    onSwipe={(direction) => handleSwipe(direction, cat)}
                    zIndex={cats.length - currentIndex} // Higher = lower in the stack
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <section className="space-y-6 landscape:space-y-0">
            {likedCats.length !== 0 && (
              <div className="rounded-lg bg-white p-6 sm:mb-6 max-w-100 block mx-auto shadow text-center hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-semibold text">
                  🐾&nbsp;Purr-fect match!&nbsp;🐾
                </h2>
                <p className="text-md text-zinc-600">
                  You liked {likedCats.length} cat(s).
                </p>
              </div>
            )}

            {likedCats.length === 0 && (
              <div className="rounded-lg bg-white p-6 sm:mb-6 max-w-100 block mx-auto shadow text-center hover:shadow-md transition-shadow">
                <h2 className="text-2xl text-zinc-600">
                  No kitties fetched. 😿
                </h2>
                <p className="text-lg text-zinc-600">Wanna try again?</p>
              </div>
            )}

            <div className="columns-2 gap-3 space-y-3">
              {likedCats.map((cat) => (
                <div
                  key={cat.id}
                  className="break-inside-avoid overflow-hidden rounded-lg bg-white shadow-sm border border-neutral-100"
                >
                  <img
                    src={cat.url}
                    alt={`cat-${cat.id}`}
                    className="w-full h-auto block" // h-auto to show full aspect ratio
                  />
                </div>
              ))}
            </div>

            <button
              className="
                block mx-auto w-full max-w-60 select-none rounded-full 
                bg-rose-400 px-6 py-4 text-white text-xl font-bold tracking-wide 
                /* 3D Shadow Effect */
                shadow-[0_8px_0_0_#be123c] 
                
                /* Mobile-specific: Pressing down makes it squish */
                active:translate-y-2 active:shadow-none active:bg-rose-500
                
                /* Desktop-only: Hover effects only work on devices that support hover */
                @media(hover:hover){hover:shadow-[0_4px_0_0_#be123c] hover:translate-y-1 hover:bg-rose-300}
                
                transition-all duration-150 group
              "
              onClick={() => {
                setCardIndex(0);  // Reset position
                setLikedCats([]); // Clear liked cats
              }}
            >
              <span className="flex items-center justify-center gap-2">
                Try Again
                <span className="transition-transform duration-300 group-active:rotate-20 group-active:scale-110 @media(hover:hover){group-hover:rotate-[20deg] group-hover:scale-110}">
                  🐱
                </span>
              </span>
            </button>
            <button
              className="
                block mx-auto w-full max-w-60 select-none rounded-full 
                bg-sky-400 px-6 py-4 text-white text-xl font-bold tracking-wide 
                /* 3D Shadow Effect */
                shadow-[0_8px_0_0_#0369a1] 
                
                /* Mobile-specific: Pressing down makes it squish */
                active:translate-y-2 active:shadow-none active:bg-sky-500
                
                /* Desktop-only: Hover effects only work on devices that support hover */
                @media(hover:hover){hover:shadow-[0_4px_0_0_#0369a1] hover:translate-y-1 hover:bg-sky-300}
                
                transition-all duration-150 group
              "
              onClick={fetchNewCats}
            >
              <span className="flex items-center justify-center gap-2">
                Start New
                <span className="transition-transform duration-300 group-active:rotate-20 group-active:scale-110 @media(hover:hover){group-hover:rotate-[20deg] group-hover:scale-110}">
                  🔃
                </span>
              </span>
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
