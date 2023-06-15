import React, { ReactNode } from "react";
import Head from "next/head";
interface IAppProvider {
  children: ReactNode;
  // Other props...
}

export const AppProvider: React.FC<IAppProvider> = ({ children }) => {
  // useEffect(() => {
  //   (async () => {
  //     const registration = await navigator.serviceWorker.register(
  //       "/service-worker.js"
  //     );
  //     console.log(registration);
  //   })();
  // }, []);

  return (
    <>
      <Head>
        <meta
          name="content-nft-address"
          content="0x7bb8bedd4a1106cf90cff35f8b11ea6a3d0661e9"
        />
        <meta name="nft-contract-network" content="maticmum" />
      </Head>
      {children}
    </>
  );
};
