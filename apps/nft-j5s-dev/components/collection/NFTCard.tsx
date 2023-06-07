import { useFetchNFT } from "../../hooks/useFetchNFT";
import { getImageURIFromIPFS, getAttributesAsKeys } from "../util";
import { ImageComponent } from "../utility/Image";
type Props = {
  tokenId: bigint;
  contractAddress: `0x${string}`;
};
export const NFTCard = ({ tokenId, contractAddress }: Props) => {
  const { data, loading, error } = useFetchNFT({
    tokenId,
    contractAddress,
  });

  const imageURI = getImageURIFromIPFS(data?.image);
  const attributes = getAttributesAsKeys(data);
  const ts = attributes?.Timestamp;
  const date = new Date(ts).toLocaleString();

  return (
    <div className="w-full mb-4">
      <div className="h-full border-2 border-gray-200 border-opacity-60 rounded-lg overflow-hidden shadow">
        {imageURI && <ImageComponent src={imageURI} />}
        <div className="p-6">
          <h2 className="tracking-widest text-xs title-font font-medium text-gray-400 mb-1">
            {ts && date}
          </h2>
          <h1 className="title-font text-lg font-medium text-gray-900 mb-3">
            {data?.name}
          </h1>
          <p className="leading-relaxed mb-3">
            {data?.description || "No description"}
          </p>
          <p className="leading-relaxed mb-3">
            <a href={attributes?.URL} className="text-blue-500 hover:underline">
              {attributes?.URL || ""}
            </a>
          </p>
          <div className="flex items-center flex-wrap ">
            <a
              href={`/address/${contractAddress}/${tokenId.toString()}`}
              className="text-indigo-500 inline-flex items-center md:mb-2 lg:mb-0"
            >
              View
              <svg
                className="w-4 h-4 ml-2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
