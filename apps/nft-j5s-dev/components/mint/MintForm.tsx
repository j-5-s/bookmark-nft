import { useState, useRef, useEffect, ReactNode, FormEvent } from "react";
import { useAccount } from "wagmi";
import { BookmarkABI } from "@j5s/contracts";
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useContractReads,
} from "wagmi";
import { Address } from "../../types";
import { ChainData } from "../../hooks/useContract";

export type TokenMeta = {
  data?: {
    hasItemizedClonePrice: boolean;
    clonePrice: bigint | undefined;
  } | null;
  loading?: boolean;
  error?: Error | null;
};

export type SubmitData = {
  tx?: `0x${string}` | null;
  loading: boolean;
  success: boolean;
  error?: Error | null;
};

type MintFormProps = {
  children: ReactNode | ReactNode[];
  contractAddress: Address;
  tokenURI: string;
  url: string;
  chainData?: ChainData;
  className?: string;
  tokenId?: string;
  clone?: boolean;
  onError?: (error: Error) => void;
  onLoad?: (metadata: TokenMeta) => void;
  onSubmit?: (data: SubmitData) => void;
};

export const MintForm = (props: MintFormProps) => {
  const {
    contractAddress,
    tokenURI,
    url,
    chainData,
    children,
    className,
    tokenId,
    clone = false,
    onLoad,
    onError,
    onSubmit,
  } = props;
  const account = useAccount();
  // const [errorMessage, setError] = useState<Error | null>(null);

  const isOwner = chainData && chainData?.owner === account.address;

  const isOwnerOrApprovedMinter =
    isOwner ||
    chainData?.approvedMinters?.includes(
      (account?.address || "") as `0x${string}`
    );

  const tokenMetaRef = useRef<TokenMeta>({
    data: null,
    loading: true,
    error: null,
  });

  const opts = {
    address: contractAddress,
    abi: BookmarkABI,
    functionName: clone ? "mintClone" : "mintNFT",
    args: clone ? [tokenId, tokenURI, url] : [tokenURI, url],
    enabled: isOwner || (clone && !!tokenId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: undefined as any,
  };

  const clonePrice = tokenMetaRef.current?.data?.hasItemizedClonePrice
    ? tokenMetaRef.current.data?.clonePrice
    : chainData?.defaultClonePrice;

  if (clonePrice && clone) {
    opts.value = clonePrice;
  }
  const { config, error: prepareError } = usePrepareContractWrite(opts);

  const {
    data,
    error,
    write,
    isLoading: isNotificationLoading,
  } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  // Clone details

  const contractInput = {
    address: contractAddress,
    abi: BookmarkABI,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const cloneDataResponse = useContractReads({
    enabled: !!tokenId,
    contracts: [
      {
        ...contractInput,
        functionName: "getHasClonePrice",
        args: [`${tokenId}`],
      },
      {
        ...contractInput,
        functionName: "getClonePrice",
        args: [`${tokenId}`],
      },
    ],
  });

  if (
    cloneDataResponse.status === "success" &&
    cloneDataResponse?.data?.length
  ) {
    tokenMetaRef.current = {
      data: {
        hasItemizedClonePrice: cloneDataResponse.data[0]
          .result as unknown as boolean,
        clonePrice: cloneDataResponse.data[1].result as unknown as bigint,
      },
    };
  }

  console.log(cloneDataResponse);

  useEffect(() => {
    if (onError && (error || prepareError)) {
      onError((error || prepareError) as Error);
    }
  }, [error, prepareError, onError]);

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    write?.();
  };

  useEffect(() => {
    if (onSubmit) {
      onSubmit({
        loading: isLoading || isNotificationLoading,
        tx: data?.hash,
        success: isSuccess,
      });
    }
  }, [isSuccess, isLoading, isNotificationLoading, data?.hash, onSubmit]);

  useEffect(() => {
    if (!tokenMetaRef.current?.loading) {
      if (onLoad) {
        onLoad(tokenMetaRef.current);
      }
    }
  }, [onLoad]);

  useEffect(() => {
    if (onError && !tokenMetaRef.current?.loading) {
      if (contractAddress && !isOwnerOrApprovedMinter && !tokenId) {
        onError(new Error("You are not approved to mint this token"));
      } else if (!contractAddress) {
        onError(new Error("Please select a contract address"));
      }
    }
  }, [contractAddress, isOwnerOrApprovedMinter, tokenId, onError]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};
