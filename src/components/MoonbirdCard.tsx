"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { toHex } from "viem";
import type { MoonbirdItemResponse } from "@/lib/moonbirds";

interface MoonbirdCardProps {
  item: MoonbirdItemResponse;
  onMintSuccess?: (txHash: string) => void;
}

const MoonbirdCardContent = ({ item, onMintSuccess }: MoonbirdCardProps) => {
  const isClaimed = item.txhash !== null;
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.dismiss();
      toast.error("Please connect your wallet first");
      return;
    }

    if (!walletClient) {
      toast.dismiss();
      toast.error("Wallet client not initialized");
      return;
    }

    setIsPending(true);

    try {
      const txHash = await walletClient.sendTransaction({
        to: address,
        value: 0n,
        data: toHex(item.content_uri),
      });

      setIsPending(false);
      setIsConfirming(true);

      toast.dismiss();
      toast.loading("Confirming transaction...", {
        description: <TxHashLink hash={txHash} />,
      });

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({
          hash: txHash,
          confirmations: 1,
        });
      }

      toast.dismiss();
      toast.success(`Moonbird #${item.id} ethscribed!`, {
        description: <TxHashLink hash={txHash} />,
      });

      onMintSuccess?.(txHash);
      setIsConfirming(false);
    } catch {
      setIsPending(false);
      setIsConfirming(false);
      toast.dismiss();
      toast.error("Mint failed", {
        duration: 5000,
      });
    }
  };

  const cardContent = (
    <img
      src={item.url}
      alt={`Moonbird #${item.id}`}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );

  if (isClaimed) {
    return (
      <a
        href={`https://ethscriptions.com/ethscriptions/${item.txhash}`}
        target="_blank"
        rel="noopener noreferrer"
        title={`Moonbirds #${item.id} - ${item.txhash}`}
        className="block w-full h-full border-2 border-dashed border-red-500 opacity-60"
      >
        {cardContent}
      </a>
    );
  }

  const isLoading = isPending || isConfirming;

  return (
    <button
      type="button"
      onClick={handleMint}
      disabled={isLoading}
      title={`Mint Moonbirds #${item.id}`}
      className="w-full h-full relative group cursor-pointer"
    >
      {cardContent}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-white text-xs font-semibold text-center px-1">
          {isPending
            ? "Sending..."
            : isConfirming
              ? "Confirming..."
              : "Click to Mint"}
        </span>
      </div>
    </button>
  );
};

const truncateTxHash = (hash: string) => {
  return `${hash.slice(0, 12)}...${hash.slice(-4)}`;
};

const TxHashLink = ({ hash }: { hash: string }) => (
  <a
    href={`https://etherscan.io/tx/${hash}`}
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:no-underline text-blue-400"
  >
    {truncateTxHash(hash)}
  </a>
);

export function MoonbirdCard({ item, onMintSuccess }: MoonbirdCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full bg-gray-800" />;
  }

  return <MoonbirdCardContent item={item} onMintSuccess={onMintSuccess} />;
}
