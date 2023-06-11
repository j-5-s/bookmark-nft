import { useState, useEffect } from "react";
import { useAccount, useNetwork, useEnsAvatar } from "wagmi";
import { formatEther } from "viem";
import type { NFTMetadata, NFTAttributes } from "../../../types";
import { getImageURIFromIPFS, trimHash } from "../../util";
import type { TokenChainData } from "../../../hooks/useFetchNFT";
import { EditContractToken } from "./EditContractToken";
import { Address } from "../../utility/Address";
import { UserAgent } from "../../utility/UserAgent";
import { useContract } from "../../../hooks/useContract";
import { AddressImage } from "../../utility/AddressImage";

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

  const chainResponse = useContract({
    address,
  });

  console.log(chainResponse);

  const { data: contractData } = chainResponse;

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
  const mintPath = mounted
    ? `/mint?ipfsHash=${ipfsHash}&contractAddress=${address}&network=${
        network.chain?.network || ""
      }&tokenId=${tokenId}`
    : "#";

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

        <div>
          {!tokenChainData?.isClone && (
            <a
              href={mintPath}
              className="flex-1 text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg disabled:opacity-25"
            >
              Mint Clone
            </a>
          )}
          {tokenChainData?.isClone && (
            <a
              className="text-blue-500 hover:underline text-xs mr-2"
              href={`/address/${address}/${tokenChainData?.cloneOf?.toString()}}`}
            >
              Clone of {tokenChainData?.cloneOf?.toString()}
            </a>
          )}
        </div>
      </div>
      <div className="container mx-auto flex flex-col">
        <div className="">
          <div className="rounded-lg overflow-hidden border">
            {imgUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="content"
                className="object-cover object-center h-full w-full"
                src={imgUrl}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-4 mb-4 gap-4">
            <div className="text-center sm:py-8 bg-white rounded shadow py-2">
              <AddressImage address={creator} />

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
                {trimHash(tokenChainData?.uri, 11, 4)}
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
                ) : attr.trait_type === "User Agent" ? (
                  <UserAgent userAgent={attr.value} />
                ) : (
                  attr.value
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col border rounded bg-white p-4 text-xs mb-4">
          <h2 className="text-2xl font-medium text-gray-900 title-font mb-2">
            Contract Details
          </h2>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">Address</div>
            <div className="w-3/4">
              <Address link trim>
                {address}
              </Address>
            </div>
          </div>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">Name</div>
            <div className="w-3/4">{contractData?.name}</div>
          </div>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">Symbol</div>
            <div className="w-3/4">{contractData?.symbol}</div>
          </div>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">Total Tokens</div>
            <div className="w-3/4">{contractData?.totalTokens}</div>
          </div>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">Description</div>
            <div className="w-3/4">{contractData?.description}</div>
          </div>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">Owner</div>
            <div className="w-3/4">
              <Address link trim>
                {contractData?.owner}
              </Address>
            </div>
          </div>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">Creator</div>
            <div className="w-3/4">
              <Address link trim>
                {contractData?.creator}
              </Address>
            </div>
          </div>
          <div className="flex p-2 border-b border-gray-100 mb-2">
            <div className="w-1/4 tracking-widest title-font">
              Default Clone Price
            </div>
            <div className="w-3/4">
              {formatEther(BigInt(contractData?.defaultClonePrice || 0))}{" "}
              {mounted && network?.chain?.nativeCurrency?.symbol}
            </div>
          </div>
        </div>

        <EditContractToken
          tokenChainData={tokenChainData}
          address={address}
          tokenId={tokenId}
          metadata={data}
          isOwner={!!isOwner}
        />
      </div>
    </section>
  );
};
