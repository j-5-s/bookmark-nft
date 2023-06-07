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
    onLoad,
    onError,
    onSubmit,
  } = props;
  const account = useAccount();
  const [errorMessage, setError] = useState<Error | null>(null);
  const [tokenId, setTokenId] = useState<bigint | undefined>();
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
    functionName: !isOwnerOrApprovedMinter ? "mintClone" : "mintNFT",
    args: !isOwnerOrApprovedMinter ? [tokenId, tokenURI] : [tokenURI, url],
    enabled: !isOwnerOrApprovedMinter ? !!tokenId : true,
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
  console.log(prepareError);
  const {
    data,
    error,
    write,
    isLoading: isNotificationLoading,
  } = useContractWrite(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  useEffect(() => {
    if (onError && (error || prepareError || errorMessage)) {
      onError((errorMessage || error || prepareError) as Error);
    }
  }, [error, prepareError, errorMessage]);

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    write?.();
  };

  const contractInput = {
    address: contractAddress,
    abi: BookmarkABI,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  const getTokenIdByUrlResponse = useContractReads({
    enabled: !!contractAddress,
    contracts: [
      {
        ...contractInput,
        functionName: "getTokenIdByUrl",
        args: [url],
      },
    ],
  });

  const getTokenIdByUrlResponseData = getTokenIdByUrlResponse.data?.[0];
  useEffect(() => {
    const data = getTokenIdByUrlResponseData;
    console.log(data);
    if (data?.status === "success" && data?.result) {
      setTokenId(data.result as unknown as bigint);
    } else {
      // @todo !isOwner is needed because new urls will have an error
      // response from getTokenIdByUrlResponseData
      if (data?.status === "failure" && !isOwnerOrApprovedMinter) {
        setError(new Error(data.error.message));
      }
      setTokenId(undefined);
    }
  }, [getTokenIdByUrlResponseData, isOwnerOrApprovedMinter]);

  const cloneDataResponse = useContractReads({
    enabled: !!(tokenId && !isOwnerOrApprovedMinter),
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
    // no cloning functionality for isOwner
    if (
      isOwnerOrApprovedMinter &&
      getTokenIdByUrlResponseData?.status === "success"
    ) {
      setContractMetadata({
        data: {
          isOwner: !!isOwner,
          isOwnerOrApprovedMinter: !!isOwnerOrApprovedMinter,
          tokenId: getTokenIdByUrlResponseData.result as unknown as bigint,
          hasItemizedClonePrice: false,
          clonePrice: undefined,
        },
      });
    }
  }, [getTokenIdByUrlResponseData?.status, isOwner, isOwnerOrApprovedMinter]);

  useEffect(() => {
    if (getTokenIdByUrlResponseData?.status === "success" && !isOwner) {
      const [hasClonePriceData, clonePriceData] = cloneDataResponse.data || [];
      let clonePrice = clonePriceData?.result as unknown as bigint;

      if (typeof clonePrice === "undefined") {
        clonePrice = defaultClonePrice;
      }

      setContractMetadata({
        data: {
          isOwner: !!isOwner,
          isOwnerOrApprovedMinter: !!isOwnerOrApprovedMinter,
          tokenId: getTokenIdByUrlResponseData.result as unknown as bigint,
          hasItemizedClonePrice:
            hasClonePriceData?.result as unknown as boolean,
          clonePrice,
        },
        loading: false,
      });
    }
  }, [
    tokenId,
    isOwner,
    cloneDataResponse?.status,
    getTokenIdByUrlResponseData?.result,
    defaultClonePrice,
  ]);

  useEffect(() => {
    if (onSubmit) {
      onSubmit({
        loading: isLoading || isNotificationLoading,
        tx: data?.hash,
        success: isSuccess,
      });
    }
  }, [isSuccess, isLoading, isNotificationLoading, data?.hash]);

  useEffect(() => {
    if (!contractMetadata.loading) {
      if (onLoad) {
        onLoad(contractMetadata);
      }
    }
  }, [contractMetadata]);

  useEffect(() => {
    if (onError && !contractMetadata.loading) {
      if (contractAddress && !isOwnerOrApprovedMinter && !tokenId) {
        onError(new Error("Token does not exist to clone. "));
      } else if (!contractAddress) {
        onError(new Error("Please select a contract address"));
      }
    }
  }, [contractAddress, isOwnerOrApprovedMinter, tokenId, contractMetadata]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};
