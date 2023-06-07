import { useRouter } from "next/router";
import { NFTMetadata, NFTAttributes } from "../types";

export function getFirstQueryParam(key: string) {
  const router = useRouter();
  const param = router.query[key];

  if (Array.isArray(param)) {
    return String(param[0]);
  }

  return String(param || "");
}

type GetURLProps = {
  address?: string | `0x${string}`;
  tx?: string;
  network?: string;
  token?: string;
};
export function getUrl({ address, tx, network, token }: GetURLProps) {
  // `https://${testNet}etherscan.io/tx/${transactionHash}`
  let context;
  if (tx) {
    context = "tx";
  } else if (token) {
    context = "token";
  } else {
    context = "address";
  }
  if (!address && !tx) return "";
  let url;
  if (network === "maticmum") {
    url = `https://mumbai.polygonscan.com/${context}/${tx || address}`;
  } else if (network === "matic") {
    url = `https://polygonscan.com/${context}/${tx || address}`;
  } else if (network === "sepolia") {
    url = `https://${network}.etherscan.io/${context}/${tx || address}`;
  } else if (network === "ethereum") {
    url = `https://etherscan.io/${context}/${tx || address}`;
  }
  if (token) {
    url += "?a=" + token;
  }

  return url;
}

export const getAttributesAsKeys = (nftMetadata: NFTMetadata | null) => {
  return nftMetadata?.attributes.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.trait_type]: cur.value,
    };
  }, {}) as NFTAttributes;
};

export const getImageURIFromIPFS = (ipfsHash?: string) => {
  if (!ipfsHash) return null;
  const hash = ipfsHash.replace("ipfs://", "");
  // @todo loading

  return `https://ipfs.io/ipfs/${hash}`;
};

export const fetchData = async (ipfsHash: string) => {
  try {
    const hash = ipfsHash.replace("ipfs://", "");
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`);

    if (response.ok) {
      const data = await response.json();
      // Process the retrieved data here
      return data;
    } else {
      // Handle error response
    }
  } catch (error) {
    // Handle fetch error
  }
  return null;
};

export const trimHash = (
  hash?: `0x${string}` | string | null,
  prefix = 6,
  suffix = 6
) => {
  if (!hash) return "";
  return (
    hash.substring(0, prefix) + "..." + hash.substring(hash.length - suffix)
  );
};
