import { useEffect, useRef } from "react";
import { useContractReads, useAccount, useNetwork, useBalance } from "wagmi";
import { db } from "../db/db";
import { BookmarkABI } from "@j5s/contracts";

type Props = {
  address?: `0x${string}` | undefined;
  transactionHash?: `0x${string}` | undefined;
};
type Balance = {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
};
export type ChainData = {
  name: string;
  symbol: string;
  owner: string;
  balance?: Balance;
  totalTokens: string;
  creator: string;
  description: string;
  createdAt: number;
  defaultClonePrice: bigint;
  approvedMinters: `0x${string}`[];
};

type ReturnData = {
  data?: ChainData;
  loading: boolean;
  error?: string;
};

export const useContract = (props: Props): ReturnData => {
  const { address, transactionHash } = props;

  const { isConnected, address: userAddress } = useAccount();
  const network = useNetwork();

  const { data: balance } = useBalance({
    address,
    enabled: !!address,
  });

  const contractInput = {
    address: address,
    abi: BookmarkABI,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  let errorMsg;
  const { data, isLoading } = useContractReads({
    enabled: !!address,
    contracts: [
      {
        ...contractInput,
        functionName: "name",
      },
      {
        ...contractInput,
        functionName: "symbol",
      },
      {
        ...contractInput,
        functionName: "owner",
      },
      {
        ...contractInput,
        functionName: "getTotalMintedTokens",
      },
      {
        ...contractInput,
        functionName: "getContractCreator",
      },
      {
        ...contractInput,
        functionName: "description",
      },
      {
        ...contractInput,
        functionName: "creationTime",
      },
      {
        ...contractInput,
        functionName: "getDefaultClonePrice",
      },
      {
        ...contractInput,
        functionName: "getApprovedMinters",
      },
    ],
  });

  const ret = useRef<ChainData>({
    name: "",
    symbol: "",
    owner: "",
    totalTokens: "",
    creator: "",
    description: "",
    createdAt: 0,
    defaultClonePrice: BigInt(0),
    approvedMinters: [],
  });

  if (balance) {
    ret.current.balance = balance;
  }
  if (data) {
    ret.current.name = data[0].result as unknown as string;
    ret.current.symbol = data[1].result as unknown as string;
    ret.current.owner = data[2].result as unknown as string;
    // const balance = data[3].result as unknown as number;
    // if (balance) {
    //   ret.balanceOf = balance;
    // }
    const totalTokens = data[3].result as unknown as bigint;
    ret.current.totalTokens = totalTokens?.toString();

    ret.current.creator = data[4].result as unknown as string;
    ret.current.description = data[5].result as unknown as string;
    const createdAt = data[6].result as unknown as bigint;
    if (createdAt) {
      ret.current.createdAt = Number(createdAt) * 1000;
    }
    const defaultClonePrice = data[7].result as unknown as bigint;
    if (typeof defaultClonePrice !== "undefined") {
      ret.current.defaultClonePrice = BigInt(defaultClonePrice);
    }
    const approvedMinters = data[8].result as unknown as `0x${string}`[];
    ret.current.approvedMinters = approvedMinters;
  }

  // @todo better error handling.
  const status = data?.[0].status as unknown as string;
  if (status === "failure") {
    errorMsg = "Contract not found";
  }
  useEffect(() => {
    (async () => {
      if (
        ret.current.name &&
        isConnected &&
        address &&
        userAddress &&
        network?.chain?.network
      ) {
        try {
          const existingContract = await db.contracts.get({
            address,
          });
          if (!existingContract && ret) {
            const id = await db.contracts.add({
              address: address as string,
              user: userAddress as string,
              txHash: transactionHash as string,
              name: ret.current.name,
              network: network.chain.network,
              symbol: ret.current.symbol,
              creator: ret.current.creator,
              owner: ret.current.owner,
              description: ret.current.description,
              createdAt: ret.current.createdAt,
            });
            console.log(id, "added to db");
          } else if (existingContract?.id) {
            // handle case where contract already exists in the DB
            db.contracts.update(existingContract.id, {
              address: address as string,
              user: userAddress as string,
              txHash: transactionHash as string,
              name: ret.current.name,
              network: network.chain.network,
              symbol: ret.current.symbol,
              creator: ret.current.creator,
              owner: ret.current.owner,
              description: ret.current.description,
              createdAt: ret.current.createdAt,
            });
          }
        } catch (ex) {
          console.log(ex);
        }
      }
    })();
  }, [
    isConnected,
    userAddress,
    address,
    transactionHash,
    network?.chain?.network,
  ]);

  return {
    data: data ? ret.current : undefined,
    error: errorMsg,
    loading: isLoading,
  };
};
