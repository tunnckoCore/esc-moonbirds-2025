import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { MoonbirdsGallery } from "../components/MoonbirdsGallery";
import { ConnectButton } from "../components/ConnectButton";
import { getMoonbirdsPage, MoonbirdItemResponse } from "../lib/moonbirds";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    // no await
    context.queryClient.prefetchInfiniteQuery({
      queryKey: ["moonbirds"],
      queryFn: async ({ pageParam = 0 }) => {
        return await getMoonbirdsPage({ data: pageParam });
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: {
        items: MoonbirdItemResponse[];
        page: number;
        hasMore: boolean;
      }): number | undefined =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
    });

    // no return, and no awaits
  },
  component: RouteComponent,
});

function RouteComponent() {
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
                href="https://github.com/tunnckoCore/esc-moonbirds"
                className="text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >
                Old Repo
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
            </p>
          </div>
          <ConnectButton />
        </div>
      </div>

      <div className="max-w-full mx-auto">
        <Suspense fallback={<GalleryLoading />}>
          <MoonbirdsGallery />
        </Suspense>
      </div>
    </div>
  );
}

function GalleryLoading() {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="w-24 h-24 bg-gray-800 animate-pulse"
        />
      ))}
    </div>
  );
}
