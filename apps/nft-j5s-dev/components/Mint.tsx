import { useState, useEffect, useCallback } from "react";
import { useNetwork, useSwitchNetwork, useAccount } from "wagmi";
import { MintButton } from "./mint/MintButton";
import { NFTMetadata, NFTAttributes, Address, IpfsTokenURI } from "../types";
import { SlowImageLoader } from "./image/SlowImageLoader";
import { ContractAddressSelector } from "./mint/ContractAddressSelector";
import type { Contract } from "../db/db";
import type { ChainData } from "../hooks/useContract";
import { useRouter } from "next/router";
import { Trait } from "./mint/Trait";
import { TokenMeta, MintForm, SubmitData } from "./mint/MintForm";
import { trimHash } from "./util";

type Props = {
  nftMetadata: NFTMetadata;
  chainData?: ChainData;
  tokenURI: IpfsTokenURI;
  ipfsHash: string;
  contractAddress: Address;
  clone: boolean;
  tokenId: string;
};
export const Mint = ({
  nftMetadata,
  tokenURI,
  ipfsHash,
  contractAddress,
  chainData,
  clone = false,
  tokenId,
}: Props) => {
  const network = useNetwork();
  const router = useRouter();
  const { switchNetwork, chains } = useSwitchNetwork();
  const [loading, setIsLoading] = useState(false);
  const [tokenMeta, setTokenMeta] = useState<TokenMeta | null>(null);
  const account = useAccount();

  const updateContractQueryParam = (
    contractAddress: string,
    network?: string
  ) => {
    const query = {
      ...router.query,
      contractAddress,
      network: network || router.query.network,
    };
    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const attributes = nftMetadata.attributes.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.trait_type]: cur.value,
    };
  }, {}) as NFTAttributes;

  const [, imageIPFSHash] = nftMetadata.image.split("ipfs://");
  const image = `https://ipfs.io/ipfs/${imageIPFSHash}`;
  const value = {
    title: nftMetadata.name,
    url: attributes.URL,
    image,
    timestamp: attributes.Timestamp,
    text: attributes.Text,
    contractAddress,
  };

  const handleContractChange = (contract: Contract | undefined) => {
    if (contract?.network) {
      const chain = chains.find((chain) => chain.network === contract.network);
      updateContractQueryParam(contract?.address, chain?.network);
      if (chain && switchNetwork) {
        switchNetwork(chain.id);
      }
    }
  };

  const [error, setError] = useState<Error | null>(null);
  const handleError = useCallback(
    (error: Error) => {
      setError(error);
    },
    [setError]
  );
  const handleLoad = useCallback((tokenMeta: TokenMeta) => {
    setTokenMeta(tokenMeta);
  }, []);

  useEffect(() => {
    setError(null);
  }, [contractAddress, account.address]);

  const handleSubmit = useCallback(
    (data: SubmitData) => {
      setIsLoading(data.loading);
      if (data.success) {
        router.push(`/address/${contractAddress}`);
      }
    },
    [contractAddress, setIsLoading, router]
  );

  return (
    <MintForm
      tokenURI={tokenURI}
      url={value.url}
      chainData={chainData}
      contractAddress={contractAddress}
      tokenId={tokenId}
      clone={clone}
      className="container mx-auto flex py-6 md:flex-row flex-col"
      onError={handleError}
      onLoad={handleLoad}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col items-center px-2 md:px-0">
          <div className="w-full bg-white border rounded shadow px-2 pt-4 text-xs mb-4">
            <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">
              NFT Details
            </h2>
            <div className="flex border-b border-gray-200 py-2 items-center">
              <span className="w-1/4">Name</span>
              <span className="ml-auto text-gray-900 ">{nftMetadata.name}</span>
            </div>
            <div className="flex border-b border-gray-200 py-2 items-center">
              <span className="w-1/4 text-xs">Description</span>
              <span className="ml-auto text-gray-900 text-xs">
                {nftMetadata.description}
              </span>
            </div>
            <div className="flex border-b border-gray-200 py-2 items-center">
              <span className="w-1/4">Metadata (IPFS)</span>
              <span className="ml-auto text-gray-900">
                <a
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="text-blue-500 hover:underline text-xs"
                  href={`https://ipfs.io/ipfs/${ipfsHash}`}
                >
                  {trimHash(`ipfs://${ipfsHash}`, 9, 4)}
                </a>
              </span>
            </div>
            <div className="flex py-2  border-b border-gray-200  items-center mb-8">
              <span className="w-1/4">Image (IPFS)</span>
              <span className="ml-auto text-gray-900">
                <a
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="text-blue-500 hover:underline text-xs"
                  href={value.image}
                >
                  {trimHash(nftMetadata?.image, 9, 4)}
                </a>
              </span>
            </div>
            <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">
              Meta data
            </h2>
            <div className="mb-8">
              {nftMetadata.attributes.map((attr, index) => (
                <Trait key={index} trait={attr} />
              ))}
            </div>

            <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">
              Network Info
            </h2>
            <div className="flex border-b border-gray-200  py-2 items-center">
              <span className="w-1/4">Network</span>
              <span className="ml-auto text-gray-900">
                {network?.chain?.network}
              </span>
            </div>
            <div className="flex py-2 mb-2">
              <span className="text-gray-500 text-xs">Contract Address</span>
              <div className="ml-auto text-gray-900 flex">
                <ContractAddressSelector
                  defaultValue={value?.contractAddress}
                  onChange={handleContractChange}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col">
            {error && (
              <div className="border overflow-scroll text-xs mb-4 p-4 border-red-200 bg-gray-100">
                {error.message}
              </div>
            )}
            <MintButton
              defaultClonePrice={chainData?.defaultClonePrice}
              hasItemizedClonePrice={!!tokenMeta?.data?.hasItemizedClonePrice}
              disabled={!!error || loading || !contractAddress}
              clone={clone}
              value={tokenMeta?.data?.clonePrice}
              symbol={network?.chain?.nativeCurrency?.symbol}
            />
          </div>
        </div>
        <div className="mx-2  md:mx-0 flex items-end flex-col">
          <SlowImageLoader
            src={value.image}
            alt="hero"
            className="w-full rounded border"
          />
        </div>
      </div>
    </MintForm>
  );
};
