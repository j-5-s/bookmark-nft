import React, { ReactNode } from "react";
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

  return <>{children}</>;
};
