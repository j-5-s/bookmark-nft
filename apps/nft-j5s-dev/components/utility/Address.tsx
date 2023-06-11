import { ReactNode, useState, useEffect } from "react";
import { useEnsName, useNetwork, useAccount } from "wagmi";
import { getUrl, trimHash } from "../util";
import { Check } from "../icons/check";
import { Tooltip } from "./Tooltip";
type AddressProps = {
  children: ReactNode;
  trimPre?: number;
  trimPost?: number;
  trim?: boolean;
  link?: boolean;
  href?: string;
};

export const Address = (props: AddressProps) => {
  const {
    children,
    trimPre = 0,
    trimPost = 0,
    trim = false,
    link = false,
    href,
  } = props;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fullAddress = children as `0x${string}`;
  let addr = children as string;

  if (trimPre || trimPost || trim) {
    addr = trimHash(addr, trimPre || 6, trimPost || 4);
  }
  const network = useNetwork();
  const account = useAccount();
  const { data } = useEnsName({
    address: fullAddress,
    chainId: 1,
  });
  if (data) {
    addr = data;
  }

  const isYou = fullAddress === account.address;

  if (!mounted) return null;
  if (link) {
    const url =
      href ||
      getUrl({
        network: network.chain?.network,
        address: fullAddress,
      });
    return (
      <div className="flex items-center">
        <a
          href={url}
          target={href ? "_self" : "_blank"}
          rel={href ? "" : "noopener noreferrer"}
          className=" text-blue-500 hover:underline"
        >
          {addr}
        </a>
        {isYou && (
          <Tooltip title="Thats you!" className="ml-2">
            <Check />
          </Tooltip>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center">
      {addr}
      {isYou && (
        <Tooltip title="Thats you!" className="ml-2">
          <Check />
        </Tooltip>
      )}
    </div>
  );
};
