import { ChangeEvent, useState, FormEvent, useEffect } from "react";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { BookmarkABI } from "@j5s/contracts";
import { formatEther } from "viem";
import QRCode from "react-qr-code";
import type { ChainData } from "../../hooks/useContract";
import { InputPrice } from "../form/InputPrice";
import { Address } from "../utility/Address";

type Props = {
  chainData?: ChainData;
  address: `0x${string}`;
};

export const EditContract = ({ chainData, address }: Props) => {
  const [editing, setEditing] = useState(false);
  const account = useAccount();
  const network = useNetwork();
  const [fields, setFields] = useState({
    description: chainData?.description,
    defaultClonePrice: chainData?.defaultClonePrice as bigint,
    approvedMinters: chainData?.approvedMinters,
  });
  const isOwner = chainData?.owner && chainData?.owner === account.address;
  const { data, isLoading, write } = useContractWrite({
    address,
    abi: BookmarkABI,
    functionName: "updateContract",
    args: [
      fields.description,
      fields.defaultClonePrice,
      fields.approvedMinters,
    ],
  });

  const { isLoading: isLoadingTx, isSuccess: isSuccessTx } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  const handleChange = (field: string) => {
    return (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({
        ...prev,
        [field]: evt.target.value,
      }));
    };
  };

  const handleClonePriceChange = (price: string) => {
    setFields((prev) => ({
      ...prev,
      defaultClonePrice: BigInt(price),
    }));
  };

  const handleMinterChange = (index: number) => {
    return (evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prevStat) => {
        const approvedMinters = [
          ...(prevStat.approvedMinters || []),
        ] as `0x${string}`[];
        approvedMinters[index] = evt.target.value as `0x${string}`;
        return {
          ...prevStat,
          approvedMinters,
        };
      });
    };
  };

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    //
    write?.();
    // setEditing(false);
  };
  useEffect(() => {
    if (!isLoadingTx && isSuccessTx) {
      setEditing(false);
    }
  }, [isLoadingTx, isSuccessTx]);
  return (
    <form
      onSubmit={handleSubmit}
      className=" bg-white rounded border border-gray-200 m-2 md:m-4 shadow flex flex-col justify-between"
    >
      <div>
        <div className="px-2 py-3 mb-2 justify-between border-b border-gray-200 w-full items-center">
          <div className="  font-bold">
            {chainData?.name} ({chainData?.symbol})
          </div>
          <div></div>
        </div>
        <div className="flex p-2 border-b border-gray-100 mb-2 mx-2 items-center">
          <div className="w-1/4 tracking-widest title-font ">
            Default Clone Price
          </div>
          <div className="flex-1">
            {!editing && formatEther(BigInt(fields.defaultClonePrice || 0))}
            {editing && (
              <InputPrice
                initialValue={formatEther(
                  BigInt(fields.defaultClonePrice || 0)
                )}
                id="defaultClonePrice"
                name="defaultClonePrice"
                required
                onChange={handleClonePriceChange}
              />
            )}
          </div>
        </div>
        <div className="flex p-2  border-b border-gray-100 mb-2 mx-2">
          <div className="w-1/4 tracking-widest title-font mb-2">
            Description
          </div>
          <div className="flex-1">
            {!editing && fields.description}
            {editing && (
              <textarea
                value={fields.description}
                onChange={handleChange("description")}
                className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 outline-none text-gray-700  px-2 leading-6 transition-colors duration-200 ease-in-out"
              />
            )}
          </div>
        </div>
        <div className="flex p-2 border-b border-gray-100 mb-2 mx-2">
          <div className="w-1/4 tracking-widest title-font mb-2">
            Approved Minters
          </div>

          <div className="flex flex-col flex-1 items-start">
            {!editing &&
              fields.approvedMinters?.map((minter, key) => (
                <Address key={key} link trimPre={6} trimPost={4}>
                  {minter}
                </Address>
              ))}
            {editing &&
              fields.approvedMinters?.map((minter, key) => (
                <div
                  key={key}
                  className="flex items-center w-full justify-center mb-2"
                >
                  <input
                    type="text"
                    className="flex-1  bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 outline-none text-gray-700 px-2 leading-6 transition-colors duration-200 ease-in-out"
                    key={key}
                    value={minter}
                    onChange={handleMinterChange(key)}
                  />
                  <button
                    className="ml-2"
                    onClick={(evt) => {
                      evt.preventDefault();
                      setFields((prevState) => ({
                        ...prevState,
                        approvedMinters: [
                          ...(prevState.approvedMinters?.slice(0, key) || []),
                          ...(prevState.approvedMinters?.slice(key + 1) || []),
                        ],
                      }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            {editing && (
              <button
                onClick={(evt) => {
                  evt.preventDefault();
                  setFields((prevState) => ({
                    ...prevState,
                    approvedMinters: [
                      ...(prevState.approvedMinters as `0x${string}`[]),
                      "" as `0x${string}`,
                    ],
                  }));
                }}
              >
                + Minter
              </button>
            )}
          </div>
        </div>
        {!editing && (
          <div className="flex p-2 border-b border-gray-100 mb-2 mx-2">
            <div className="w-1/4 tracking-widest title-font mb-2">Export</div>

            <div className="flex flex-col flex-1 items-start">
              <QRCode
                size={128}
                value={`https://metamask.app.link/dapp/nft.j5s.dev/address/${address}?import=true&network=${network?.chain?.network}`}
              />
            </div>
          </div>
        )}
      </div>
      {isOwner && (
        <div className="flex border-t w-full px-4 py-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="w-24 text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg disabled:opacity-25"
            >
              Edit
            </button>
          )}
          {editing && (
            <button
              disabled={isLoading || isLoadingTx}
              type="submit"
              className="min-w-24 mr-2 flex items-center text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded text-lg disabled:opacity-25"
            >
              Save {(isLoading || isLoadingTx) && "..."}
            </button>
          )}
          {editing && (
            <button
              disabled={isLoading || isLoadingTx}
              onClick={() => setEditing(false)}
              className="min-w-24 flex items-center text-blue-500 border-blue-500  border py-2 px-6 focus:outline-none hover:bg-gray-100 rounded text-lg disabled:opacity-25"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );
};
