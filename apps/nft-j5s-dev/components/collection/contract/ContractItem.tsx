import Link from "next/link";
import { FormEvent } from "react";
import { db } from "../../../db/db";
import type { Contract } from "../../../db/db";
import { XCircle } from "../../icons/x-circle";

type ContractItemProps = {
  contract: Contract;
};

export const ContractItem = (props: ContractItemProps) => {
  const { contract } = props;
  const ts = new Date(contract.createdAt).toLocaleString();
  const handleDelete = (evt: FormEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    db.contracts.delete(contract.id as number);
  };
  return (
    <div className="relative  border rounded shadow bg-white p-4">
      <a
        href={`/address/${contract.address}?network=${contract.network}`}
        className=""
      >
        <div className="flex-grow text-left mb-2">
          <h2 className="text-xl font-medium text-gray-900 title-font mb-2">
            {contract.name} ({contract.symbol})
          </h2>
          <p className="leading-relaxed">{contract.description}</p>
        </div>
        <div className="mb-6 flex-shrink-0 flex flex-col">
          <span className="font-semibold title-font text-gray-700">
            {contract.network}
          </span>
          <span className="mt-1 text-gray-500 text-xs">{ts}</span>
        </div>
      </a>
      <div className="absolute top-0 right-0">
        <button onClick={handleDelete} className="mr-2 mt-2">
          <XCircle />
        </button>
      </div>
    </div>
  );
};
