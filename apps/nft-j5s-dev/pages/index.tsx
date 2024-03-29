import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { NextPage } from "next";
import Link from "next/link";
import { Header } from "../components/header";
import { useGetFirstQueryParam } from "../components/util";
import { db } from "../db/db";
import { ContractItem } from "../components/collection/contract/ContractItem";
import { SearchField } from "../components/collection/SearchField";
import { NoContracts } from "../components/home/NoContracts";

const Home: NextPage = () => {
  const search = useGetFirstQueryParam("search");
  const networkParam = useGetFirstQueryParam("network");
  const [loading, setIsLoading] = useState(true);
  const contracts = useLiveQuery(() =>
    db.contracts.orderBy("createdAt").reverse().toArray()
  );

  useEffect(() => {
    if (typeof contracts?.length === "number") {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [contracts?.length]);

  return (
    <section className="text-gray-600 body-font flex flex-col min-h-screen">
      <Header>
        <SearchField defaultValue={search} network={networkParam} />
      </Header>
      <div className="bg-gray-100 flex-1">
        <section className="text-gray-600 body-font overflow-hidden flex flex-col px-2 md:px-0">
          <div className="container flex mx-auto py-6 justify-end">
            <div>
              <Link
                href="/deploy"
                className="flex-1 text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg disabled:opacity-25"
              >
                Deploy New Contract
              </Link>
            </div>
          </div>
          <div className="container  mx-auto">
            {!contracts?.length && !loading && <NoContracts />}
            {!!contracts?.length && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {contracts?.map((contract, index) => (
                  <ContractItem key={index} contract={contract} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Home;
