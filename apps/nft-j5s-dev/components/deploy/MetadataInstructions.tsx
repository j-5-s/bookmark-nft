import { useEffect, useState } from "react";
import Image from "next/image";
import { useNetwork } from "wagmi";
import { Address } from "../utility/Address";

type Props = {
  transactionHash?: `0x${string}`;
  contractAddress?: `0x${string}`;
};

export const MetadataInstructions = (props: Props) => {
  const network = useNetwork();
  const [networkState, setNetworkState] = useState<string>();
  const { contractAddress } = props;
  const metaTagHtml = `<meta name="nft_contract_address" content="${contractAddress}" />
<meta name="nft_contract_network" content="${network?.chain?.network}" />`;
  useEffect(() => {
    setNetworkState(network?.chain?.network);
  }, [network?.chain?.network]);
  return (
    <div className="py-6 px-2 md:px-0">
      <section className="container mx-auto">
        <div className=" grid grid-cols-1 xl:grid-cols-2 gap-4 bg-white p-4 border rounded mb-6">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-2">
              Next Steps
            </h2>
            <p className="mb-4 text-center">
              Visit any website and click the Chrome extension to can create a
              Bookmark NFT.
            </p>
          </div>
          <div className="">
            <div className="flex w-full flex-col items-center xl:items-end">
              <div className="border border-gray-200 rounded mb-4 flex flex-col justify-end shadow">
                <Image
                  width={500}
                  height={328}
                  className="object-cover object-center  "
                  alt="hero"
                  src="/popup-example.png"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 bg-white p-4 border rounded mb-6">
          <div className=" flex flex-col  items-center text-left">
            <div className="w-full mb-12">
              <p className="mb-4 leading-relaxed border-b">
                Install the meta tags:
              </p>
              <p className="text-xs mb-4">
                If you would like to add the meta tags to your website, you can
                copy and paste the following code into the head of your HTML.
                This will let users know you have bookmarked NFTs available.
              </p>
              <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-2">
                Meta Tag:
              </h2>
              <div className=" flex border-b border-gray-200 w-full items-center">
                <span className="text-gray-500">name</span>
                <span className="ml-auto text-gray-900 text-xs">
                  nft_contract_address
                </span>
              </div>
              <div className="flex border-b border-gray-200 py-2 w-full items-center mb-8">
                <span className="text-gray-500">value</span>
                <span className="ml-auto text-gray-900 text-xs">
                  <Address link>{contractAddress}</Address>
                </span>
              </div>

              <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-2">
                Meta Tag:
              </h2>
              <div className=" flex border-b border-gray-200 w-full items-center">
                <span className="text-gray-500">name</span>
                <span className="ml-auto text-gray-900 text-xs">
                  nft_contract_network
                </span>
              </div>
              <div className="flex border-b border-gray-200 py-2 w-full items-center mb-8">
                <span className="text-gray-500">value</span>
                <span className="ml-auto text-gray-900 text-xs">
                  {networkState}
                </span>
              </div>
              <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-1">
                Example
              </h2>
              <div className="flex justify-center flex-col w-full mb-8">
                <textarea
                  value={metaTagHtml}
                  disabled
                  className="bg-gray-200 rounded p-2 w-full text-xs border border-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="">
            <div className="flex w-full flex-col items-center xl:items-end">
              <div className="border border-gray-200 rounded mb-4 flex flex-col justify-end shadow">
                <Image
                  width={500}
                  height={328}
                  className="object-cover object-center  "
                  alt="hero"
                  src="/metatag.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
