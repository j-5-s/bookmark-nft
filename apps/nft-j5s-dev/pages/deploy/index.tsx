import type { NextPage } from "next";
import { Header } from "../../components/header";
import { DeployContract } from "../../components/deploy/DeployContract";

const DeployPage: NextPage = () => {
  return (
    <section className="text-gray-600 body-font flex flex-col min-h-screen">
      <Header step={2}>
        <h1 className="">Deploy New Contract</h1>
      </Header>
      <div className="bg-gray-100 flex-1">
        <DeployContract />
      </div>
    </section>
  );
};

export default DeployPage;
