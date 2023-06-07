import { MouseEvent, useEffect } from "react";
import { useWaitForTransaction, useContractWrite } from "wagmi";
import { BookmarkABI } from "@j5s/contracts";
import { useRouter } from "next/router";
import { NFTMetadata } from "../../../types";

type Props = {
  address: `0x${string}`;
  tokenId?: bigint;
  metadata?: NFTMetadata | null;
  onError?: (err: Error) => void;
};
export const Burn = (props: Props) => {
  const { address, tokenId, metadata, onError } = props;

  const router = useRouter();

  const url = metadata?.attributes.find((attr) => attr.trait_type === "URL");

  const { data, isLoading, write, error } = useContractWrite({
    address,
    abi: BookmarkABI,
    functionName: "burnToken",
    args: [tokenId, url?.value],
  });

  const { isLoading: isLoadingTx, isSuccess: isSuccessTx } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  const handleBurn = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    write?.();
  };

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccessTx) {
      router.push(`/address/${address}`);
    }
  }, [isSuccessTx]);
  return (
    <button
      disabled={isLoading || isLoadingTx}
      onClick={handleBurn}
      className="flex mt-4 text-red text-red-500 py-2 px-8 border-red-500 border focus:outline-none hover:bg-red-100 rounded text-lg"
    >
      Burn
    </button>
  );
};
