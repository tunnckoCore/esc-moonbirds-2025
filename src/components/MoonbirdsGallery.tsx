"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { MoonbirdItemResponse } from "@/lib/moonbirds";
import { getMoonbirdsPage } from "@/lib/moonbirds";
import { MoonbirdCard } from "./MoonbirdCard";

export function MoonbirdsGallery() {
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["moonbirds"],
      queryFn: async ({ pageParam = 0 }) => {
        return await getMoonbirdsPage({ data: pageParam });
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (!lastPage.hasMore) return undefined;
        return lastPage.page + 1;
      },
    });

  const items = data.pages.flatMap((page) => page.items);

  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div className="w-full flex flex-wrap gap-2 p-2 justify-center">
        {items.map((item) => (
          <div key={item.id} className="w-24 h-24">
            <MoonbirdCard item={item as MoonbirdItemResponse} />
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
