import type { NextPage } from "next";
import { Header } from "../../components/header";
import { MetadataInstructions } from "../../components/deploy/MetadataInstructions";
import { useGetFirstQueryParam } from "../../components/util";
import { AddressString } from "../../types";
import { useContract } from "../../hooks/useContract";

const DeployedPage: NextPage = () => {
  const transactionHash = useGetFirstQueryParam(
    "transactionHash"
  ) as AddressString;
  const contractAddress = useGetFirstQueryParam(
    "contractAddress"
  ) as AddressString;

  useContract({
    address: contractAddress,
    transactionHash,
    importsContractToDB: true,
  });

  return (
    <section className="text-gray-600 body-font flex flex-col min-h-screen">
      <Header step={3}>
        <h1>Install Metadata</h1>
      </Header>

      <div className="bg-gray-100 flex-1">
        <MetadataInstructions
          transactionHash={transactionHash}
          contractAddress={contractAddress}
        />
      </div>
    </section>
  );
};

export default DeployedPage;
