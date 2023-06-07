import { ChangeEvent, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import cs from "classnames";
import { db } from "../../db/db";
import type { Contract } from "../../db/db";
import { trimHash, getUrl } from "../util";

type Props = {
  defaultValue: string;
  onChange: (contract: Contract | undefined) => void;
};

export const ContractAddressSelector = (props: Props) => {
  const { defaultValue, onChange } = props;
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const contracts = useLiveQuery(() => db.contracts.toArray());
  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const contract = contracts?.find(
      (contract) => contract.address === evt.target.value
    );
    if (onChange) {
      onChange(contract);
    }
    setSelectedValue(evt.target.value);
  };
  useEffect(() => {
    if (defaultValue) {
      const contract = contracts?.find(
        (contract) => contract.address === defaultValue
      );
      if (contract && typeof onChange) {
        onChange(contract);
      }
      setSelectedValue(defaultValue);
    }
  }, [defaultValue, contracts]);

  const chain = contracts?.find(({ address }) => address === selectedValue);
  const contractLink = getUrl({
    address: selectedValue,
    network: chain?.network,
  });

  return (
    <div
      className={cs("flex items-end flex-col", {
        "text-red-500": !defaultValue,
      })}
    >
      <div className="text-xs mr-2 flex">
        {chain && (
          <a
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
            href={contractLink}
          >
            {chain?.name} ({chain?.symbol})
          </a>
        )}
      </div>
      <select
        value={selectedValue}
        className="text-xs text-right"
        required
        onChange={handleChange}
      >
        {defaultValue && !chain && (
          <option value={defaultValue}>{defaultValue}</option>
        )}
        {!defaultValue && <option value="">Select a contract</option>}
        {contracts?.map((contract, index) => (
          <option value={contract.address} key={index}>
            {trimHash(contract.address, 6, 4)} - {contract.name}{" "}
            {contract.symbol}
          </option>
        ))}
      </select>
    </div>
  );
};
