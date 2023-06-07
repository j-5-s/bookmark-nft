import cs from "classnames";
import { getFirstQueryParam } from "../util";

type Props = {
  step: number;
};

export const Progress = (props: Props) => {
  const transactionHash = getFirstQueryParam("transactionHash");
  const contractAddress = getFirstQueryParam("contractAddress");
  const { step } = props;
  let deployed;
  if (step >= 3 && contractAddress) {
    deployed = `/deployed?transactionHash=${transactionHash}&contractAddress=${contractAddress}`;
  }

  return (
    <div className="container mx-auto">
      <div className="flex mx-auto  flex-wrap">
        <a
          href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
          target="_blank"
          rel="noreferrer"
          className={cs(
            "px-6 py-3 md:w-1/4 w-full justify-center sm:justify-start title-font font-medium hidden md:inline-flex items-center leading-none tracking-wider rounded-t",
            {
              "border-indigo-500": step === 1,
              "text-indigo-500": step === 1,
              "bg-gray-100": step === 1,
              "border-b-2": step === 1,
              hidden: step !== 1,
            }
          )}
        >
          1. Install Chrome Extension
        </a>
        <a
          href="/deploy"
          className={cs(
            "px-6 py-3  md:w-1/4 w-full  justify-center sm:justify-start title-font font-medium hidden md:inline-flex items-center leading-none tracking-wider rounded-t",
            {
              "border-indigo-500": step === 2,
              "text-indigo-500": step === 2,
              "bg-gray-100": step === 2,
              "border-b-2": step === 2,
              hidden: step !== 2,
            }
          )}
        >
          2. Deploy Contract
        </a>
        <a
          href={deployed}
          className={cs(
            "px-6 py-3  md:w-1/4 w-full justify-center sm:justify-start title-font font-medium md:inline-flex items-center leading-none tracking-wider rounded-t",
            {
              "border-indigo-500": step === 3,
              "text-indigo-500": step === 3,
              "bg-gray-100": step === 3,
              "border-b-2": step === 3,
              "opacity-50": step < 3,
              hidden: step !== 3,
            }
          )}
        >
          3. Install Meta Tag
        </a>
        <a
          className={cs(
            "px-6 py-3  md:w-1/4 w-full justify-center sm:justify-start title-font font-medium  md:inline-flex items-center leading-none tracking-wider rounded-t",
            {
              "border-indigo-500": step === 4,
              "text-indigo-500": step === 4,
              "border-b-2": step === 4,
              "bg-gray-100": step === 4,
              "opacity-50": step < 4,
              hidden: step !== 4,
            }
          )}
        >
          4. Mint NFT
        </a>
      </div>
    </div>
  );
};
