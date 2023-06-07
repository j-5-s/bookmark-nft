import { Header } from "../../../components/header";
import { useFetchNFT } from "../../../hooks/useFetchNFT";
import { getFirstQueryParam } from "../../../components/util";
import { ContractToken } from "../../../components/collection/contract/ContractToken";
import { SearchField } from "../../../components/collection/SearchField";

export default function NFTPage() {
  const tokenId = getFirstQueryParam("tokenId");
  const contractAddress = getFirstQueryParam("address");
  const { data, tokenURI, tokenChainData } = useFetchNFT({
    tokenId: BigInt(tokenId),
    contractAddress: contractAddress as `0x${string}`,
  });
  const search = getFirstQueryParam("search");
  const networkParam = getFirstQueryParam("network");
  // rest of your component logic goes here
  return (
    <section className="text-gray-600 body-font">
      <Header>
        <SearchField defaultValue={search} network={networkParam} />
      </Header>
      <div className="bg-gray-100 flex-1">
        <ContractToken
          data={data}
          tokenURI={tokenURI}
          tokenId={BigInt(tokenId)}
          address={contractAddress as `0x${string}`}
          tokenChainData={tokenChainData}
        />
      </div>
    </section>
  );
}
