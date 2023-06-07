import React from "react";
import { formatEther } from "viem";
type MintButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  isOwner?: boolean;
  value?: bigint; // Should replace 'any' with the appropriate type
  symbol?: string; // Should replace 'any' with the appropriate type
  defaultClonePrice?: bigint;
  hasItemizedClonePrice?: boolean;
};

export const MintButton = (props: MintButtonProps) => {
  const {
    disabled,
    isLoading,
    isOwner,
    value,
    symbol,
    defaultClonePrice,
    hasItemizedClonePrice,
  } = props;

  const clonePrice = hasItemizedClonePrice ? value : defaultClonePrice;

  return (
    <button
      disabled={disabled}
      type="submit"
      className="flex-1 text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg disabled:opacity-25"
    >
      {isLoading ? "Minting..." : "Mint"}
      {!isOwner && !disabled
        ? ` Clone for ${formatEther(clonePrice || BigInt(0))} ${symbol}`
        : ""}
    </button>
  );
};
