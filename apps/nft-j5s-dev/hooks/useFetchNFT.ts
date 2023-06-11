import { useEffect, useState } from "react";
import { useContractRead, useContractReads } from "wagmi";
import { BookmarkABI } from "@j5s/contracts";
import { fetchData } from "../components/util";
import { NFTMetadata } from "../types";

type Props = {
  contractAddress: `0x${string}`;
  tokenId: bigint;
};

type FetchState = {
  data: NFTMetadata | null;
  error?: string | null;
  loading: boolean;
  tokenURI: string | null;
};

export type TokenChainData = {
  uri: string;
  creator: string;
  isClone: boolean;
  ownerOf: string;
  hasClonePrice: boolean;
  clonePrice: bigint;
  cloneOf?: bigint;
};

export const useFetchNFT = (props: Props) => {
  const { tokenId, contractAddress } = props;

  const [state, setState] = useState<FetchState>({
    loading: false,
    data: null,
    tokenURI: null,
    error: null,
  });
  const { data, isLoading } = useContractRead({
    address: contractAddress,
    abi: BookmarkABI,
    args: [tokenId],
    functionName: "tokenURI",
    staleTime: 1000 * 60 * 5,
    enabled: !!(contractAddress && tokenId),
  });

  const contractInput = {
    address: contractAddress,
    abi: BookmarkABI,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const readsResponse = useContractReads({
    enabled: !!contractAddress,
    contracts: [
      {
        ...contractInput,
        functionName: "getTokenCreator",
        args: [tokenId],
      },
      {
        ...contractInput,
        functionName: "isClone",
        args: [tokenId],
      },
      {
        ...contractInput,
        functionName: "ownerOf",
        args: [tokenId],
      },
      {
        ...contractInput,
        functionName: "getClonePrice",
        args: [tokenId],
      },
      {
        ...contractInput,
        functionName: "getHasClonePrice",
        args: [tokenId],
      },
      {
        ...contractInput,
        functionName: "getOriginal",
        args: [tokenId],
      },
    ],
  });

  const chainData = {
    uri: "",
    creator: "",
    isClone: false,
    ownerOf: "",
    clonePrice: BigInt(0),
    hasClonePrice: false,
  } as TokenChainData;

  if (readsResponse.data) {
    chainData.uri = data as string;
    chainData.creator = readsResponse.data[0].result as unknown as string;
    chainData.isClone = readsResponse.data[1].result as unknown as boolean;
    chainData.ownerOf = readsResponse.data[2].result as unknown as string;

    chainData.clonePrice = readsResponse.data[3].result as unknown as bigint;
    chainData.hasClonePrice = readsResponse.data[4]
      .result as unknown as boolean;

    const cloneOf = readsResponse.data[5].result as unknown as bigint;
    if (cloneOf) {
      chainData.cloneOf = cloneOf;
    }
  }

  useEffect(() => {
    if (data && typeof data === "string") {
      (async () => {
        setState((existing) => ({
          ...existing,
          loading: true,
        }));
        const metadata = await fetchData(data);
        setState({
          data: metadata,
          tokenURI: data,
          loading: false,
          error: null,
        });
      })();
    }
  }, [data]);
  return {
    ...state,
    tokenChainData: chainData,
    loading: state.loading || isLoading,
  };
};
