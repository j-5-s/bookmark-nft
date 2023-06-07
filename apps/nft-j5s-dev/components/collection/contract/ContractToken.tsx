import { useState, useEffect } from "react";
import type { NFTMetadata, NFTAttributes } from "../../../types";
import { getImageURIFromIPFS, trimHash } from "../../util";
import type { TokenChainData } from "../../../hooks/useFetchNFT";
import { EditContractToken } from "./EditContractToken";
import { useAccount, useNetwork } from "wagmi";
import { Address } from "../../utility/Address";
type ContractTokenProps = {
  data?: NFTMetadata | null;
  address: `0x${string}`;
  tokenURI?: string | null;
  tokenId?: bigint;
  tokenChainData?: TokenChainData | null;
};

export const ContractToken = (props: ContractTokenProps) => {
  const { data, tokenChainData, address, tokenId } = props;
  const { creator } = tokenChainData || {};
  const { name, image, description } = data || {};
  const imgUrl = getImageURIFromIPFS(image);
  const tokenURI = getImageURIFromIPFS(tokenChainData?.uri);
  const account = useAccount();
  const network = useNetwork();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner =
    mounted &&
    tokenChainData?.ownerOf &&
    tokenChainData?.ownerOf === account?.address;
  const attributes = data?.attributes.reduce((acc, attribute) => {
    return {
      ...acc,
      [attribute.trait_type]: attribute.value,
    };
  }, {} as Record<string, string>) as NFTAttributes;
  const ts = new Date(attributes?.Timestamp).toLocaleString();
  const [, ipfsHash] = (tokenChainData?.uri || "").split("//");
  const mintPath = `/mint?ipfsHash=${ipfsHash}&contractAddress=${address}&network=${network.chain?.network}`;
  return (
    <section className="py-6 container mx-auto px-2 md:px-0">
      <div className="flex justify-between mb-2 items-baseline">
        <div className="flex items-center">
          <div className="mr-1 h-full flex items-baseline">
            Contract{" "}
            <span className="text-gray-500 text-xs mr-2 ml-2">
              <Address href={`/address/${address}`} link trim>
                {address}
              </Address>
            </span>
            /
            <span className="text-gray-500  text-xs mr-2 ml-2">
              {tokenId?.toString()}
            </span>
          </div>
        </div>
        {!isOwner && (
          <div>
            <a
              href={mintPath}
              className="flex-1 text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg disabled:opacity-25"
            >
              Mint Clone
            </a>
          </div>
        )}
      </div>
      <div className="container mx-auto flex flex-col">
        <div className="">
          <div className="rounded-lg overflow-hidden border">
            {imgUrl && (
              <img
                alt="content"
                className="object-cover object-center h-full w-full"
                src={imgUrl}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-4 mb-4 gap-4">
            <div className="text-center sm:py-8 bg-white rounded shadow py-2">
              <div className="w-20 h-20 rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-10 h-10"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex flex-col items-center text-center justify-center">
                <h2 className="font-medium title-font mt-4 text-gray-900 text-lg">
                  <Address trim>{creator}</Address>
                </h2>
                <div className="w-12 h-1 bg-indigo-500 rounded mt-2 mb-4"></div>
                <p className="text-base">{name}</p>
                <p className="text-xs italic">{ts}</p>
              </div>
            </div>
            <div className=" border-gray-200 p-4  bg-white rounded shadow">
              <p className="leading-relaxed text-sm mb-4">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col border rounded bg-white p-4 text-xs mb-4">
          <h2 className="text-2xl font-medium text-gray-900 title-font mb-2">
            Meta data
          </h2>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">IPFS</div>
            <div className="w-3/4">
              <a
                target="_blank"
                rel="noreferrer"
                href={tokenURI || "#"}
                className="text-blue-500 hover:underline"
              >
                {trimHash(tokenChainData?.uri, 6, 4)}
              </a>
            </div>
          </div>
          {data?.attributes.map((attr, key) => (
            <div key={key} className="flex p-2 border-b border-gray-100 mb-2">
              <div className="w-1/4 tracking-widest title-font">
                {attr.trait_type}
              </div>
              <div className="w-3/4">
                {attr.trait_type === "address" ? (
                  <Address link trim>
                    {attr.value}
                  </Address>
                ) : (
                  attr.value
                )}
              </div>
            </div>
          ))}
        </div>
        {isOwner && (
          <EditContractToken
            tokenChainData={tokenChainData}
            address={address}
            tokenId={tokenId}
            metadata={data}
          />
        )}
      </div>
    </section>
  );
};
