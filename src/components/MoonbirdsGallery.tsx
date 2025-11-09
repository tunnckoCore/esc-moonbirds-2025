"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import type { MoonbirdItemResponse } from "@/lib/moonbirds";
import { getMoonbirdsPage } from "@/lib/moonbirds";
import { MoonbirdCard } from "./MoonbirdCard";

interface MoonbirdsGalleryProps {
  onClaimedUpdate?: (count: number) => void;
}

export function MoonbirdsGallery({ onClaimedUpdate }: MoonbirdsGalleryProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["moonbirds"],
      queryFn: async ({ pageParam = 0 }) => {
        return await getMoonbirdsPage({ data: pageParam });
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (!lastPage.hasMore) return undefined;
        return lastPage.page + 1;
      },
      staleTime: 1000 * 60 * 5,
    });

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const claimedCount = items.filter((item) => item.txhash !== null).length;

  useEffect(() => {
    onClaimedUpdate?.(claimedCount);
  }, [claimedCount, onClaimedUpdate]);

  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div className="flex flex-wrap gap-2 p-2">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="w-24 h-24 bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-wrap gap-2 p-2 justify-center">
        {items.map((item) => (
          <div key={item.id} className="w-24 h-24">
            <MoonbirdCard
              item={item as MoonbirdItemResponse}
              onMintSuccess={() => {
                // Counter is already updated via claimedCount above
              }}
            />
          </div>
        ))}
      </div>

      <div ref={observerTarget} className="flex justify-center py-8 w-full p-2">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500" />
            <span className="text-sm text-gray-600">Loading more...</span>
          </div>
        )}
        {!hasNextPage && items.length > 0 && (
          <p className="text-sm text-gray-500">No more items to load</p>
        )}
      </div>
    </>
  );
}
