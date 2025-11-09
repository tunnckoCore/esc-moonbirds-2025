import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { MoonbirdsGallery } from "../components/MoonbirdsGallery";
import { ConnectButton } from "../components/ConnectButton";
import { getMoonbirdsPage } from "../lib/moonbirds";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient.prefetchInfiniteQuery({
      queryKey: ["moonbirds"],
      queryFn: async ({ pageParam = 0 }) => {
        return await getMoonbirdsPage({ data: pageParam });
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: {
        items: Array<{
          id: number;
          url: string;
          content_sha: string;
          txhash: string | null;
        }>;
        page: number;
        hasMore: boolean;
      }): number | undefined =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [claimedCount, setClaimedCount] = useState(0);

  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-50 bg-black border-b border-gray-800 shadow-lg">
        <div className="w-full mx-auto p-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Ethscriptions Moonbirds Gallery
            </h1>
            <p className="text-gray-400">
              All 10,000 Moonbirds •{" "}
              <a
                href="https://github.com/tunnckoCore/esc-moonbirds-2025"
                className="text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>{" "}
              •{" "}
              <a
                href="https://github.com/proofxyz/moonbirds-assets/tree/main/collection/png"
                className="text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                PROOFxyz Moonbirds
              </a>{" "}
              • Ethscribed:{" "}
              <span className="text-green-400 font-semibold">
                {claimedCount}
              </span>
            </p>
          </div>
          <ConnectButton />
        </div>
      </div>

      <div className="max-w-full mx-auto">
        <Suspense fallback={<GalleryLoading />}>
          <MoonbirdsGallery onClaimedUpdate={setClaimedCount} />
        </Suspense>
      </div>
    </div>
  );
}

function GalleryLoading() {
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
