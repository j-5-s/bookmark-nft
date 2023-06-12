import { useEffect } from "react";
import type { NextPage } from "next";
import { useSwitchNetwork } from "wagmi";
import { Header } from "../../components/header";
import { Collection } from "../../components/collection";
import { useGetFirstQueryParam } from "../../components/util";
import { SearchField } from "../../components/collection/SearchField";

const Search: NextPage = () => {
  const search = useGetFirstQueryParam("address");
  const networkParam = useGetFirstQueryParam("network");
  const urlParam = useGetFirstQueryParam("url");

  const { switchNetwork, chains } = useSwitchNetwork();

  useEffect(() => {
    if (networkParam && switchNetwork) {
      const chain = chains.find((c) => c.network === networkParam);
      if (chain) {
        switchNetwork(chain.id);
      }
    }
  }, [networkParam, chains, switchNetwork]);
  return (
    <section className="text-gray-600 body-font flex flex-col min-h-screen">
      <Header>
        <SearchField network={networkParam} />
      </Header>
      <div className="bg-gray-100 flex-1">
        {search && (
          <Collection address={search as `0x${string}`} url={urlParam} />
        )}
      </div>
    </section>
  );
};

export default Search;
