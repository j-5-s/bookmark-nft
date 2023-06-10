import { useState, useEffect, ReactNode, FormEvent } from "react";
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

export type ContractMeta = {
  data?: {
    tokenId: bigint;
    hasItemizedClonePrice: boolean;
    clonePrice: bigint | undefined;
    isOwner: boolean;
    isOwnerOrApprovedMinter: boolean;
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
  tokenId?: bigint;
  clone?: boolean;
  onError?: (error: Error) => void;
  onLoad?: (metadata: ContractMeta) => void;
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
  const [errorMessage, setError] = useState<Error | null>(null);

  const isOwner = chainData && chainData?.owner === account.address;

  const defaultClonePrice = BigInt(chainData?.defaultClonePrice || 0);
  const isOwnerOrApprovedMinter =
    isOwner ||
    chainData?.approvedMinters?.includes(
      (account?.address || "") as `0x${string}`
    );

  const [contractMetadata, setContractMetadata] = useState<ContractMeta>({
    data: null,
    loading: true,
    error: null,
  });

  const opts = {
    address: contractAddress,
    abi: BookmarkABI,
    functionName: clone ? "mintClone" : "mintNFT",
    args: clone ? [tokenId, tokenURI] : [tokenURI, url],
    enabled: isOwner || (clone && !!tokenId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: undefined as any,
  };

  const clonePrice = contractMetadata?.data?.hasItemizedClonePrice
    ? contractMetadata.data?.clonePrice
    : chainData?.defaultClonePrice;

  if (!isOwnerOrApprovedMinter && clonePrice) {
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

  useEffect(() => {
    if (onError && (error || prepareError || errorMessage)) {
      onError((errorMessage || error || prepareError) as Error);
    }
  }, [error, prepareError, errorMessage, onError]);

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
    if (!contractMetadata.loading) {
      if (onLoad) {
        onLoad(contractMetadata);
      }
    }
  }, [contractMetadata, onLoad]);

  useEffect(() => {
    if (onError && !contractMetadata.loading) {
      if (contractAddress && !isOwnerOrApprovedMinter && !tokenId) {
        onError(new Error("You must speci. "));
      } else if (!contractAddress) {
        onError(new Error("Please select a contract address"));
      }
    }
  }, [
    contractAddress,
    isOwnerOrApprovedMinter,
    tokenId,
    contractMetadata,
    onError,
  ]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};
