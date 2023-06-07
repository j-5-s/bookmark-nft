import { useState, useEffect, FormEvent } from "react";
import { useNetwork } from "wagmi";
import { formatEther, formatGwei, parseEther, parseGwei } from "viem";

interface Props {
  initialValue: string;
  nativeUnit?: boolean;
  id: string;
  name: string;
  required?: boolean;
  onChange: (value: string) => void;
}

const getNativeValue = (value: string | number, nativeUnit: boolean) => {
  if (nativeUnit) {
    const gweiAsBitInt = parseGwei(`${value}` as `${number}`);
    return gweiAsBitInt.toString();
  }
  const asBigInt = parseEther(`${value}` as `${number}`);
  return asBigInt.toString();
};

export const InputPrice = (props: Props) => {
  const {
    onChange,
    initialValue,
    id,
    name,
    required,
    nativeUnit: nativeUnitProp = false,
  } = props;
  const [mounted, setMounted] = useState(false);
  const [stateValue, setStateValue] = useState<string>("");
  const [rawValue, setRawValue] = useState<string>("");
  const [nativeUnit, setNativeUnit] = useState(nativeUnitProp);
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    evt.preventDefault();
    const { value } = evt.target;

    setStateValue(value);
    if (value) {
      const val = getNativeValue(value, nativeUnit);
      setRawValue(val);
      onChange(val);
    } else {
      onChange("");
    }
  };

  useEffect(() => {
    if (mounted) return;
    setStateValue(`${initialValue}`);
    const val = getNativeValue(initialValue, nativeUnit);
    setRawValue(val);
    onChange(val);
  }, [initialValue, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (evt: FormEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!stateValue) return;
    if (nativeUnit) {
      const gweiAsBitInt = parseGwei(stateValue as `${number}`);
      const val = formatEther(gweiAsBitInt);
      // setRawValue(val.toString());
      setStateValue(val);
    } else {
      const etherAsBigInt = parseEther(stateValue as `${number}`);
      const val = formatGwei(etherAsBigInt);
      setStateValue(val);
    }
    setNativeUnit(!nativeUnit);
  };
  const network = useNetwork();
  const unitOfValue = nativeUnit
    ? "WEI" // @todo handle for other chains?
    : network?.chain?.nativeCurrency?.symbol;

  return (
    <div className="bg-white rounded border border-gray-300 w-full flex relative">
      <input
        required={required}
        onChange={handleChange}
        value={stateValue}
        type="number"
        id={id + "_vanity"}
        name={name + "_vanity"}
        className={
          "w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
        }
      />
      <div className="absolute right-0 h-full flex items-center">
        <button
          className="mr-4 w-16 border  bg-blue-500 text-white focus:outline-none hover:bg-blue-600 rounded px-2"
          onClick={handleSubmit}
        >
          {mounted && unitOfValue}
        </button>
        <input type="hidden" name={name} value={rawValue} id={id} />
      </div>
    </div>
  );
};
