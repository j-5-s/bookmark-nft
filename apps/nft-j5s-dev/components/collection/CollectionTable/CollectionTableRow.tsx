import { useFetchNFT } from "../../../hooks/useFetchNFT";
import { getAttributesAsKeys, getUrl, trimHash } from "../../util";
import type { ChainData } from "../../../hooks/useContract";
import { Address } from "../../utility/Address";
import { XCircle } from "../../icons/x-circle";
import { Check } from "../../icons/check";

type CollectionTableRowProps = {
  tokenId: bigint;
  contractAddress: `0x${string}`;
  network?: string;
  chainData?: ChainData;
};

export const CollectionTableRow = (props: CollectionTableRowProps) => {
  const { tokenId, contractAddress, network, chainData } = props;
  const { data, tokenURI, tokenChainData } = useFetchNFT({
    tokenId,
    contractAddress,
  });

  const tokenURL = getUrl({
    address: contractAddress,
    network,
    token: tokenId.toString(),
  });
  const attributes = getAttributesAsKeys(data);
  const ts = attributes?.Timestamp;
  const date = ts ? new Date(ts).toLocaleString() : "";
  const creatorLink = getUrl({
    address: chainData?.creator,
    network,
  });

  return (
    <tr>
      <td className="px-4 py-3">
        <a
          target="_blank"
          rel="noreferrer"
          href={tokenURL}
          className="text-blue-500 hover:underline"
        >
          [{tokenId.toString()}]
        </a>
      </td>
      <td className="px-4 py-3 overflow-scroll whitespace-nowrap max-w-[10rem]">
        <a
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline"
          href={attributes?.URL || "#"}
        >
          {attributes?.URL || ""}
        </a>
      </td>
      <td className="px-4 py-3 overflow-scroll whitespace-nowrap  max-w-[10rem]">
        {data?.name || ""}
      </td>
      <td className="px-4 py-3 max-w-xs overflow-scroll whitespace-nowrap">
        {date}
      </td>
      <td className="px-4 py-3">{attributes?.Viewport}</td>
      <td className="px-4 py-3">
        <a
          href={creatorLink}
          className="text-blue-500 hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          <Address trimPre={6} trimPost={4}>
            {tokenChainData?.creator}
          </Address>
        </a>
      </td>

      <td className="px-4 py-3">
        {tokenChainData?.isClone ? <XCircle /> : <Check />}
      </td>

      <td className="px-4 py-3">
        <a
          href={`/address/${contractAddress}/${tokenId.toString()}`}
          className="text-blue-500 hover:underline"
        >
          View
        </a>
      </td>
    </tr>
  );
};
