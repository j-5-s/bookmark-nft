import { useEffect } from "react";
import { useContractReads, useAccount, useNetwork, useBalance } from "wagmi";
import { db } from "../db/db";
import { BookmarkABI } from "@j5s/contracts";

type Props = {
  address?: `0x${string}` | undefined;
  importsContractToDB?: boolean;
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
  const { address, transactionHash, importsContractToDB = false } = props;

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

  const ret = {
    name: "",
    symbol: "",
    owner: "",
    totalTokens: "",
    creator: "",
    description: "",
    createdAt: 0,
    defaultClonePrice: BigInt(0),
    approvedMinters: [],
  } as ChainData;

  if (balance) {
    ret.balance = balance;
  }
  if (data) {
    ret.name = data[0].result as unknown as string;
    ret.symbol = data[1].result as unknown as string;
    ret.owner = data[2].result as unknown as string;
    // const balance = data[3].result as unknown as number;
    // if (balance) {
    //   ret.balanceOf = balance;
    // }
    const totalTokens = data[3].result as unknown as bigint;
    ret.totalTokens = totalTokens?.toString();

    ret.creator = data[4].result as unknown as string;
    ret.description = data[5].result as unknown as string;
    const createdAt = data[6].result as unknown as bigint;
    if (createdAt) {
      ret.createdAt = Number(createdAt) * 1000;
    }
    const defaultClonePrice = data[7].result as unknown as bigint;
    if (typeof defaultClonePrice !== "undefined") {
      ret.defaultClonePrice = BigInt(defaultClonePrice);
    }
    const approvedMinters = data[8].result as unknown as `0x${string}`[];
    ret.approvedMinters = approvedMinters;
  }

  // @todo better error handling.
  const status = data?.[0].status as unknown as string;
  if (status === "failure") {
    errorMsg = "Contract not found";
  }

  useEffect(() => {
    (async () => {
      if (
        ret?.name &&
        isConnected &&
        address &&
        userAddress &&
        network?.chain?.network &&
        importsContractToDB
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
              name: ret.name,
              network: network.chain.network,
              symbol: ret.symbol,
              creator: ret.creator,
              owner: ret.owner,
              description: ret.description,
              createdAt: ret.createdAt,
            });
            console.log(ret);
            console.log(id, "added to db");
          } else {
            // handle case where contract already exists in the DB
          }
        } catch (ex) {
          console.log(ex);
        }
      }
    })();
  }, [
    data,
    isConnected,
    userAddress,
    importsContractToDB,
    address,
    transactionHash,
    network?.chain?.network,
    // @todo ret
  ]);

  return {
    data: data ? ret : undefined,
    error: errorMsg,
    loading: isLoading,
  };
};
