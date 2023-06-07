import type { Contract } from "../../../db/db";

type ContractItemProps = {
  contract: Contract;
};

export const ContractItem = (props: ContractItemProps) => {
  const { contract } = props;
  const ts = new Date(contract.createdAt).toLocaleString();
  return (
    <div className="py-8 flex flex-wrap md:flex-nowrap bg-white px-4 border rounded shadow mb-2">
      <div className="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
        <span className="font-semibold title-font text-gray-700">
          {contract.network}
        </span>
        <span className="mt-1 text-gray-500 text-sm">{ts}</span>
      </div>
      <div className="md:flex-grow">
        <h2 className="text-2xl font-medium text-gray-900 title-font mb-2">
          {contract.name} ({contract.symbol})
        </h2>
        <p className="leading-relaxed">{contract.description}</p>
        <a
          href={`/address/${contract.address}?network=${contract.network}`}
          className="text-blue-500 hover:underline inline-flex items-center mt-4"
        >
          View More
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
  );
};
